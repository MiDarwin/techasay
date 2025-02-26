import random
from database import db
from models.userModel import User, LoginUser
from passlib.hash import bcrypt

async def save_user(user: User):
    """
    Kullanıcıyı veritabanına kaydeder. Eğer e-posta zaten kayıtlıysa `None` döner.
    """
    # Kullanıcının mevcut olup olmadığını kontrol et
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        return None

    # Şifreyi bcrypt ile şifrele
    hashed_password = bcrypt.hash(user.password)
    user.password = hashed_password

    # Rastgele 5 rakamlı bir user_id oluştur
    user_id = random.randint(10000, 99999)

    # Kullanıcıyı veritabanına ekle
    user_dict = user.dict()
    user_dict["_id"] = user_id
    await db.users.insert_one(user_dict)
    return user_id

async def authenticate_user(user: LoginUser):
    """
    Kullanıcıyı e-posta ve şifre ile doğrular.
    """
    # Veritabanında e-posta adresine göre kullanıcıyı bul
    existing_user = await db.users.find_one({"email": user.email})
    if not existing_user:
        return False, "Bu e-posta adresi ile bir hesap bulunmamaktadır."

    # Girilen şifre ile kayıtlı şifreyi karşılaştır
    is_valid_password = bcrypt.verify(user.password, existing_user["password"])
    if not is_valid_password:
        return False, "Girilen şifre hatalı."

    # Kullanıcı doğrulandı, bilgileri döndür
    return True, existing_user

async def get_user_by_id(user_id: int):
    """
    Kullanıcı ID'sine göre kullanıcı bilgilerini döndürür.
    """
    return await db.users.find_one({"_id": user_id}, {"_id": 0, "password": 0})  # Şifreyi döndürme