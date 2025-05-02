from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from schemas.inventory import InventoryOut, InventoryCreateBody
from services.inventory_service import get_inventory_by_branch, create_inventory, update_inventory
from database import get_db


router = APIRouter(prefix="", tags=["inventory"])
@router.get(
    "",
    response_model=List[InventoryOut],
    summary="Belirtilen branch_id ile envanter kayıtlarını döner"
)
async def read_inventory(
    branch_id: int = Query(..., description="Envanter alınacak şube ID"),
    db:        AsyncSession = Depends(get_db),
):
    """
    GET /api/inventory?branch_id=5
    """
    try:
        return await get_inventory_by_branch(db, branch_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.patch("/{inventory_id}", response_model=InventoryOut)
async def edit_inventory(
    inventory_id: int,
    payload:      Dict[str, Any],
    db:           AsyncSession = Depends(get_db),

):

    try:
        return await update_inventory(db, inventory_id, payload)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=InventoryOut, summary="Yeni envanter kaydı (branch_id body'den)")
async def add_inventory(
    inv_in: InventoryCreateBody,
    db:     AsyncSession = Depends(get_db),
):

    try:
        return await create_inventory(db, inv_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))