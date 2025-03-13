# schemas/company.py
from pydantic import BaseModel,Field

class CompanyBase(BaseModel):
    name: str
    company_id: int

class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    id: int

    class Config:
        orm_mode = True

class CompanyUpdate(BaseModel):
    name: str = Field(..., description="Şirket adı")  # Sadece name alanını zorunlu hale getirin
    company_id: int = Field(None, description="Şirket ID (isteğe bağlı)")  # İsteğe bağlı hale getir