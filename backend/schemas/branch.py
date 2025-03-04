from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BranchBase(BaseModel):
    company_id: int
    branch_name: str  # Şube ismi eklendi
    address: str
    city: str
    phone_number: str

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BaseModel):
    branch_name: Optional[str] = None  # Güncellemelerde opsiyonel
    address: Optional[str] = None
    city: Optional[str] = None
    phone_number: Optional[str] = None

class Branch(BranchBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        allow_population_by_field_name = True
        orm_mode = True