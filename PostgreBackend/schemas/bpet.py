# schemas/bpet.py
from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel


class BpetBase(BaseModel):
    product_name: str
    attributes: Dict[str, Any]


class BpetCreate(BpetBase):
    branch_id: Optional[int] = None        # depo başlangıcı için NULL


class BpetUpdate(BaseModel):
    branch_id: Optional[int] = None
    attributes: Optional[Dict[str, Any]] = None   # “= None” eklenerek artık opsiyonel


class BpetOut(BpetBase):
    id: int
    branch_id: Optional[int]
    created_at: datetime
    class Config: orm_mode = True


class BpetHistoryOut(BaseModel):
    id: int
    branch_id: Optional[int]
    state: str
    started_at: datetime
    ended_at: Optional[datetime]
    class Config: orm_mode = True
