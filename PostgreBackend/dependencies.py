# dependencies.py
from fastapi import Depends, HTTPException, Security
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from services.user_service import get_user_by_id
from utils.bearerToken import verify_token, get_user_id_from_token
from models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    user_id = get_user_id_from_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Geçersiz token")

    user = await get_user_by_id(db, user_id)  # Kullanıcıyı ID ile bul
    if user is None:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

    return user