from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from models.InventoryHelper import InventoryHelper
from database import get_db
from schemas.Inventory_helper import InventoryHelperSchema  # Pydantic şema
from sqlalchemy.future import select  # AsyncSession için select kullanımı
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

# 1. Tüm cihaz türlerini ve modellerini getir
# Tüm cihaz türlerini ve modellerini getir
@router.get("/inventory-helpers", response_model=List[InventoryHelperSchema])
async def get_inventory_helpers(db: Session = Depends(get_db)):
    helpers = db.query(InventoryHelper).all()
    return helpers

# 2. Yeni bir cihaz türü ve modelleri ekle
@router.post("/inventory-helpers", response_model=InventoryHelperSchema)
async def create_inventory_helper(helper: InventoryHelperSchema, db: AsyncSession = Depends(get_db)):
    # Cihaz türü mevcut mu kontrol et
    query = select(InventoryHelper).where(InventoryHelper.device_type == helper.device_type)
    result = await db.execute(query)
    existing = result.scalar()  # İlk sonucu al

    if existing:
        raise HTTPException(status_code=400, detail="Bu cihaz türü zaten mevcut.")

    # Yeni cihaz türünü ekle
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
async def update_inventory_helper(helper_id: int, updated_data: InventoryHelperSchema, db: Session = Depends(get_db)):
    helper = db.query(InventoryHelper).filter(InventoryHelper.id == helper_id).first()
    if not helper:
        raise HTTPException(status_code=404, detail="Cihaz türü bulunamadı.")

    helper.device_type = updated_data.device_type
    helper.device_models = updated_data.device_models
    db.commit()
    db.refresh(helper)
    return helper