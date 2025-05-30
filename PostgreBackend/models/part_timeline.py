from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from database import Base
from enum import Enum as PyEnum          # Python enum
from sqlalchemy import Enum as SAEnum
class PartState(str, PyEnum):
    in_use = "in_use"
    warehouse = "warehouse"
    repair = "repair"

class PartTimeline(Base):
    __tablename__ = "part_timeline"

    id = Column(Integer, primary_key=True, index=True)
    serial_no = Column(String, ForeignKey("part_master.serial_no"))
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventories.id"))

    state = Column(Enum(PartState), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow, index=True)
    ended_at = Column(DateTime, nullable=True, index=True)
    note = Column(String)
    extra = Column(JSONB)

    part = relationship("PartMaster", back_populates="timeline")