from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.user import UserCreate, UserResponse
from services.user_service import create_user
from database import get_db

router = APIRouter()

@router.post("/", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = await create_user(db, user)
    return db_user