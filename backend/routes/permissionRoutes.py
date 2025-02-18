from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from utils.tokenUtils import get_user_id_from_token
from services.permissionService import get_permissions_by_user_id

router = APIRouter(prefix="/permissions", tags=["Permissions"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


@router.get("/")
async def get_permissions(token: str = Depends(oauth2_scheme)):
    """Token'den kullanıcı izinlerini al."""
    user_id = get_user_id_from_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    permissions = await get_permissions_by_user_id(user_id)
    if permissions is None:
        raise HTTPException(status_code=404, detail="User not found")

    return {"user_id": user_id, "permissions": permissions}
