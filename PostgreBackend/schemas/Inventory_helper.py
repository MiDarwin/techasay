from pydantic import BaseModel
from typing import List

class InventoryHelperSchema(BaseModel):
    id: int
    device_type: str
    device_models: List[str]  # Cihaz modelleri JSON formatında

    class Config:
        orm_mode = True  # SQLAlchemy modelinden Pydantic şemasına dönüştürme için gerekli