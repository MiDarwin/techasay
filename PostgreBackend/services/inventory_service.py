import re
from tempfile import NamedTemporaryFile
from typing import List, Dict, Any, Optional

import unicodedata
from dateutil import parser

from models.company import Company
import pandas as pd
from openpyxl import Workbook
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.inventory import Inventory
from models.branch import Branch
from schemas.inventory import InventoryOut, InventoryCreateBody
from sqlalchemy import or_, cast, String
from sqlalchemy import func
from datetime import datetime
# Türkçe harf tabloları
_TR_LOWER = str.maketrans("Iİ", "ıi")      # I→ı, İ→i
_TR_UPPER = {"i": "İ", "ı": "I"}           # i→İ, ı→I
DEV_RE = re.compile(r"^[0-9A-F]{14,16}$", re.I)     # DevEUI mi, ölçüm mü?
SENSORS = {"TH1", "TH2", "CO2", "EC", "Outdoor TH"} # satır filtrelemede kullan
async def get_inventories(
    db: AsyncSession,
    branch_id: Optional[int] = None,
    company_id: Optional[int] = None,
    limit: Optional[int] = None,
    q:Optional[str]   = None,
) -> List[InventoryOut]:
    """
    branch_id ile (öncelikli) veya company_id ile
    (branch.company_id filtresi) envanterleri çeker.
    limit ile kayıt sayısını sınırlandırır.
    """
    stmt = (
        select(Inventory, Branch.branch_name.label("branch_name"))
        .join(Branch, Inventory.branch_id == Branch.id)
    )

    if branch_id is not None:
          # hem seçilen şubeyi hem de onun alt şubelerini al
            stmt = stmt.where(
                    or_(
                            Inventory.branch_id == branch_id,
                            Branch.parent_branch_id == branch_id
            )
        )
    elif company_id is not None:
        stmt = stmt.where(Branch.company_id == company_id)
    else:
        # Hiç filtre yoksa boş liste
        return []
    if q:
            pattern = f"%{q}%"
            stmt = stmt.where(
                    or_(
                            Branch.branch_name.ilike(pattern),
              # JSONB'i text'e çevirip içinde arama
                            cast(Inventory.details, String).ilike(pattern)
            )
        )
    if limit:
        stmt = stmt.limit(limit)

    result = await db.execute(stmt)
    rows = result.all()
    return [
        InventoryOut(
            id=inv.id,
            branch_id=inv.branch_id,
            branch_name=branch_name,
            details=inv.details,
            created_date=inv.created_date,
            updated_date=inv.updated_date
        )
        for inv, branch_name in rows
    ]
async def count_inventories(
    db: AsyncSession,
    branch_id:  Optional[int] = None,
    company_id: Optional[int] = None,
    q:          Optional[str] = None
) -> int:
    stmt = select(func.count()).select_from(Inventory).join(Branch)
    if branch_id is not None:
        stmt = stmt.where(Inventory.branch_id == branch_id)
    elif company_id is not None:
        stmt = stmt.where(Branch.company_id == company_id)
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(
            or_(
               Branch.branch_name.ilike(pattern),
               cast(Inventory.details, String).ilike(pattern)
            )
        )
    res = await db.execute(stmt)
    return res.scalar_one()
async def create_inventory(db: AsyncSession, inv_in: InventoryCreateBody) -> InventoryOut:
    # varsa varolanı çek
    q = select(Inventory).where(Inventory.branch_id == inv_in.branch_id)
    res = await db.execute(q)
    if res.scalars().first():
        raise ValueError("Bu şube için envanter zaten oluşturulmuş.")
    # yoksa oluştur
    new = Inventory(branch_id=inv_in.branch_id, details=inv_in.details)
    db.add(new)
    await db.commit()
    await db.refresh(new)
    # branch_name almak için
    branch = await db.get(Branch, new.branch_id)
    return InventoryOut(
        id=new.id,
        branch_id=new.branch_id,
        branch_name=branch.branch_name if branch else "",
        details=new.details,
        created_date=new.created_date,
        updated_date=new.updated_date
    )
