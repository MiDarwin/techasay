from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from services.bpetHataTakipService import process_hata_log, get_top_critical_logs_service
from services.permissionService import get_permissions_by_user_id
from utils.tokenUtils import get_user_id_from_token  # Kullanıcı ID doğrulama için gerekli
from database import db  # MongoDB bağlantısı

router = APIRouter(prefix="/bpet-hata-takip", tags=["Bpet Hata Takip"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/upload-log/")
async def upload_hata_log(file: UploadFile = File(...), token: str = Depends(oauth2_scheme)):
    """ Bpet Hata Log dosyasını işle ve veritabanına kaydet. """
    try:
        # Kullanıcı token'ini doğrula
        user_id = get_user_id_from_token(token)  # await kullanmayın
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        # Kullanıcının izinlerini kontrol et
        permissions = await get_permissions_by_user_id(user_id)
        if not permissions or "Bpet" not in permissions:
            raise HTTPException(status_code=403, detail="Permission denied: You do not have Bpet permission.")

        # Log dosyasını işle
        result = await process_hata_log(file.file)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get-logs/")
async def get_sorted_logs(page: int = 1, limit: int = 50, token: str = Depends(oauth2_scheme)):
    """
    Hata kayıtlarını kritik hata sayısına göre çoktan aza doğru getirir (sayfalama ile).
    :param page: Gösterilecek sayfa numarası (varsayılan: 1)
    :param limit: Her sayfada gösterilecek kayıt sayısı (varsayılan: 50)
    """
    try:
        # Kullanıcı token'ini doğrula
        user_id = get_user_id_from_token(token)
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        # Kullanıcının izinlerini kontrol et
        permissions = await get_permissions_by_user_id(user_id)
        if not permissions or "Bpet" not in permissions:
            raise HTTPException(status_code=403, detail="Permission denied: You do not have Bpet permission.")

        # MongoDB'deki toplam kayıt sayısını al
        total_logs_count = await db.bpet_ping_log.count_documents({})

        # Sayfalama için verileri çek
        logs_cursor = db.bpet_ping_log.find({}).skip((page - 1) * limit).limit(limit)
        logs = await logs_cursor.to_list(length=limit)

        # Kritik hata sayısına göre sıralama (MongoDB'den gelen verilere uygulanır)
        sorted_logs = sorted(logs, key=lambda x: len(x.get("kritik_hata_sayisi", [])), reverse=True)

        # Toplam sayfa sayısını hesapla
        total_pages = (total_logs_count + limit - 1) // limit  # Tamsayı bölme ile toplam sayfa

        return {
            "mesaj": "Veriler başarıyla alındı.",
            "toplam_kayit_sayisi": total_logs_count,
            "toplam_sayfa_sayisi": total_pages,
            "mevcut_sayfa": page,
            "veriler": sorted_logs
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get-top-critical-logs/")
async def get_top_critical_logs(token: str = Depends(oauth2_scheme), limit: int = 30):
    """
    En yüksek kritik hata sayısına sahip ilk N kaydı getirir. Varsayılan olarak 30 kayıt döner.
    :param limit: Döndürülecek maksimum kayıt sayısı (varsayılan: 30)
    """
    try:
        # Kullanıcı token'ini doğrula
        user_id = get_user_id_from_token(token)
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        # Kullanıcının izinlerini kontrol et
        permissions = await get_permissions_by_user_id(user_id)
        if not permissions or "Bpet" not in permissions:
            raise HTTPException(status_code=403, detail="Permission denied: You do not have Bpet permission.")

        # Service katmanını çağırarak verileri al
        top_logs = await get_top_critical_logs_service(limit)

        return {
            "mesaj": "En yüksek kritik hata sayısına sahip kayıtlar başarıyla alındı.",
            "top_kayitlar": top_logs
        }

    except RuntimeError as e:
        # Service katmanındaki hata dönerse
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        # Genel bir hata oluşursa
        raise HTTPException(status_code=500, detail=str(e))