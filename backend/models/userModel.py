from pydantic import BaseModel, EmailStr

class User(BaseModel):
    email: EmailStr
    password: str
    is_admin: bool = False
    permissions: list = []  # Kullanıcı izinleri için boş bir liste
