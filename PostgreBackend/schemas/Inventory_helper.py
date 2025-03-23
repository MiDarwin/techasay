from pydantic import BaseModel
from typing import List, Optional

# Cihaz türü ve modeller şeması
class InventoryHelperSchema(BaseModel):
    id: Optional[int] = None
    device_type: str
    device_models: List[str] = []  # Varsayılan olarak boş liste

    class Config:
        orm_mode = True  # SQLAlchemy modelinden Pydantic şemasına dönüştürme için gerekli

# Yeni cihaz türü ekleme şeması
class DeviceTypeSchema(BaseModel):
    device_type: str

# Yeni model ekleme/düzenleme şeması
class ModelNameSchema(BaseModel):
    model_name: str
