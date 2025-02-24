from database import db

async def get_permissions_by_user_id(user_id: int):
    """Veritabanından user_id'ye göre permissions'ları al."""
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        return None  # Kullanıcı bulunamadı
    return user.get("permissions", [])  # Varsayılan olarak boş bir liste döndürülecek

async def update_permissions_by_user_id(user_id: int, new_permissions: list):
    """
    Hedef kullanıcının izinlerini güncelle.
    """
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"permissions": new_permissions}}
    )
    if result.matched_count == 0:  # Kullanıcı bulunamadıysa
        return False
    return True

async def get_all_users_with_permissions():
    """
    Veritabanından tüm kullanıcıları, email ve izinlerini getir.
    """
    # `email` alanını da açıkça sorguya dahil ediyoruz
    users = await db.users.find({}, {"user_id": 1, "email": 1, "permissions": 1, "_id": 0}).to_list(length=None)
    return users
from database import db

async def get_user_by_id(user_id: int):
    """
    Veritabanından user_id'ye göre kullanıcı bilgilerini alır.
    """
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "user_id": 1, "email": 1, "permissions": 1})
    return user
