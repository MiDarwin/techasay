from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from utils.tokenUtils import get_user_id_from_token
from services.permissionService import get_permissions_by_user_id, get_all_users_with_permissions, \
    update_permissions_by_user_id
from services.permissionService import get_user_by_id  # Yeni yardımcı fonksiyon

router = APIRouter(prefix="/permissions", tags=["Permissions"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.get("/user/{_id}")
async def get_user_details(_id: int, token: str = Depends(oauth2_scheme)):
    """
    Belirtilen kullanıcı ID'sine göre kullanıcı detaylarını döner.
    """
    # Token doğrulama
    current_user_id = get_user_id_from_token(token)
    if not current_user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Kullanıcıyı veritabanından al
    user = await get_user_by_id(_id)
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    # Kullanıcı bilgilerini döndür
    return {
        "_id": user["_id"],
        "email": user["email"],
        "permissions": user.get("permissions", [])  # İzinler varsa, yoksa boş liste
    }

# Body için Pydantic model tanımı
class UpdatePermissionsRequest(BaseModel):
    target_user_id: int
    new_permissions: list

@router.post("/update/")
async def update_user_permissions(
        request: UpdatePermissionsRequest,  # Body'den alınacak parametreler
        token: str = Depends(oauth2_scheme)
):
    """
    Başka bir kullanıcının izinlerini güncelle.
    """
    # JWT'den giriş yapan kullanıcının _id'sini al
    user_id = get_user_id_from_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Giriş yapan kullanıcının kendi izinlerini kontrol et
    user_permissions = await get_permissions_by_user_id(user_id)
    if not user_permissions or "permissions_control" not in user_permissions:
        raise HTTPException(status_code=403, detail="Permission denied: You do not have permissions_control.")

    # Hedef kullanıcının izinlerini güncelle
    result = await update_permissions_by_user_id(request.target_user_id, request.new_permissions)
    if not result:
        raise HTTPException(status_code=404, detail="Target user not found.")

    return {"message": f"Permissions updated successfully for _id: {request.target_user_id}"}

@router.get("/users/")
async def get_all_users(token: str = Depends(oauth2_scheme)):
    """
    Kayıtlı kullanıcıları, email ve izinlerini getir.
    Bu işlem yalnızca permissions_control iznine sahip kullanıcılar tarafından yapılabilir.
    """
    # JWT'den giriş yapan kullanıcının _id'sini al
    user_id = get_user_id_from_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Giriş yapan kullanıcının kendi izinlerini kontrol et
    user_permissions = await get_permissions_by_user_id(user_id)
    if not user_permissions or "permissions_control" not in user_permissions:
        raise HTTPException(status_code=403, detail="Permission denied: You do not have permissions_control.")

    # Tüm kullanıcıları ve izinlerini al
    users = await get_all_users_with_permissions()
    return {"users": users}
