from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from enum import Enum as PyEnum          # Python enum
from sqlalchemy import Enum as SAEnum
class PartKind(str, PyEnum):
    modem = "modem"
    sim = "sim"
    cable = "cable"
    adapter = "adapter"
    gsm_antenna = "gsm_antenna"
    wifi_antenna = "wifi_antenna"

class PartMaster(Base):
    __tablename__ = "part_master"

    serial_no = Column(String, primary_key=True, index=True)
    kind = Column(SAEnum(PartKind, name="part_kind"), nullable=False)

    # Device specific metadata
    wan_ip = Column(String)
    gsm_no = Column(String)
    rt_local_ip = Column(String)
    device_model = Column(String)
    mac_address = Column(String)
    imei = Column(String)
    pc_ip = Column(String)
    code = Column(String)
    has_adapter = Column(Boolean, default=False)
    has_gsm_antenna = Column(Boolean, default=False)
    has_wifi_antenna = Column(Boolean, default=False)

    first_seen_at = Column(DateTime, default=datetime.utcnow)
    last_seen_at = Column(DateTime)

    current_branch_id = Column(Integer, ForeignKey("branches.id"), index=True)
    current_inventory_id = Column(Integer, ForeignKey("inventories.id"), index=True)

    timeline = relationship("PartTimeline", back_populates="part", cascade="all, delete-orphan")
