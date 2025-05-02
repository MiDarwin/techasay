from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

class InventoryBase(BaseModel):
    details: Dict[str, Any]

class InventoryCreateBody(BaseModel):
    branch_id: int
    details: Dict[str, Any]

class InventoryUpdate(InventoryBase):
    pass  # eğer güncelleme ihtiyacınız varsa

class InventoryOut(InventoryBase):
    id: int
    branch_id: int
    branch_name: str
    details: Dict[str, Any]
    created_date: datetime
    updated_date: Optional[datetime]

    class Config:
        orm_mode = True
class InventoryImportResponse(BaseModel):
    added: int
    updated: int
    skipped: int
    skipped_branches: List[str]