# models/user.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from database import Base
import bcrypt

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    surname = Column(String)
    email = Column(String, unique=True)
    phone_number = Column(String)
    password = Column(String)  # Şifre burada saklanacak

    permissions = relationship("Permission", back_populates="user", cascade="all, delete-orphan")


    def set_password(self, password: str):
        """ Şifreyi hash'leyip saklar. """
        self.password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def verify_password(self, password: str) -> bool:
        """ Girilen şifre ile hash'lenmiş şifreyi karşılaştırır. """
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))