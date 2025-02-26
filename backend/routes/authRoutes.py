from fastapi import APIRouter, Depends, Header
from controllers.authController import register_user, login_user, get_user_info
from models.userModel import User, LoginUser

router = APIRouter(prefix="/user", tags=["User"])

@router.post("/register")
async def register(user: User):
    return await register_user(user)

@router.post("/login")
async def login(user: LoginUser):
    return await login_user(user)

@router.get("/{info_type}")
async def get_user_info_route(info_type: str, authorization: str = Header(...)):
    """
    Kullanıcı bilgilerini döndürür.
    info_type: "name", "name-surname", veya "all"
    """
    token = authorization.split(" ")[1]  # "Bearer <token>" formatından token'ı ayıkla
    return await get_user_info(token, info_type)