from database import db
from models.userModel import User
from passlib.hash import bcrypt

async def save_user(user: User):
    # Kullanıcının mevcut olup olmadığını kontrol et
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        return True

    # Şifreyi bcrypt ile şifrele
    hashed_password = bcrypt.hash(user.password)
    user.password = hashed_password

    # Kullanıcıyı veritabanına ekle
    await db.users.insert_one(user.dict())
    return False
