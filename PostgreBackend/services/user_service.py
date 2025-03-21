# services/user_service.py
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.permissions import Permission
from models.user import User
from schemas.user import UserCreate
from utils.bearerToken import create_access_token
from sqlalchemy.sql import or_

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

async def update_user_password(db: AsyncSession, user_id: int, email: str, old_password: str, new_password: str):
    user = await get_user_by_id(db, user_id)
    if not user or user.email != email or not user.verify_password(old_password):
        raise ValueError("Eski şifre veya e-posta hatalı.")

    user.set_password(new_password)  # Yeni şifreyi ayarla
    db.add(user)  # Güncelleme için kullanıcıyı ekle
    await db.commit()  # Değişiklikleri kaydet
    await db.refresh(user)  # Güncellenmiş kullanıcıyı getir
    return user

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
async def get_all_users_with_permissions(db: AsyncSession, search: str = None, limit: int = 50):
    """
    Tüm kullanıcıların isim, soyisim, e-posta ve izin bilgilerini getirir.
    Eğer bir 'search' parametresi verilirse, belirtilen alanlarda filtre uygular.
    """
    # Kullanıcılar ve izinlerine ilişkin temel sorgu
    query = select(User, Permission).join(Permission, User.id == Permission.user_id, isouter=True)
    # Eğer bir arama parametresi varsa, filtre uygula
    if search:
        search_filter = or_(
            User.name.ilike(f"%{search}%"),
            User.surname.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%"),
            User.phone_number.ilike(f"%{search}%"),
        )
        query = query.where(search_filter)

    # Limiti uygula
    query = query.limit(limit)

    # Sorguyu çalıştır ve sonuçları al
    result = await db.execute(query)

    # Sonuçları işleyip döndür
    users_with_permissions = []
    for user, permission in result.unique().all():
        users_with_permissions.append({
            "id": user.id,
            "name": user.name,
            "surname": user.surname,
            "email": user.email,
            "phone_number": user.phone_number,
            "permissions": permission.permissions if permission else []
        })

    return users_with_permissions
async def update_user_permissions(db: AsyncSession, user_id: int, new_permissions: list):
    """
    Bir kullanıcının izinlerini günceller.
    :param db: Veritabanı oturumu
    :param user_id: İzinleri güncellenecek kullanıcının ID'si
    :param new_permissions: Güncellenmek istenen izinlerin listesi
    :return: Güncellenen kullanıcı izinleri
    """
    # Kullanıcıyı getir
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    # Kullanıcının mevcut izinlerini getir
    result = await db.execute(select(Permission).where(Permission.user_id == user_id))
    existing_permission = result.scalar_one_or_none()

    if existing_permission:
        # Mevcut izinleri güncelle
        existing_permission.permissions = new_permissions
    else:
        # Kullanıcı için yeni bir izin kaydı oluştur
        new_permission = Permission(
            user_id=user_id,
            permissions=new_permissions
        )
        db.add(new_permission)

    # Değişiklikleri kaydet
    await db.commit()
    await db.refresh(user)

    return {
        "id": user.id,
        "name": user.name,
        "surname": user.surname,
        "email": user.email,
        "permissions": new_permissions
    }