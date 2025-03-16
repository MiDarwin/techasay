from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.inventory import InventoryCreate, InventoryResponse
from services.inventory_service import create_inventory, get_inventory_by_branch, delete_inventory
from database import get_db

router = APIRouter()

@router.post("/branches/{branch_id}/inventories", response_model=InventoryResponse)
async def create_inventory_endpoint(branch_id: int, inventory: InventoryCreate, db: AsyncSession = Depends(get_db)):
    try:
        new_inventory = await create_inventory(db, inventory)
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