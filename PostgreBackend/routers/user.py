# routers/user.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas.user import UserCreate, User
from services.user_service import create_user, get_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=User)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return create_user(db=db, user=user)

@router.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, username=user.username)
    if db_user and pwd_context.verify(user.password, db_user.password):
        return {"message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid username or password")

@router.get("/info", response_model=User)
def get_user_info(username: str, db: Session = Depends(get_db)):
    db_user = get_user(db, username=username)
    if db_user:
        return db_user
    raise HTTPException(status_code=404, detail="User not found")