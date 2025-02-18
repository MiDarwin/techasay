from pydantic import BaseModel, EmailStr

class User(BaseModel):
    email: EmailStr
    password: str
    permissions: list = []  # Kullanıcı izinleri için boş bir liste

class LoginUser(BaseModel):
    email: EmailStr
    password: str
