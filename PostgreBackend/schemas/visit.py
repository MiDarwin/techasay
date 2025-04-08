# schemas/visit.py
from pydantic import BaseModel,validator
from typing import Optional
from datetime import datetime
from pytz import timezone

class VisitCreate(BaseModel):
    note: Optional[str]  # Ziyaret notu isteğe bağlı
    visit_date: Optional[datetime] = datetime.utcnow()  # Varsayılan olarak şu anki zaman
    planned_visit_date: Optional[datetime]
class VisitResponse(BaseModel):
    id: int
    branch_id: int
    user_id: int
    visit_date: datetime
    note: Optional[str]
    photo_id: Optional[str]
    planned_visit_date: Optional[datetime]
    @validator("visit_date", pre=True, always=True)
    def convert_to_local_timezone(cls, value):
        local_tz = timezone("Europe/Istanbul")  # Yerel saat diliminizi buraya yazın
        if value.tzinfo is not None:
            return value.astimezone(local_tz).replace(tzinfo=None)
        return value

    class Config:
        from_attributes = True