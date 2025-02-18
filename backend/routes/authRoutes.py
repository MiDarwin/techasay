from fastapi import APIRouter, HTTPException, Depends
from models.userModel import User
from controllers.authController import register_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
async def register(user: User):
    return await register_user(user)