async def update_inventory(
    db: AsyncSession,
    inventory_id: int,
    details: Dict[str, Any]       # <-- Bu parametre eksikti, ekliyoruz
) -> InventoryOut:
    inv = await db.get(Inventory, inventory_id)
    if not inv:
        raise ValueError("Envanter kaydı bulunamadı.")

    # Yeni gelen detayları doğrudan kaydet
    inv.details = details
    await db.commit()
    await db.refresh(inv)

    # branch_name eklemek için
    branch = await db.get(Branch, inv.branch_id)
    return InventoryOut(
        id=inv.id,
        branch_id=inv.branch_id,
        branch_name=branch.branch_name if branch else "",
        details=inv.details,
        created_date=inv.created_date,
        updated_date=inv.updated_date
    )
async def generate_inventory_excel(
    db: AsyncSession,
    branch_ids: Optional[List[int]] = None,
    company_id: Optional[int] = None
) -> str:
    """
    Envanter kayıtlarını branch veya company bazlı alır,
    company_name ve branch_name ile birlikte Excel'e yazar.
    """
    # Temel SELECT
    stmt = (
        select(
            Inventory,
            Branch.branch_name.label("branch_name"),
            Company.name.label("company_name")
        )
        .join(Branch, Inventory.branch_id == Branch.id)
        .join(Company, Branch.company_id == Company.company_id)
    )
    # Şube bazlı filtre
    if branch_ids:
        stmt = stmt.where(Inventory.branch_id.in_(branch_ids))
    # Company bazlı filtre (branch_ids yoksa)
    elif company_id:
        stmt = stmt.where(Branch.company_id == company_id)

    result = await db.execute(stmt)
    rows = result.all()  # her satır: (Inventory, branch_name, company_name)

    # JSONB key'lerini topla
    all_keys = set()
    records = []
    for inv, branch_name, company_name in rows:
        rec = { "company_name": company_name, "branch_name": branch_name}
        for k, v in (inv.details or {}).items():
            rec[k] = v
            all_keys.add(k)
        records.append(rec)

    # Excel başlık
    header = ["company_name", "branch_name"] + sorted(all_keys)
    wb = Workbook()
    ws = wb.active
    ws.title = "Envanter"
    ws.append(header)
    for rec in records:
        ws.append([rec.get(col) for col in header])

    # Geçici dosyaya kaydet
    tmp = NamedTemporaryFile(delete=False, suffix=".xlsx")
    wb.save(tmp.name)
    tmp.close()
    return tmp.name
async def import_inventory_from_excel(
    db: AsyncSession,
    file
) -> Dict[str, Any]:
    # 1) Excel’i oku ve NaN→None
    df = pd.read_excel(file.file, dtype=str)
    df = df.where(pd.notnull(df), None)

    # Zorunlu sütun kontrolü
    for required in ("company_name", "branch_name"):
        if required not in df.columns:
            raise ValueError(f"Excel dosyasında '{required}' sütunu yok.")

    # 2) Detay sütunları: company_name ve branch_name hariç
    detail_cols = [
        c for c in df.columns
        if c not in ("company_name", "branch_name")
    ]

    added = updated = skipped = 0
    skipped_branches: List[str] = []

    for _, row in df.iterrows():
        # Şubeyi company_name + branch_name ile eşle
        q = (
            select(Branch)
            .join(Company)
            .where(
                Company.name == row["company_name"],
                Branch.branch_name == row["branch_name"]
            )
        )
        res = await db.execute(q)
        branch = res.scalars().first()
        if not branch:
            skipped += 1
            skipped_branches.append(f"{row['company_name']} / {row['branch_name']}")
            continue

        # Var olan envanter
        q2 = select(Inventory).where(Inventory.branch_id == branch.id)
        inv = (await db.execute(q2)).scalars().first()

        # 3) Sadece gerçek değer içeren detaylar
        new_details = {}
        for col in detail_cols:
            val = row.get(col)
            if val is None or (isinstance(val, str) and not val.strip()):
                continue
            new_details[col] = val

        if inv:
            merged = {**inv.details, **new_details}
            if merged != inv.details:
                inv.details = {k: (v.get("reading") if isinstance(v, dict) and "reading" in v else v)
                               for k, v in merged.items()}
                inv.updated_date = datetime.now()
                updated += 1
        else:
            to_create = Inventory(branch_id=branch.id, details=new_details)
            db.add(to_create)
            added += 1

    if added + updated > 0:
        await db.commit()

    return {
        "added": added,
        "updated": updated,
        "skipped": skipped,
        "skipped_branches": skipped_branches
    }
