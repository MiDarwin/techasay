# models/visit.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime
from sqlalchemy.dialects.postgresql import TIMESTAMP

class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id"))  # Şube ID
    user_id = Column(Integer, ForeignKey("users.id"))  # Kullanıcı ID
    visit_date = Column(TIMESTAMP(timezone=True), default=datetime.datetime.utcnow)  # Zaman dilimi bilgisi dahil
    note = Column(Text, nullable=True)  # Ziyaret sırasında eklenen not
    photo_id = Column(String, nullable=True)  # Fotoğraf dosyasının ID'si (isteğe bağlı)

    # İlişkiler
    branch = relationship("Branch", back_populates="visits")  # Şube ile ilişki
    user = relationship("User", back_populates="visits")  # Kullanıcı ile ilişki