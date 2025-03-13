from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str  # İsim
    surname: str  # Soyisim
    email: EmailStr  # Email
    phone_number: str  # Telefon numarası
    password: str  # Şifre

class UserResponse(BaseModel):
    id: int  # Burada id alanı tanımlanmalı
    name: str
    surname: str
    email: str
    phone_number: str

    class Config:
        orm_mode = True  # SQLAlchemy modellerinin Pydantic modelleri ile uyumlu olmasını sağlar