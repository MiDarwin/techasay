# schemas/company.py

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class CompanyBase(BaseModel):
    name: str = Field(..., example="ABC Şirketi")
    company_id: int = Field(..., example=100001)

    @validator('company_id')
    def company_id_must_be_six_digits(cls, v):
        if not (100000 <= v <= 999999):
            raise ValueError('company_id must be a 6-digit number')
        return v

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(None, example="XYZ Şirketi")

class Company(CompanyBase):
    id: str = Field(..., alias="_id")  # _id'yi id olarak haritalandırın
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True