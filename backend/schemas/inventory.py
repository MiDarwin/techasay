# schemas/inventory.py

from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime

class InventoryBase(BaseModel):
    branch_id: Optional[str] = Field(None, example="60d5f483f8d2b34d8c8b4567")
    device_type: Optional[str] = Field(None, example="wifi")
    device_model: Optional[str] = Field(None, example="TP-Link AC1750")
    quantity: Optional[int] = Field(None, example=10)
    specs: Optional[Dict] = Field(None, example={"SSID": "MyWiFiNetwork", "password": "securepassword123"})

class InventoryCreate(InventoryBase):
    branch_id: str
    device_type: str

class InventoryUpdate(BaseModel):
    device_type: Optional[str] = Field(None, example="wifi")
    device_model: Optional[str] = Field(None, example="TP-Link AC1750")
    quantity: Optional[int] = Field(None, example=10)
    specs: Optional[Dict] = Field(None, example={"SSID": "MyWiFiNetwork", "password": "securepassword123"})

class InventoryInDB(InventoryBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Inventory(InventoryInDB):
    pass

# Yeni arama modeli
class InventorySearch(BaseModel):
    branch_id: Optional[str] = None
    device_type: Optional[str] = None
    device_model: Optional[str] = None
    quantity: Optional[int] = None
    specs: Optional[Dict] = None