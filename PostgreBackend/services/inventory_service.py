from tempfile import NamedTemporaryFile
from typing import List, Dict, Any

import pandas as pd
from openpyxl import Workbook
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.inventory import Inventory
from models.branch import Branch
from schemas.inventory import InventoryOut, InventoryCreateBody


async def get_inventory_by_branch(db: AsyncSession, branch_id: int) -> list[InventoryOut]:
    """
    Bu branch_id için envanter kayıtlarını, branch_name ile birlikte döner.
    """
    stmt = (
        select(
            Inventory,
            Branch.branch_name.label("branch_name")
        )
        .join(Branch, Inventory.branch_id == Branch.id)
        .where(Inventory.branch_id == branch_id)
    )

    result = await db.execute(stmt)
    rows = result.all()  # her satır: (Inventory instance, branch_name str)

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
    new_details: dict
) -> InventoryOut:
    inv = await db.get(Inventory, inventory_id)
    if not inv:
        raise ValueError("Envanter kaydı bulunamadı.")
    # mevcut JSONB kopyasını al
    merged = {**inv.details}
    # gönderilen her alanı güncelle
    for key, val in new_details.items():
        merged[key] = val
    # commit ancak gerçekten değiştiyse
    if merged != inv.details:
        inv.details = merged
        await db.commit()
        await db.refresh(inv)
    # branch_name ekle
    branch = await db.get(Branch, inv.branch_id)
    return InventoryOut(
        id=inv.id,
        branch_id=inv.branch_id,
        branch_name=branch.branch_name if branch else "",
        details=inv.details,
        created_date=inv.created_date,
        updated_date=inv.updated_date
    )
async def generate_inventory_excel(db: AsyncSession) -> str:

    stmt = (
        select(Inventory, Branch.branch_name.label("branch_name"))
        .join(Branch, Inventory.branch_id == Branch.id)
    )
    result = await db.execute(stmt)
    rows = result.all()  # liste of (Inventory, branch_name)

    # 2) JSONB içindeki tüm key’leri topla
    all_keys = set()
    records = []
    for inv, branch_name in rows:
        rec = {"id": inv.id, "branch_name": branch_name}
        for k, v in inv.details.items():
            rec[k] = v
            all_keys.add(k)
        records.append(rec)

    # 3) Excel başlığı ve içerik
    header = ["id", "branch_name"] + sorted(all_keys)
    wb = Workbook()
    ws = wb.active
    ws.title = "Envanter"
    ws.append(header)
    for rec in records:
        ws.append([rec.get(col) for col in header])

    # 4) Geçici dosyaya kaydet
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