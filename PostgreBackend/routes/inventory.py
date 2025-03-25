from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.ArchivedInventory import ArchivedInventory
from models.branch import Branch
from schemas.inventory import InventoryCreate, InventoryResponse, InventoryUpdate
from services.inventory_service import create_inventory, get_inventory_by_branch, delete_inventory, get_all_inventory, \
    update_inventory, get_inventory_by_branch_id, get_combined_inventory_by_branch_id
from database import get_db

router = APIRouter()

@router.post("/branches/{branch_id}/inventories", response_model=InventoryResponse)
async def create_inventory_endpoint(
    branch_id: int,
    inventory: InventoryCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        new_inventory = await create_inventory(db, branch_id, inventory)
        return new_inventory
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/branches/{branch_id}/inventories", response_model=list[InventoryResponse])
async def get_inventory_by_branch_endpoint(branch_id: int, db: AsyncSession = Depends(get_db)):
    return await get_inventory_by_branch(db, branch_id)

@router.delete("/inventories/{inventory_id}", response_model=dict)
async def delete_inventory_endpoint(inventory_id: int, db: AsyncSession = Depends(get_db)):
    deleted_inventory = await delete_inventory(db, inventory_id)
    if not deleted_inventory:
        raise HTTPException(status_code=404, detail="Envanter bulunamadı.")
    return {"detail": "Envanter başarıyla silindi."}
@router.get("/inventories", response_model=list[InventoryResponse])
async def get_all_inventory_endpoint(
    limit: int = 50,
    company_name: Optional[str] = None,  # Şirket adına göre filtreleme
    branch_name: Optional[str] = None,  # Şube adına göre filtreleme
    db: AsyncSession = Depends(get_db)
):
    try:
        inventories = await get_all_inventory(db, limit, company_name, branch_name)
        return inventories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/inventories/{inventory_id}", response_model=InventoryResponse)
async def update_inventory_endpoint(
    inventory_id: int,
    inventory_update: InventoryUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        updated_inventory = await update_inventory(db, inventory_id, inventory_update)
        return updated_inventory
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/branches/{branch_id}/inventory")
async def get_branch_inventory(branch_id: int, db: AsyncSession = Depends(get_db)):
    # Şubenin var olup olmadığını kontrol et
    branch = await db.get(Branch, branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Şube bulunamadı")

    # Ana şube ve alt şubelerin envanteri
    inventory = await get_inventory_by_branch_id(db, branch_id)
    return inventory
@router.get("/branches/{branch_id}/combined-inventory")
async def get_combined_inventory(branch_id: int, db: AsyncSession = Depends(get_db)):
    try:
        inventory = await get_combined_inventory_by_branch_id(db, branch_id)
        return inventory
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/archived_inventories", response_model=list[InventoryResponse])
async def get_archived_inventory_endpoint(
    limit: int = 50, db: AsyncSession = Depends(get_db)
):
    query = select(ArchivedInventory).limit(limit)
    result = await db.execute(query)
    archived_inventories = result.scalars().all()
    return archived_inventories
