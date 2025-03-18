# routes/user.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from dependencies import get_current_user
from models.user import User
from schemas.user import UserCreate, UserResponse,UserLogin
from services.permissions_service import has_permission
from services.user_service import create_user, login_user, get_user_by_id, get_all_users_with_permissions
from database import get_db

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        db_user = await create_user(db, user)
        return db_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login_user_endpoint(user: UserLogin, db: AsyncSession = Depends(get_db)):
    try:
        token_response = await login_user(db, user.email, user.password)
        return {"access_token": f"Bearer {token_response['access_token']}"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        surname=current_user.surname,
        email=current_user.email,
        phone_number=current_user.phone_number

    )
@router.get("/users/with-permissions")
async def get_users_with_permissions(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Kullanıcının "permission_management" izni olup olmadığını kontrol et
    if not await has_permission(db, current_user.id, "permission_management"):
        raise HTTPException(status_code=403, detail="Bu işlemi gerçekleştirmek için gerekli izne sahip değilsiniz.")

    # Eğer izin varsa, tüm kullanıcıları ve izinlerini getir
    users_with_permissions = await get_all_users_with_permissions(db)
    return users_with_permissions