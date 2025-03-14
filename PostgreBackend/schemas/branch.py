from pydantic import BaseModel, Field
from typing import Optional

class BranchBase(BaseModel):
    branch_name: str
    address: str
    city: str
    phone_number: str
    branch_note: Optional[str] = Field(default=None)  # İsteğe bağlı hale getirildi
    location_link: Optional[str] = Field(default=None)  # İsteğe bağlı hale getirildi

class BranchCreate(BranchBase):
    pass

class BranchResponse(BaseModel):
    id: int
    name: str
    address: str
    city: str
    phone_number: str
    company_id: int
    company_name: str
    branch_note: Optional[str] = None  # İsteğe bağlı hale getirildi
    location_link: Optional[str] = None  # İsteğe bağlı hale getirildi

    class Config:
        from_attributes = True  # Pydantic v2 için gerekli
class BranchUpdate(BaseModel):
    branch_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    phone_number: Optional[str] = None
    branch_note: Optional[str] = None  # Güncellemelerde opsiyonel
    location_link: Optional[str] = None  # Şube konum linki opsiyonel
    class Config:
        from_attributes = True  # Pydantic v2 için gerekli
