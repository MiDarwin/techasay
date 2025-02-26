from pydantic import BaseModel, EmailStr, Field
from typing import List

class User(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    surname: str = Field(..., min_length=1, max_length=50)
    phone_number: str = Field(..., pattern=r'^\d{11}$')  # 11 haneli telefon numarası kontrolü
    email: EmailStr
    password: str
    permissions: List[str] = []  # Kullanıcı izinleri için boş bir liste

class LoginUser(BaseModel):
    email: EmailStr
    password: str