async def get_inventory_fields_by_company(
    db: AsyncSession,
    company_id: int
) -> List[str]:

    # Inventory.details ve Branch join
    stmt = (
        select(Inventory.details)
        .join(Branch, Inventory.branch_id == Branch.id)
        .where(Branch.company_id == company_id)
    )

    result = await db.execute(stmt)
    records = result.scalars().all()  # her biri bir dict ya da None

    fields = set()
    for details in records:
        if isinstance(details, dict):
            fields.update(details.keys())

    return sorted(fields)
def tr_title(text: str):
    if not isinstance(text, str):
        return text

    # 1) Unicode birleşik/kombine normalize et
    text = unicodedata.normalize("NFKC", text)

    # 2) Kelimeleri tek tek dönüştür
    words, out = text.strip().split(), []
    for w in words:
        w = w.translate(_TR_LOWER).lower()     # önce doğru “küçült”
        if not w:
            continue
        first = _TR_UPPER.get(w[0], w[0].upper())
        out.append(first + w[1:])
    return " ".join(out)
async def import_inventory_for_company(
    db: AsyncSession,
    file,
    company_id: int
) -> Dict[str, Any]:
    """
    Excel’den envanter yükle (yalnız alt-şube oluşturabilir).
    Data sayfasındaki “Kurulum Tarihi” alanı, Inventory.created_date’e yazılır.
    Tarih yoksa / parse edilemezse created_date = now().
    """

    # -----------------------------------------------------------
    # Sayaçlar
    # -----------------------------------------------------------
    added = updated = skipped = 0
    skipped_branches: List[str] = []

    # -----------------------------------------------------------
    # Yardımcı – normalizasyon
    # -----------------------------------------------------------
    norm = lambda x: tr_title(x)

    # -----------------------------------------------------------
    # 1)  Data sayfası  (Sadece ana şube günceller + created_date işle)
    # -----------------------------------------------------------
    df_main = pd.read_excel(
        file.file, sheet_name="Data", dtype=str, engine="openpyxl"
    ).where(pd.notnull, None)
    df_main.columns = [c.strip() for c in df_main.columns]

    if "Çiftlik Adı" not in df_main.columns:
        raise ValueError("Data sayfasında 'Çiftlik Adı' sütunu yok.")

    df_main["Çiftlik Adı"] = df_main["Çiftlik Adı"].apply(norm)

    # --- Kurulum Tarihi kontrolü ---
    has_install = "Kurulum Tarihi" in df_main.columns
    if has_install:
        df_main["Kurulum Tarihi"] = df_main["Kurulum Tarihi"].apply(
            lambda x: x.strip() if isinstance(x, str) else x
        )

    # Detay sütunları (Kurulum Tarihi detaya eklenmesin)
    detail_cols_main = [
        c for c in df_main.columns if c not in ("Çiftlik Adı", "Kurulum Tarihi")
    ]

    for _, row in df_main.iterrows():
        bname = row["Çiftlik Adı"]
        if not bname:
            continue

        # Ana şube VAR MI?
        q = select(Branch).where(
            Branch.company_id == company_id,
            Branch.branch_name == bname,
            Branch.parent_branch_id.is_(None),
        )
        branch = (await db.execute(q)).scalars().first()
        if not branch:
            skipped += 1
            skipped_branches.append(f"{bname} (ana şube bulunamadı)")
            continue

        # -------- yeni detaylar --------
        new_details = {
            col: val
            for col, val in row.items()
            if col in detail_cols_main and val not in (None, "", " ")
        }

        # -------- kurulum tarihi --------
        install_date = None
        if has_install and row.get("Kurulum Tarihi"):
            try:
                install_date = parser.parse(row["Kurulum Tarihi"], dayfirst=True)
            except (parser.ParserError, TypeError, ValueError):
                install_date = None

        # -------- inventory işlem --------
        q_inv = select(Inventory).where(Inventory.branch_id == branch.id)
        inv = (await db.execute(q_inv)).scalars().first()

        if inv:
            merged = {**inv.details, **new_details}
            changed = False

            if merged != inv.details:
                inv.details = merged
                changed = True

            # kurulum tarihi güncelle (varsa)
            if install_date and inv.created_date != install_date:
                inv.created_date = install_date
                changed = True

            if changed:
                inv.updated_date = datetime.now()
                updated += 1
            else:
                skipped += 1
        else:
            inv_created_date = install_date or datetime.now()
            db.add(
                Inventory(
                    branch_id=branch.id,
                    details=new_details,
                    created_date=inv_created_date,
                )
            )
            added += 1

    # -----------------------------------------------------------
    # 2)  Database sayfası  (alt-şube oluştur / güncelle)
    # -----------------------------------------------------------
    df_sub = (
        pd.read_excel(file.file, sheet_name="Database", dtype=str, engine="openpyxl")
        .where(pd.notnull, None)
    )
    df_sub.columns = [c.strip() for c in df_sub.columns]

    for required in ("Çiftlik Adı", "Kümes"):
        if required not in df_sub.columns:
            raise ValueError(f"Database sayfasında '{required}' sütunu yok.")

    df_sub["Çiftlik Adı"] = df_sub["Çiftlik Adı"].apply(norm)
    df_sub["Kümes"] = df_sub["Kümes"].apply(norm)

    has_prod_date = "Üretim Tarihi" in df_sub.columns
    if has_prod_date:
        df_sub["Üretim Tarihi"] = df_sub["Üretim Tarihi"].apply(
            lambda x: x.strip() if isinstance(x, str) else x
        )

    detail_cols_sub = [
        c for c in df_sub.columns if c not in ("Çiftlik Adı", "Kümes", "Üretim Tarihi")
    ]

    for _, row in df_sub.iterrows():
        main_name = row["Çiftlik Adı"]
        cage_name = row["Kümes"]
        if not main_name or not cage_name:
            continue

        q_main = select(Branch).where(
            Branch.company_id == company_id,
            Branch.branch_name == main_name,
            Branch.parent_branch_id.is_(None),
        )
        main_branch = (await db.execute(q_main)).scalars().first()
        if not main_branch:
            skipped += 1
            skipped_branches.append(f"{main_name} / {cage_name} (ana yok)")
            continue

        q_sub = select(Branch).where(
            Branch.parent_branch_id == main_branch.id,
            Branch.branch_name == cage_name,
        )
        sub = (await db.execute(q_sub)).scalars().first()
        if not sub:
            sub = Branch(
                company_id=None,
                parent_branch_id=main_branch.id,
                branch_name=cage_name,
            )
            db.add(sub)
            await db.flush()

        production_date = None
        if has_prod_date and row.get("Üretim Tarihi"):
            try:
                production_date = parser.parse(row["Üretim Tarihi"])
            except (parser.ParserError, ValueError, TypeError):
                production_date = None

        new_details = {
            col: val
            for col, val in row.items()
            if col in detail_cols_sub and val not in (None, "", " ")
        }

        q_inv2 = select(Inventory).where(Inventory.branch_id == sub.id)
        inv2 = (await db.execute(q_inv2)).scalars().first()

        if inv2:
            changed = False
            merged2 = {**inv2.details, **new_details}
            if merged2 != inv2.details:
                inv2.details = merged2
                changed = True
            if production_date and inv2.created_date != production_date:
                inv2.created_date = production_date
                changed = True
            if changed:
                inv2.updated_date = datetime.now()
                updated += 1
            else:
                skipped += 1
        else:
            db.add(
                Inventory(
                    branch_id=sub.id,
                    details=new_details,
                    created_date=production_date or datetime.now(),
                )
            )
            added += 1

    # -----------------------------------------------------------
    # COMMIT & ÖZET
    # -----------------------------------------------------------
    if added + updated:
        await db.commit()

    return {
        "added": added,
        "updated": updated,
        "skipped": skipped,
        "skipped_branches": skipped_branches,
    }