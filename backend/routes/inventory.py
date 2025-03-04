# routes/inventory.py

from fastapi import APIRouter, HTTPException, status, Body
from typing import List

from schemas.inventory import InventoryCreate, InventoryUpdate, Inventory, InventorySearch
from services.inventory import (
    add_inventory,
    get_inventory_by_branch,
    update_inventory,
    delete_inventory,
    get_inventory_by_id,
    search_inventory
)

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)

@router.post("/", response_model=Inventory, status_code=status.HTTP_201_CREATED)
async def create_inventory(inventory: InventoryCreate):
    try:
        new_inventory = await add_inventory(inventory)
        return new_inventory
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/branch/{branch_id}", response_model=List[Inventory])
async def read_inventory_by_branch(branch_id: str):
    inventories = await get_inventory_by_branch(branch_id)
    if not inventories:
        raise HTTPException(status_code=404, detail="No inventory found for this branch")
    return inventories

@router.get("/{inventory_id}", response_model=Inventory)
async def read_inventory(inventory_id: str):
    inventory = await get_inventory_by_id(inventory_id)
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")
    return inventory

@router.put("/{inventory_id}", response_model=Inventory)
async def update_existing_inventory(inventory_id: str, inventory: InventoryUpdate):
    updated_inventory = await update_inventory(inventory_id, inventory)
    if not updated_inventory:
        raise HTTPException(status_code=404, detail="Inventory not found or no update performed")
    return updated_inventory

@router.delete("/{inventory_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_inventory(inventory_id: str):
    success = await delete_inventory(inventory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Inventory not found")
    return

# Yeni Arama Endpoint'i
@router.post("/search", response_model=List[Inventory])
async def search_inventory_endpoint(search_params: InventorySearch = Body(...)):
    inventories = await search_inventory(search_params)
    if not inventories:
        raise HTTPException(status_code=404, detail="No inventories match the search criteria")
    return inventories