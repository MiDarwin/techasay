from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from utils.tokenUtils import get_user_id_from_token
from services.permissionService import get_permissions_by_user_id
import pandas as pd
import os
from pythonping import ping

router = APIRouter(prefix="/ping", tags=["Ping Operations"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Yüklenen dosyaları kaydedeceğimiz klasör
UPLOAD_FOLDER = "uploaded_excels"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Ping sonuçlarını saklayacağımız bir global değişken
ping_results = []


async def validate_user_permission(token: str):
    """Kullanıcının Bpet yetkisi olup olmadığını kontrol et."""
    user_id = get_user_id_from_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    permissions = await get_permissions_by_user_id(user_id)
    if "Bpet" not in permissions:
        raise HTTPException(status_code=403, detail="Permission denied: You do not have Bpet permission.")
    return user_id


@router.post("/upload/")
async def upload_excel(file: UploadFile = File(...), token: str = Depends(oauth2_scheme)):
    """
    Excel dosyasını yükle ve kaydet.
    Kullanıcının Bpet yetkisi olmalı.
    """
    # Kullanıcı yetkisini doğrula
    await validate_user_permission(token)

    # Dosyayı kaydet
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    return {"message": f"File '{file.filename}' uploaded successfully."}


@router.get("/ping/")
async def ping_ips(token: str = Depends(oauth2_scheme)):
    """
    Yüklenen Excel dosyasındaki IP'lere ping at.
    """
    # Kullanıcı yetkisini doğrula
    await validate_user_permission(token)

    # Yüklenen dosyalardan son ekleneni oku
    uploaded_files = os.listdir(UPLOAD_FOLDER)
    if not uploaded_files:
        raise HTTPException(status_code=400, detail="No Excel file uploaded.")

    latest_file = os.path.join(UPLOAD_FOLDER, uploaded_files[-1])
    df = pd.read_excel(latest_file)

    if "Otomasyon PC IP" not in df.columns:
        raise HTTPException(status_code=400, detail="Otomasyon PC IP column not found in the Excel file.")

    global ping_results
    ping_results = []

    # IP adreslerine ping at
    for index, row in df.iterrows():
        original_ip = str(row["Otomasyon PC IP"]).strip()
        if not original_ip:
            continue

        # Son bloğu 1 yap
        ip_parts = original_ip.split(".")
        ip_parts[-1] = "1"
        new_ip = ".".join(ip_parts)

        # 3 defa ping at
        success = False
        for _ in range(3):
            response = ping(new_ip, count=1, timeout=1)
            if response.success():
                success = True
                break

        ping_results.append({
            "row": index + 1,  # Satır numarası
            "original_ip": original_ip,
            "ping_ip": new_ip,
            "status": "Success" if success else "Fail"
        })

    # Başarı ve başarısızlık sayısını hesapla
    success_count = sum(1 for result in ping_results if result["status"] == "Success")
    fail_count = len(ping_results) - success_count

    return {
        "summary": {
            "success": success_count,
            "fail": fail_count
        },
        "details": ping_results
    }


@router.get("/retry/")
async def retry_failed_pings(token: str = Depends(oauth2_scheme)):
    """
    Başarısız olan IP adreslerine tekrar ping at.
    """
    # Kullanıcı yetkisini doğrula
    await validate_user_permission(token)

    global ping_results
    if not ping_results:
        raise HTTPException(status_code=400, detail="No ping data available. Run the /ping/ endpoint first.")

    retry_results = []

    # Sadece başarısız olanları tekrar dene
    for result in ping_results:
        if result["status"] == "Fail":
            success = False
            for _ in range(3):
                response = ping(result["ping_ip"], count=1, timeout=1)
                if response.success():
                    success = True
                    break

            retry_results.append({
                "row": result["row"],
                "original_ip": result["original_ip"],
                "ping_ip": result["ping_ip"],
                "status": "Success" if success else "Fail"
            })

    # Eski sonuçları güncelle
    ping_results = [res for res in ping_results if res["status"] == "Success"] + retry_results

    # Başarı ve başarısızlık sayısını hesapla
    success_count = sum(1 for result in ping_results if result["status"] == "Success")
    fail_count = len(ping_results) - success_count

    return {
        "summary": {
            "success": success_count,
            "fail": fail_count
        },
        "details": retry_results
    }
