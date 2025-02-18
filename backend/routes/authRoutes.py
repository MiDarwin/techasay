from fastapi import APIRouter, HTTPException, Depends
from models.userModel import User, LoginUser
from controllers.authController import register_user, login_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
async def register(user: User):
    return await register_user(user)

@router.post("/login")
async def login(user: LoginUser):
    return await login_user(user)
