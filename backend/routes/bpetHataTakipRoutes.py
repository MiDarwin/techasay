from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from services.bpetHataTakipService import process_hata_log
from fastapi.security import OAuth2PasswordBearer
from utils.tokenUtils import get_user_id_from_token
from services.permissionService import get_permissions_by_user_id

router = APIRouter(prefix="/bpet-hata-takip", tags=["Bpet Hata Takip"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/upload-log/")
async def upload_hata_log(file: UploadFile = File(...), token: str = Depends(oauth2_scheme)):
    """
    Bpet Hata Log dosyasını işle ve veritabanına kaydet.
    """
    # Kullanıcı token'ini doğrula
    user_id = get_user_id_from_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Kullanıcının Bpet iznini kontrol et
    permissions = await get_permissions_by_user_id(user_id)
    if not permissions or "Bpet" not in permissions:
        raise HTTPException(status_code=403, detail="Permission denied: You do not have Bpet permission.")

    # Log dosyasını işle
    try:
        result = await process_hata_log(file.file)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))