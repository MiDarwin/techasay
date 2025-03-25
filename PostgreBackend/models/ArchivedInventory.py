from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class ArchivedInventory(Base):
    __tablename__ = "archived_inventories"

    id = Column(Integer, primary_key=True, index=True)
    device_type = Column(String, nullable=False)
    device_model = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    specs = Column(String, nullable=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    deleted_at = Column(DateTime, default=datetime.utcnow)  # Silinme tarihi
