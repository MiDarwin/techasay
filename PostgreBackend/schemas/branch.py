# schemas/branch.py
from pydantic import BaseModel

class BranchBase(BaseModel):
    branch_name: str
    address: str
    city: str
    phone_number: str
    branch_note: str

class BranchCreate(BranchBase):
    pass

class BranchResponse(BaseModel):
    id: int
    name: str  # Bunu branch_name olarak değiştirebilirsiniz.
    address: str
    city: str
    phone_number: str
    company_id: int
    company_name: str
    branch_note: str  # Yeni alan, gerekli ise ekleyin

    class Config:
        orm_mode = True