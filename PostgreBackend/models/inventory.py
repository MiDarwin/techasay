from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from database import Base

class Inventory(Base):
    __tablename__ = "inventories"

    id = Column(Integer, primary_key=True, index=True)
    device_type = Column(String, nullable=False)  # Cihaz türü (örneğin, laptop, printer)
    device_model = Column(String, nullable=False)  # Cihaz modeli
    quantity = Column(Integer, nullable=False)  # Miktar (0 olamaz)
    specs = Column(String, nullable=True)  # Cihaz özellikleri (opsiyonel)

    # Şube ile ilişki
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    branch = relationship("Branch", back_populates="inventories")

    # 0 miktar kontrolü
    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_quantity_positive"),
    )