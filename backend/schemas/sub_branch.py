from pydantic import BaseModel
from typing import Optional

class SubBranchCreate(BaseModel):
    branch_id: str  # Ana şubenin ID'si (ObjectId formatında olması gerek)
    name: str  # Alt şubenin adı
    location: Optional[str] = None  # Alt şubenin konumu (isteğe bağlı)