# schemas/visit.py
from pydantic import BaseModel,validator
from typing import Optional
from datetime import datetime
from pytz import timezone

class VisitCreate(BaseModel):
    note: Optional[str]  # Ziyaret notu isteğe bağlı
    visit_date: Optional[datetime] = datetime.utcnow()  # Varsayılan olarak şu anki zaman

class VisitResponse(BaseModel):
    id: int
    branch_id: int
    user_id: int
    visit_date: datetime
    note: Optional[str]
    photo_id: Optional[str]

    @validator("visit_date", pre=True, always=True)
    def convert_to_local_timezone(cls, value):
        local_tz = timezone("Europe/Istanbul")  # Yerel saat diliminizi buraya yazın
        if value.tzinfo is not None:
            return value.astimezone(local_tz).replace(tzinfo=None)
        return value

    class Config:
        from_attributes = True

class VisitResponse(BaseModel):
    id: int
    branch_id: int
    user_id: int
    visit_date: datetime
    note: Optional[str]
    photo_id: Optional[str]  # Fotoğraf ID'si veya URL'si
    photo_url: Optional[str]
    @validator("visit_date", pre=True, always=True)
    def convert_to_local_timezone(cls, value):
        local_tz = timezone("Europe/Istanbul")  # Yerel saat diliminizi buraya yazın
        if value.tzinfo is not None:
            return value.astimezone(local_tz).replace(tzinfo=None)
        return value

    @property
    def photo_url(self):
        if self.photo_id:
            return f"http://localhost:8000/visit_images/{self.photo_id}"  # Fotoğraf URL'si
        return None

    class Config:
        from_attributes = True