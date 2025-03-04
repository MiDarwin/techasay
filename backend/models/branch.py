from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BranchModel(BaseModel):
    company_id: int
    address: str
    city: str
    phone_number: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None