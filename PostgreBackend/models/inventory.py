from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from database import Base  # sizin Base import’ınız

class Inventory(Base):
    __tablename__ = "inventories"

    id           = Column(Integer, primary_key=True, index=True)
    branch_id    = Column(Integer, ForeignKey("branches.id"), nullable=False)
    details      = Column(JSONB, nullable=False)  # dinamik envanter verisi
    created_date = Column(DateTime, default=datetime.utcnow)
    updated_date = Column(DateTime, onupdate=datetime.utcnow)

    branch = relationship("Branch", back_populates="inventories")
