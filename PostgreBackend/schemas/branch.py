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

class BranchResponse(BranchBase):
    id: int
    company_id: int

    class Config:
        orm_mode = True