# schemas/user.py
from typing import Optional

from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    surname: str
    email: EmailStr
    phone_number: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    surname: str
    email: str
    phone_number: str
    access_token: Optional[str] = None
    token_type: Optional[str] = None

    class Config:
        orm_mode = True

class UserUpdatePassword(BaseModel):
    email: EmailStr
    old_password: str
    new_password: str