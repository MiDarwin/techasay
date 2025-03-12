from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BranchBase(BaseModel):
    company_id: int
    branch_name: str
    address: str
    city: str
    phone_number: str
    branch_note: Optional[str] = None  # Şube notu opsiyonel
    location_link: Optional[str] = None  # Şube konum linki opsiyonel
    sub_branch: Optional[bool] = False  # Alt şube durumu (False = yok, True = var)

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BaseModel):
    branch_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    phone_number: Optional[str] = None
    branch_note: Optional[str] = None  # Güncellemelerde opsiyonel
    location_link: Optional[str] = None  # Şube konum linki opsiyonel
    sub_branch: Optional[bool] = None  # Alt şube durumu güncellemeleri için opsiyonel

class Branch(BranchBase):
    id: str = Field(alias="_id")
    company_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        allow_population_by_field_name = True
        orm_mode = True