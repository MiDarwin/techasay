from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.inventory import Inventory
from schemas.inventory import InventoryCreate, InventoryResponse

async def create_inventory(db: AsyncSession, inventory: InventoryCreate):
    db_inventory = Inventory(
        device_type=inventory.device_type,
        device_model=inventory.device_model,
        quantity=inventory.quantity,
        specs=inventory.specs,
        branch_id=inventory.branch_id
    )
    db.add(db_inventory)
    await db.commit()
    await db.refresh(db_inventory)
    return InventoryResponse.from_orm(db_inventory)

async def get_inventory_by_branch(db: AsyncSession, branch_id: int):
    query = select(Inventory).filter(Inventory.branch_id == branch_id)
    result = await db.execute(query)
    inventories = result.scalars().all()
    return [InventoryResponse.from_orm(inv) for inv in inventories]

async def delete_inventory(db: AsyncSession, inventory_id: int):
    query = select(Inventory).filter(Inventory.id == inventory_id)
    result = await db.execute(query)
    db_inventory = result.scalars().first()
    if db_inventory:
        await db.delete(db_inventory)
        await db.commit()
        return db_inventory
    return None