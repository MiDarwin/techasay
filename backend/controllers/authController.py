from models.userModel import User, LoginUser
from services.authService import save_user, authenticate_user
from utils.tokenUtils import create_access_token
from fastapi import HTTPException

async def register_user(user: User):
    # Kullanıcıyı kaydetmeye çalış
    user_id = await save_user(user)
    if not user_id:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi ile bir kullanıcı zaten kayıtlı.")
    return {"message": f"Kullanıcı başarıyla kaydedildi. Kullanıcı ID: {user_id}"}

async def login_user(user: LoginUser):
    # Kullanıcıyı doğrula
    is_authenticated, user_data_or_error = await authenticate_user(user)
    if not is_authenticated:
        raise HTTPException(status_code=401, detail=user_data_or_error)

    # Kullanıcı doğrulandı, Bearer Token oluştur
    token_data = {"user_id": user_data_or_error["user_id"]}
    access_token = create_access_token(data=token_data)
    return {"access_token": access_token, "token_type": "Bearer"}
