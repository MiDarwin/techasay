from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.InventoryHelper import InventoryHelper
from database import get_db
from schemas.Inventory_helper import InventoryHelperSchema

router = APIRouter()

# 1. Tüm cihaz türlerini ve modellerini getir
@router.get("/inventory-helpers", response_model=List[InventoryHelperSchema])
async def get_inventory_helpers(db: AsyncSession = Depends(get_db)):
    query = select(InventoryHelper)
    result = await db.execute(query)
    helpers = result.scalars().all()
    return helpers

# 2. Yeni bir cihaz türü ve modelleri ekle
@router.post("/inventory-helpers", response_model=InventoryHelperSchema)
async def create_inventory_helper(helper: InventoryHelperSchema, db: AsyncSession = Depends(get_db)):
    query = select(InventoryHelper).where(InventoryHelper.device_type == helper.device_type)
    result = await db.execute(query)
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(status_code=400, detail="Bu cihaz türü zaten mevcut.")

    new_helper = InventoryHelper(
        device_type=helper.device_type,
        device_models=helper.device_models
    )
    db.add(new_helper)
    await db.commit()
    await db.refresh(new_helper)
    return new_helper

# 3. Mevcut bir cihaz türünü güncelle
@router.put("/inventory-helpers/{helper_id}", response_model=InventoryHelperSchema)
async def update_inventory_helper(helper_id: int, updated_data: InventoryHelperSchema, db: AsyncSession = Depends(get_db)):
    query = select(InventoryHelper).where(InventoryHelper.id == helper_id)
    result = await db.execute(query)
    helper = result.scalar_one_or_none()

    if not helper:
        raise HTTPException(status_code=404, detail="Cihaz türü bulunamadı.")

    helper.device_type = updated_data.device_type
    helper.device_models = updated_data.device_models

    db.add(helper)
    await db.commit()
    await db.refresh(helper)
    return helper

# 4. Belirli bir cihaz türüne ait modelleri getir
@router.get("/inventory-helpers/{device_type}/models", response_model=List[str])
async def get_models_by_device_type(device_type: str, db: AsyncSession = Depends(get_db)):
    query = select(InventoryHelper).where(InventoryHelper.device_type == device_type)
    result = await db.execute(query)
    helper = result.scalar_one_or_none()

    if not helper:
        raise HTTPException(status_code=404, detail="Bu türde bir cihaz bulunamadı.")

    return helper.device_models

# 5. Tüm cihaz türlerini getir (sadece tür isimleri)
@router.get("/inventory-helpers/types", response_model=List[str])
async def get_device_types(db: AsyncSession = Depends(get_db)):
    query = select(InventoryHelper.device_type)
    result = await db.execute(query)
    device_types = result.scalars().all()
    return device_types