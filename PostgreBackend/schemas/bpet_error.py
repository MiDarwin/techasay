# schemas/bpet_error.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ErrorBase(BaseModel):
    description: str
    severity: str = Field(
        default="info",
        pattern="^(info|warning|critical)$"   # 👈 burası değişti
    )
    occurred_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    notes: Optional[str] = None

class ErrorCreate(ErrorBase):
    pass

class ErrorUpdate(BaseModel):
    description: Optional[str] = None
    severity: Optional[str] = Field(
        default=None,
        pattern="^(info|warning|critical)$"   # 👈 yine pattern
    )
    resolved_at: Optional[datetime] = None
    notes: Optional[str] = None

class ErrorRead(ErrorBase):
    id: int
    bpet_id: int

    class Config:
        orm_mode = True
