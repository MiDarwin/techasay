# schemas/permissions.py
from pydantic import BaseModel
from typing import List

class PermissionCreate(BaseModel):
    permissions: List[str]  # Birden fazla izin için dizi (örneğin: ["read", "write"])

class PermissionResponse(BaseModel):
    id: int
    user_id: int
    permissions: List[str]  # JSON formatındaki izinleri dizi olarak döndür

    class Config:
        orm_mode = True