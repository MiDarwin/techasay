from pydantic import BaseModel, Field
from typing import Optional

class InventoryBase(BaseModel):
    device_type: str
    device_model: str
    quantity: int = Field(..., gt=0, description="Miktar sıfırdan büyük olmalıdır.")  # 0'dan büyük kontrolü
    specs: Optional[str] = None

class InventoryCreate(InventoryBase):
    branch_id: int

class InventoryResponse(InventoryBase):
    id: int
    branch_id: int

    class Config:
        orm_mode = True
        from_attributes = True  # Pydantic v2 için gerekli
