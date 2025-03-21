# routes/user.py
from fastapi import APIRouter, Depends, HTTPException,Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from models.permissions import Permission
from dependencies import get_current_user
from models.user import User
from schemas.permissions import PermissionUpdate
from schemas.user import UserCreate, UserResponse,UserLogin,UserUpdatePassword
from services.permissions_service import has_permission
from services.user_service import create_user, login_user, get_user_by_id, get_all_users_with_permissions, \
    update_user_password, update_user_permissions
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
        phone_number=current_user.phone_number,
    )
@router.put("/users/update-password")
async def update_password(
    user_data: UserUpdatePassword,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        updated_user = await update_user_password(
            db, current_user.id, user_data.email, user_data.old_password, user_data.new_password
        )
        return {"message": "Şifre başarıyla güncellendi."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.get("/users/with-permissions")
async def get_users_with_permissions(
    search: Optional[str] = Query(None, description="Arama yapacağınız kelime (isteğe bağlı)"),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Kullanıcıları ve izinlerini getirir.
    - Eğer 'search' parametresi verilirse, belirtilen alanlarda arama yapar.
    - Eğer 'search' parametresi verilmezse, ilk 50 kullanıcıyı döner.
    """
    # Kullanıcının gerekli izne sahip olup olmadığını kontrol et
    if not await has_permission(db, current_user.id, "permission_management"):
        raise HTTPException(status_code=403, detail="Bu işlemi gerçekleştirmek için gerekli izne sahip değilsiniz.")

    # Kullanıcıları ve izinlerini getir
    users_with_permissions = await get_all_users_with_permissions(db, search=search, limit=50)
    return users_with_permissions
@router.put("/users/{user_id}/permissions", response_model=dict)
async def update_permissions(
    user_id: int,
    permission_data: PermissionUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Kullanıcının izinlerini günceller.
    :param user_id: İzinleri güncellenecek kullanıcı ID'si
    :param permission_data: Güncellenmek istenen izinlerin listesi
    :param db: Veritabanı oturumu
    :return: Güncellenen kullanıcı izinleri
    """
    try:
        updated_user = await update_user_permissions(db, user_id, permission_data.permissions)
        return {"message": "Kullanıcı izinleri başarıyla güncellendi.", "user": updated_user}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Bir hata oluştu.")