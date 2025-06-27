# models/bpet.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from database import Base


class Bpet(Base):
    __tablename__ = "bpets"                 # ← tablo adı da Bpet

    id           = Column(Integer, primary_key=True, index=True)
    branch_id = Column(
               Integer,
               ForeignKey("branches.id", ondelete="SET NULL"),
               nullable = True,
           index = True,
       )          # NULL = depoda
    product_name = Column(String, nullable=False)
    attributes   = Column(JSONB, nullable=False)        # key/value sözlüğü
    created_at   = Column(DateTime, default=datetime.utcnow)

    history      = relationship("BpetHistory",
                                back_populates="bpet",
                                cascade="all, delete-orphan")
    branch = relationship("Branch")
    errors = relationship(
        "BpetError",
        back_populates="bpet",
        cascade="all, delete-orphan",
        order_by="desc(BpetError.occurred_at)",
    )

class BpetHistory(Base):
    __tablename__ = "bpet_history"

    id         = Column(Integer, primary_key=True)
    bpet_id    = Column(Integer, ForeignKey("bpets.id"), nullable=False)
    branch_id  = Column(Integer, ForeignKey("branches.id"), nullable=True)  # 🆕 FK eklendi
    state      = Column(String, nullable=False)         # 'in_use' | 'warehouse'
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at   = Column(DateTime)

    # İlişkiler
    bpet   = relationship("Bpet", back_populates="history")
    branch = relationship("Branch", back_populates="bpet_histories", lazy="joined")
class BpetError(Base):
    __tablename__ = "bpet_errors"

    id          = Column(Integer, primary_key=True, index=True)
    bpet_id     = Column(Integer, ForeignKey("bpets.id", ondelete="CASCADE"), index=True, nullable=False)
    occurred_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    description = Column(String, nullable=False)
    severity    = Column(String, default="info")         # info | warning | critical
    resolved_at = Column(DateTime, nullable=True)
    notes       = Column(String, nullable=True)

    # back-ref
    bpet = relationship("Bpet", back_populates="errors")