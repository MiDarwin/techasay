# models/favorite.py
from sqlalchemy import Table, Column, Integer, ForeignKey, DateTime, func
from database import Base

# Ara tablo tanımı
favorite_branches = Table(
    "favorite_branches",
    Base.metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE")),
    Column("branch_id", Integer, ForeignKey("branches.id", ondelete="CASCADE")),
    Column("created_at", DateTime, default=func.now()),
)