from typing import List
from fastapi import APIRouter, HTTPException, Depends,status
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.InventoryHelper import InventoryHelper
from database import get_db
from schemas.Inventory_helper import InventoryHelperSchema, ModelNameSchema, DeviceTypeSchema

router = APIRouter()

# 1. Tüm cihaz türlerini ve modellerini getir
@router.get("/inventory-helpers", response_model=List[InventoryHelperSchema])
async def get_inventory_helpers(db: AsyncSession = Depends(get_db)):
    query = select(InventoryHelper)
    result = await db.execute(query)
    helpers = result.scalars().all()
    return helpers

# 2. Yeni bir cihaz türü ekle
@router.post("/inventory-helpers/types", response_model=InventoryHelperSchema)
async def create_device_type(device: DeviceTypeSchema, db: AsyncSession = Depends(get_db)):
    query = select(InventoryHelper).where(InventoryHelper.device_type == device.device_type)
    result = await db.execute(query)
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(status_code=400, detail="Bu cihaz türü zaten mevcut.")

    new_helper = InventoryHelper(
        device_type=device.device_type,
        device_models=[]  # Başlangıçta boş bir JSON liste
    )
    db.add(new_helper)
    await db.commit()
    await db.refresh(new_helper)
    return new_helper

# 3. Türe bağlı yeni bir model ekle (Var olan verileri silmeden ekler)
@router.post("/inventory-helpers/{helper_id}/models", response_model=InventoryHelperSchema)
async def add_model_to_device_type(helper_id: int, model: ModelNameSchema, db: AsyncSession = Depends(get_db)):
    # İlgili cihaz türünü veritabanından sorgula
    query = select(InventoryHelper).where(InventoryHelper.id == helper_id)
    result = await db.execute(query)
    helper = result.scalar_one_or_none()

    if not helper:
        raise HTTPException(status_code=404, detail="Cihaz türü bulunamadı.")

    # Eğer device_models None veya JSON formatında değilse boş bir liste başlat
    if not helper.device_models or not isinstance(helper.device_models, list):
        helper.device_models = []

    # Yeni model zaten mevcutsa hata döndür
    if model.model_name in helper.device_models:
        raise HTTPException(status_code=400, detail="Bu model zaten mevcut.")

    # Yeni modeli listeye ekle
    updated_models = helper.device_models + [model.model_name]
    setattr(helper, "device_models", updated_models)

    try:
        await db.commit()
        await db.refresh(helper)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Veritabanı güncellemesi sırasında hata oluştu: {str(e)}")

    return helper
# 4. Türe bağlı bir modeli silme
@router.delete(
    "/inventory-helpers/{helper_id}/models/{model_name}",
    response_model=InventoryHelperSchema,
    status_code=status.HTTP_200_OK
)
async def delete_model_from_device_type(
    helper_id: int,
    model_name: str,
    db: AsyncSession = Depends(get_db)
):
    # İlgili cihaz türünü veritabanından sorgula
    query = select(InventoryHelper).where(InventoryHelper.id == helper_id)
    result = await db.execute(query)
    helper = result.scalar_one_or_none()

    if not helper:
        raise HTTPException(status_code=404, detail="Cihaz türü bulunamadı.")

    # device_models listesinden model_name'in var olup olmadığını kontrol et
    if not helper.device_models or model_name not in helper.device_models:
        raise HTTPException(status_code=404, detail="Belirtilen model bulunamadı.")

    # model_name'i device_models listesinden çıkar
    updated_models = [model for model in helper.device_models if model != model_name]
    setattr(helper, "device_models", updated_models)

    try:
        await db.commit()
        await db.refresh(helper)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Veritabanı güncellemesi sırasında hata oluştu: {str(e)}"
        )

    return helper