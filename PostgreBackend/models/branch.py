# models/branch.py
from datetime import datetime
from models.favorite_branches import favorite_branches
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime,Float , Boolean
from sqlalchemy.orm import relationship
from database import Base

class Branch(Base):
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, index=True)
    branch_name = Column(String, index=True)
    address = Column(String, index=True)
    city = Column(String, index=True)
    district = Column(String, index=True)
    phone_number = Column(String, index=True)
    branch_note = Column(String, index=True)
    location_link = Column(String, index=True)
    phone_number_2 = Column(String, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_date = Column(DateTime, default=datetime.now)  # Varsayılan olarak şu anki zaman

    visited = Column(Boolean, default=False)  # Varsayılan olarak gidilmedi
    last_visitor_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # En son ziyareti yapan kullanıcı
    tasks = relationship("Task", back_populates="branch", cascade="all, delete-orphan")

    company_id = Column(Integer, ForeignKey("companies.company_id"))
    company = relationship("Company", back_populates="branches")

    inventories = relationship("Inventory", back_populates="branch", cascade="all, delete-orphan")

    parent_branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    parent_branch = relationship("Branch", remote_side=[id], backref="sub_branches")
    # Favori Kullanıcılar İlişkisi
    favorited_by_users = relationship(
        "User",
        secondary=favorite_branches,
        back_populates="favorite_branches"
    )
    visits = relationship("Visit", back_populates="branch", cascade="all, delete-orphan")

# Import en sona eklendi
from .inventory import Inventory
from .visit import Visit
