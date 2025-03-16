from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, join
from models.inventory import Inventory
from schemas.inventory import InventoryCreate, InventoryResponse
from models.branch import Branch  # Branch modelini içe aktarın
from models.company import Company
from typing import Optional  # Bunu ekleyin

async def create_inventory(db: AsyncSession, branch_id: int, inventory: InventoryCreate):
    db_inventory = Inventory(
        device_type=inventory.device_type,
        device_model=inventory.device_model,
        quantity=inventory.quantity,
        specs=inventory.specs,
        branch_id=branch_id  # URL'den alınan branch_id
    )
    db.add(db_inventory)
    await db.commit()
    await db.refresh(db_inventory)
    return InventoryResponse.from_orm(db_inventory)

async def get_inventory_by_branch(db: AsyncSession, branch_id: int):
    query = (
        select(Inventory, Branch.branch_name)
        .join(Branch, Inventory.branch_id == Branch.id)
        .filter(Inventory.branch_id == branch_id)
    )
    result = await db.execute(query)
    rows = result.all()

    # InventoryResponse'a branch_name eklenerek dönülüyor
    return [
        InventoryResponse(
            id=row.Inventory.id,
            device_type=row.Inventory.device_type,
            device_model=row.Inventory.device_model,
            quantity=row.Inventory.quantity,
            specs=row.Inventory.specs,
            branch_id=row.Inventory.branch_id,
            branch_name=row.branch_name,  # Şube adı
        )
        for row in rows
    ]

async def delete_inventory(db: AsyncSession, inventory_id: int):
    query = select(Inventory).filter(Inventory.id == inventory_id)
    result = await db.execute(query)
    db_inventory = result.scalars().first()
    if db_inventory:
        await db.delete(db_inventory)
        await db.commit()
        return db_inventory
    return None
async def get_all_inventory(db: AsyncSession, limit: int = 50, company_name: Optional[str] = None, branch_name: Optional[str] = None):
    # Baz sorgu: Inventory, Branch ve Company tablosunu birleştiriyoruz
    query = (
        select(Inventory, Branch.branch_name, Company.name.label("company_name"))
        .join(Branch, Inventory.branch_id == Branch.id)
        .join(Company, Branch.company_id == Company.company_id)
    )

    # Şirket adına göre filtreleme
    if company_name:
        query = query.filter(Company.name == company_name)

    # Şube adına göre filtreleme
    if branch_name:
        query = query.filter(Branch.branch_name == branch_name)

    # Limit ekleyelim
    query = query.limit(limit)

    # Sorguyu çalıştır ve sonucu al
    result = await db.execute(query)
    rows = result.all()

    # InventoryResponse'a branch_name ve company_name eklenerek dönülüyor
    return [
        InventoryResponse(
            id=row.Inventory.id,
            device_type=row.Inventory.device_type,
            device_model=row.Inventory.device_model,
            quantity=row.Inventory.quantity,
            specs=row.Inventory.specs,
            branch_id=row.Inventory.branch_id,
            branch_name=row.branch_name,
            company_name=row.company_name
        )
        for row in rows
    ]