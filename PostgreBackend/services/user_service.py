# services/user_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from models.user import User
from schemas.user import UserCreate

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