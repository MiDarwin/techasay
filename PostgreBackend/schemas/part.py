from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class PartBase(BaseModel):
    serial_no: str
    kind: str
    wan_ip: Optional[str] = None
    gsm_no: Optional[str] = None
    rt_local_ip: Optional[str] = None
    device_model: Optional[str] = None
    mac_address: Optional[str] = None
    imei: Optional[str] = None
    pc_ip: Optional[str] = None
    code: Optional[str] = None
    has_adapter: Optional[bool] = False
    has_gsm_antenna: Optional[bool] = False
    has_wifi_antenna: Optional[bool] = False

class PartCreate(PartBase):
    branch_id: int
    inventory_id: int

class PartOut(PartBase):
    current_branch_id: Optional[int] = None

    class Config:
        orm_mode = True

class PartTimelineOut(BaseModel):
    id: int
    branch_id: Optional[int] = None
    state: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    note: Optional[str] = None

    class Config:
        orm_mode = True

class PartDismountIn(BaseModel):
    serial_nos: List[str]
    note: Optional[str] = None