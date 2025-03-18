# services/user_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.permissions import Permission
from models.user import User
from schemas.user import UserCreate
from utils.bearerToken import create_access_token

async def create_user(db: AsyncSession, user: UserCreate):
    # E-posta kontrolü
    existing_user = await get_user_by_email(db, user.email)
    if existing_user:
        raise ValueError("Bu e-posta adresi zaten kullanılıyor.")

    db_user = User(
        name=user.name,  # İsim
        surname=user.surname,  # Soyisim
        email=user.email,  # Email
        phone_number=user.phone_number  # Telefon numarası
    )
    db_user.set_password(user.password)  # Şifreyi hash'le
    db.add(db_user)
    await db.commit()  # Veritabanına ekle
    await db.refresh(db_user)  # Güncelle
    return db_user

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).filter(User.email == email))
    return result.scalars().first()  # İlk sonucu döndür

async def verify_user_password(db: AsyncSession, email: str, password: str):
    user = await get_user_by_email(db, email)
    if user and user.verify_password(password):  # Şifreyi kontrol et
        return True
    return False


async def login_user(db: AsyncSession, email: str, password: str):
    user = await get_user_by_email(db, email)
    if not user or not user.verify_password(password):
        raise ValueError("E-posta veya şifre hatalı.")

    # Token oluştur
    access_token = create_access_token(data={"user_id": user.id})
    return {
        "id": user.id,
        "name": user.name,
        "surname": user.surname,
        "email": user.email,
        "phone_number": user.phone_number,
        "access_token": access_token,
        "token_type": "bearer"
    }
# services/user_service.py
async def get_user_by_id(db: AsyncSession, user_id: int):
    result = await db.execute(select(User).filter(User.id == user_id))
    return result.scalars().first()  # İlk sonucu döndür
async def get_all_users_with_permissions(db: AsyncSession):
    """
    Tüm kullanıcıların isim, soyisim, e-posta ve izin bilgilerini getirir.
    """
    result = await db.execute(select(User, Permission).join(Permission, User.id == Permission.user_id))
    users_with_permissions = []
    for user, permission in result.all():
        users_with_permissions.append({
            "id": user.id,
            "name": user.name,
            "surname": user.surname,
            "email": user.email,
            "permissions": permission.permissions if permission else []
        })
    return users_with_permissions