from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from utils.tokenUtils import get_user_id_from_token
from services.permissionService import get_permissions_by_user_id
from services.excelService import get_existing_excel_data, process_excel_file
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/excel", tags=["Excel"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/upload/")
async def upload_excel_file(file: UploadFile = File(...), token: str = Depends(oauth2_scheme)):
    """
    Kullanıcı bir Excel dosyası yükler ve veriler MongoDB'ye kaydedilir.
    """
    # Kullanıcı token'ini doğrula
    user_id = get_user_id_from_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Kullanıcının Bpet iznini kontrol et
    permissions = await get_permissions_by_user_id(user_id)
    if not permissions or "Bpet" in permissions:
        # Excel dosyasını işle
        try:
            result = await process_excel_file(file.file)
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise HTTPException(status_code=403, detail="Permission denied: You do not have Bpet permission.")


@router.get("/existing-data/")
async def get_existing_data(token: str = Depends(oauth2_scheme)):
    """
    MongoDB'deki mevcut Excel verilerini döndür.
    """
    # Kullanıcı token'ini doğrula
    user_id = get_user_id_from_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Kullanıcının Bpet iznini kontrol et
    permissions = await get_permissions_by_user_id(user_id)
    if not permissions or "Bpet" not in permissions:
        raise HTTPException(status_code=403, detail="Permission denied: You do not have Bpet permission.")

    # Mevcut verileri al
    try:
        existing_data = await get_existing_excel_data()
        return {"message": "Existing data fetched successfully.", "data": existing_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))