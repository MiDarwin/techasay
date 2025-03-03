# schemas/branch.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BranchBase(BaseModel):
    company_id: str = Field(..., example="60d5f484f8d2e30dfc8b4567")
    address: str = Field(..., example="İstanbul, Kadıköy")
    city: str = Field(..., example="İstanbul")
    phone_number: str = Field(..., example="0212 345 67 89")

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BaseModel):
    address: Optional[str] = Field(None, example="Ankara, Çankaya")
    city: Optional[str] = Field(None, example="Ankara")
    phone_number: Optional[str] = Field(None, example="0312 345 67 89")

class Branch(BranchBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True