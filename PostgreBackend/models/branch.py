# models/branch.py

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Branch(Base):
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, index=True)
    branch_name = Column(String, index=True)
    address = Column(String, index=True)
    city = Column(String, index=True)
    phone_number = Column(String, index=True)
    branch_note = Column(String, index=True)
    location_link = Column(String, index=True)

    company_id = Column(Integer, ForeignKey("companies.company_id"))
    company = relationship("Company", back_populates="branches")

    inventories = relationship("Inventory", back_populates="branch", cascade="all, delete-orphan")

    parent_branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    parent_branch = relationship("Branch", remote_side=[id], backref="sub_branches")

# Import en sona eklendi
from .inventory import Inventory
