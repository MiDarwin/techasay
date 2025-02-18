from database import db

async def get_permissions_by_user_id(user_id: int):
    """Veritabanından user_id'ye göre permissions'ları al."""
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        return None  # Kullanıcı bulunamadı
    return user.get("permissions", [])  # Varsayılan olarak boş bir liste döndürülecek
