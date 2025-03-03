# schemas/inventory.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class InventoryBase(BaseModel):
    branch_id: str = Field(..., example="60d5f4a3f8d2e30dfc8b4568")
    item_name: str = Field(..., example="Laptop")
    quantity: int = Field(..., example=100)
    description: Optional[str] = Field(None, example="Dell Inspiron 15")

class InventoryCreate(InventoryBase):
    pass

class InventoryUpdate(BaseModel):
    item_name: Optional[str] = Field(None, example="Laptop Pro")
    quantity: Optional[int] = Field(None, example=150)
    description: Optional[str] = Field(None, example="Dell Inspiron 17")

class Inventory(InventoryBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True