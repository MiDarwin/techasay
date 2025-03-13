# routes/user.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.user import UserCreate, UserResponse,UserLogin
from services.user_service import create_user, login_user
from database import get_db

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        db_user = await create_user(db, user)
        return db_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=UserResponse)
async def login_user_endpoint(user: UserLogin, db: AsyncSession = Depends(get_db)):
    try:
        db_user = await login_user(db, user.email, user.password)
        return db_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))