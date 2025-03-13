from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime

class InventoryBase(BaseModel):
    branch_id: Optional[str] = Field(None, example="60d5f483f8d2b34d8c8b4567")
    sub_branch_id: Optional[str] = Field(None, example="60d5f48445e1a2c8e1c1c0c1")  # Yeni alan eklendi
    device_type: Optional[str] = Field(None, example="wifi")
    device_model: Optional[str] = Field(None, example="TP-Link AC1750")
    quantity: Optional[int] = Field(None, example=10)
    specs: Optional[Dict] = Field(None, example={"SSID": "MyWiFiNetwork", "password": "securepassword123"})
    note: Optional[str] = Field(None, example="Ürünün notu")  # Yeni alan

class InventoryCreate(InventoryBase):
    branch_id: str
    device_type: str

class InventoryUpdate(BaseModel):
    device_type: Optional[str] = Field(None, example="wifi")
    device_model: Optional[str] = Field(None, example="TP-Link AC1750")
    quantity: Optional[int] = Field(None, example=10)
    specs: Optional[Dict] = Field(None, example={"SSID": "MyWiFiNetwork", "password": "securepassword123"})
    note: Optional[str] = Field(None, example="Ürünün notu")  # Yeni alan

class InventoryInDB(InventoryBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Inventory(InventoryInDB):
    branch_name: Optional[str] = Field(None, example="Ankara Şubesi")

class InventorySearch(BaseModel):
    branch_id: Optional[str] = None
    sub_branch_id: Optional[str] = None  # Yeni arama modeli için alan eklendi
    device_type: Optional[str] = None
    device_model: Optional[str] = None
    quantity: Optional[int] = None
    specs: Optional[Dict] = None