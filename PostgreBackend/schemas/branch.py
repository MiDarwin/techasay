from pydantic import BaseModel, Field
from typing import Optional, List

class BranchBase(BaseModel):
    branch_name: str
    address: Optional[str] = None  # Opsiyonel hale getirildi
    city: Optional[str] = None  # Opsiyonel hale getirildi
    phone_number: Optional[str] = None  # Opsiyonel hale getirildi
    branch_note: Optional[str] = None  # Opsiyonel hale getirildi
    location_link: Optional[str] = None  # Opsiyonel hale getirildi

class BranchCreate(BranchBase):
    company_id: Optional[int] = None  # Şube oluştururken şirket ID opsiyonel olabilir
    parent_branch_id: Optional[int] = None  # Alt şube oluşturmak için parent_branch_id ekledik

class BranchResponse(BaseModel):
    id: int
    name: str  # `name` yerine `branch_name` olarak değiştirdim
    address: Optional[str] = None
    city: Optional[str] = None
    phone_number: Optional[str] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None  # Şirket adı opsiyonel
    branch_note: Optional[str] = None
    location_link: Optional[str] = None
    parent_branch_id: Optional[int] = None  # Üst şube ilişkisi için
    has_sub_branches: Optional[bool] = None  # Alt şubelerinin olup olmadığını gösteren alan


    class Config:
        from_attributes = True  # Pydantic v2 için gerekli

class BranchUpdate(BaseModel):
    branch_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    phone_number: Optional[str] = None
    branch_note: Optional[str] = None
    location_link: Optional[str] = None
    parent_branch_id: Optional[int] = None  # Alt şube ilişkisi güncellenebilir

    class Config:
        from_attributes = True  # Pydantic v2 için gerekli