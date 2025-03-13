# models/company.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    company_id = Column(Integer, unique=True, index=True)

    # İlişkili alt şubeler (varsa)
    #branches = relationship("Branch", back_populates="company")