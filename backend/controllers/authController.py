from models.userModel import User, LoginUser
from services.authService import save_user, authenticate_user, get_user_by_id
from utils.tokenUtils import create_access_token, get_user_id_from_token
from fastapi import HTTPException, Header


async def register_user(user: User):
    """
    Yeni kullanıcı kaydı oluşturur.
    """
    user_id = await save_user(user)
    if not user_id:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi ile bir kullanıcı zaten kayıtlı.")
    return {"message": f"Kullanıcı başarıyla kaydedildi. Kullanıcı ID: {user_id}"}


async def login_user(user: LoginUser):
    """
    Kullanıcı giriş işlemini gerçekleştirir.
    """
    is_authenticated, user_data_or_error = await authenticate_user(user)
    if not is_authenticated:
        raise HTTPException(status_code=401, detail=user_data_or_error)

    token_data = {"user_id": user_data_or_error["_id"]}
    access_token = create_access_token(data=token_data)
    return {"access_token": access_token, "token_type": "Bearer"}


async def get_user_info(authorization: str, info_type: str):
    """
    Kullanıcı bilgilerini döndürür.
    """
    # Authorization başlığından JWT token alınır
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Geçersiz veya eksik Authorization başlığı.")

    token = authorization.split(" ")[1]  # "Bearer <token>" formatından token'ı ayıkla

    # Token'den kullanıcı ID'sini al
    user_id = get_user_id_from_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Geçersiz veya süresi dolmuş token.")

    # Kullanıcı bilgilerini al
    user_data = await get_user_by_id(user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    # Bilgi tipine göre döndürme işlemi
    if info_type == "name":
        return {"name": user_data["name"]}
    elif info_type == "name-surname":
        return {"name": user_data["name"], "surname": user_data["surname"]}
    elif info_type == "all":
        return user_data
    else:
        raise HTTPException(status_code=400, detail="Geçersiz bilgi türü.")