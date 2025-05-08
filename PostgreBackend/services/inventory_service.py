from tempfile import NamedTemporaryFile
from typing import List, Dict, Any, Optional
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
        stmt = stmt.where(Inventory.branch_id == branch_id)
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
        rec = {"id": inv.id, "company_name": company_name, "branch_name": branch_name}
        for k, v in (inv.details or {}).items():
            rec[k] = v
            all_keys.add(k)
        records.append(rec)

    # Excel başlık
    header = ["id", "company_name", "branch_name"] + sorted(all_keys)
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

    # 1) Excel’i oku
    df = pd.read_excel(file.file)
    df = df.where(pd.notnull(df), None)

    if "branch_name" not in df.columns:
        raise ValueError("Excel dosyasında 'branch_name' sütunu yok.")

    # 2) Dynamic detay sütunları
    detail_cols = [c for c in df.columns if c != "branch_name"]

    added = updated = skipped = 0
    skipped_branches: List[str] = []

    # 3) Satır satır işle
    for _, row in df.iterrows():
        bname = row["branch_name"]
        # Şubeyi bul
        q = select(Branch).where(Branch.branch_name == bname)
        res = await db.execute(q)
        branch = res.scalars().first()
        if not branch:
            skipped += 1
            skipped_branches.append(bname)
            continue

        # Envanter var mı?
        q2 = select(Inventory).where(Inventory.branch_id == branch.id)
        res2 = await db.execute(q2)
        inv = res2.scalars().first()

        # Yeni detay dict’i
        new_details = {
            col: row[col]
            for col in detail_cols
            if row[col] is not None
        }

        if inv:
            # Merge: var olansa korunur, yeni/güncelleme gelen override eder
            merged = {**inv.details, **new_details}
            if merged != inv.details:
                inv.details = merged
                updated += 1
        else:
            # Yeni envanter
            to_create = Inventory(branch_id=branch.id, details=new_details)
            db.add(to_create)
            added += 1

    # 4) Commit
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