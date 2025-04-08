import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from models.branch import Branch
from models.visit import Visit
from models.user import User
from schemas.visit import VisitCreate
from datetime import datetime
from fastapi import HTTPException, UploadFile
from pytz import timezone

# Fotoğrafların saklanacağı dizin
UPLOAD_DIR = "visit_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # Dizin yoksa oluştur

async def create_visit(branch_id: int, user_id: int, visit: VisitCreate, db: AsyncSession, photo: UploadFile = None):
    # Kullanıcıyı asenkron olarak sorgula
    user_query = select(User).where(User.id == user_id)
    result_user = await db.execute(user_query)
    user = result_user.scalars().first()

    # Şubeyi asenkron olarak sorgula
    branch_query = select(Branch).where(Branch.id == branch_id)
    result_branch = await db.execute(branch_query)
    branch = result_branch.scalars().first()

    # Kullanıcı veya şube bulunamadığında hata döndür
    if not user or not branch:
        raise HTTPException(status_code=404, detail="Kullanıcı veya şube bulunamadı.")

    # Visit date kontrolü: Kullanıcı bir tarih/saat göndermemişse, bilgisayarın gün ve saatini al
    if visit.visit_date:
        visit_date = visit.visit_date.replace(microsecond=0)  # Mikrosaniyeyi sıfırla
    else:
        local_tz = timezone("Europe/Istanbul")  # Yerel saat diliminizi buraya yazın
        visit_date = datetime.now(local_tz).replace(microsecond=0)  # Mikrosaniyeyi sıfırla

    # Fotoğrafı kaydet ve photo_id'yi belirle
    photo_id = None
    if photo:
        file_extension = photo.filename.split(".")[-1]
        photo_id = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{user_id}.{file_extension}"  # Benzersiz dosya adı
        file_path = os.path.join(UPLOAD_DIR, photo_id)

        with open(file_path, "wb") as f:
            f.write(await photo.read())  # Fotoğrafı kaydet

    # Ziyaret kaydını oluştur
    new_visit = Visit(
        branch_id=branch_id,
        user_id=user_id,
        visit_date=visit_date,
        note=visit.note,
        photo_id=photo_id,
        planned_visit_date=visit.planned_visit_date,
    )
    db.add(new_visit)  # Yeni ziyaret kaydını ekle
    await db.flush()  # Asenkron flush işlemi

    # Şube bilgilerini güncelleme
    update_query = (
        update(Branch)
        .where(Branch.id == branch_id)
        .values(last_visitor_id=user_id, visited=True)
    )
    await db.execute(update_query)  # Şube bilgilerini güncelle
    await db.commit()  # Asenkron commit işlemi
    await db.refresh(new_visit)  # Ziyaret kaydını yenile

    return new_visit