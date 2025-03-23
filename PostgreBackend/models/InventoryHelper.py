from sqlalchemy import Column, Integer, String, JSON
from database import Base

class InventoryHelper(Base):
    __tablename__ = "inventory_helpers"

    id = Column(Integer, primary_key=True, index=True)
    device_type = Column(String, nullable=False, unique=True)
    device_models = Column(JSON, nullable=False, default=[])
