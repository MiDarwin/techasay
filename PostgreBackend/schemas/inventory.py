from pydantic import BaseModel, Field
from typing import Optional

class InventoryBase(BaseModel):
    device_type: str
    device_model: str
    quantity: int = Field(..., gt=0, description="Miktar sıfırdan büyük olmalıdır.")  # 0'dan büyük kontrolü
    specs: Optional[str] = None

class InventoryCreate(BaseModel):
    device_type: str
    device_model: str
    quantity: int
    specs: Optional[str] = None

    class Config:
        orm_mode = True

class InventoryResponse(InventoryBase):
    id: int
    branch_id: int
    branch_name:Optional[str] = None
    company_name: Optional[str] = None  # Şirket adı

    class Config:
        orm_mode = True
        from_attributes = True  # Pydantic v2 için gerekli
class InventoryUpdate(BaseModel):
    device_type: Optional[str] = None
    device_model: Optional[str] = None
    quantity: Optional[int] = None
    specs: Optional[str] = None

    class Config:
        orm_mode = True