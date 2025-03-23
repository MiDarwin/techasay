# schemas/company.py
from typing import Optional

from pydantic import BaseModel,Field

class CompanyBase(BaseModel):
    name: str
company_id: Optional[int] = None
class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    id: int
    company_id: Optional[int] = None

    class Config:
        orm_mode = True

class CompanyUpdate(BaseModel):
    name: str = Field(..., description="Şirket adı")  # Sadece name alanını zorunlu hale getirin
    company_id: int = Field(None, description="Şirket ID (isteğe bağlı)")  # İsteğe bağlı hale getir