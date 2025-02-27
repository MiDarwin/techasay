from database import db

async def get_permissions_by_user_id(_id: int):
    """
    Veritabanından _id'ye göre permissions'ları al.
    """
    user = await db.users.find_one({"_id": _id})  # _id üzerinden sorgulama yapıyoruz
    if not user:
        return None  # Kullanıcı bulunamadı
    return user.get("permissions", [])  # Varsayılan olarak boş bir liste döndürülecek

async def update_permissions_by_user_id(_id: int, new_permissions: list):
    """
    Hedef kullanıcının izinlerini güncelle.
    """
    result = await db.users.update_one(
        {"_id": _id},  # _id üzerinden sorgulama yapıyoruz
        {"$set": {"permissions": new_permissions}}
    )
    if result.matched_count == 0:  # Kullanıcı bulunamadıysa
        return False
    return True

async def get_all_users_with_permissions():
    """
    Veritabanından tüm kullanıcıları, email ve izinlerini getir.
    """
    # `_id`, email ve permissions alanlarını açıkça sorguya dahil ediyoruz
    users = await db.users.find({}, {"_id": 1, "email": 1, "permissions": 1}).to_list(length=None)
    return users

async def get_user_by_id(_id: int):
    """
    Veritabanından _id'ye göre kullanıcı bilgilerini alır.
    """
    user = await db.users.find_one({"_id": _id}, {"_id": 1, "email": 1, "permissions": 1})
    return user