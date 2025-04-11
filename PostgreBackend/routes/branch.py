# routes/branch.py
from typing import Optional
from fastapi.responses import FileResponse
from fastapi import APIRouter, Depends, HTTPException,Query,Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from dependencies import oauth2_scheme
from models.user import User
from schemas.branch import BranchCreate, BranchResponse, BranchUpdate
from services.branch_service import create_branch, get_branches, update_branch, delete_branch, create_sub_branch, \
    get_sub_branches,get_filtered_branches, add_favorite_branch,remove_favorite_branch,create_excel_file
from database import get_db
from utils.bearerToken import get_user_id_from_token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")  # Token doğrulama şeması
from models.permissions import Permission

router = APIRouter()

@router.post("/companies/{company_id}/branches", response_model=BranchResponse)
async def create_branch_endpoint(company_id: int, branch: BranchCreate, db: AsyncSession = Depends(get_db)):
    try:
        created_branch = await create_branch(db, branch, company_id)
        return created_branch  # Başarılı yanıt olarak oluşturulan dalı döndür
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  # Hata durumunda uygun bir yanıt döndür

@router.get("/companies/{company_id}/branches", response_model=list[BranchResponse])
async def read_branches(
    company_id: int,
    skip: int = 0,
    limit: int = 10,
    city: str = Query(None),  # city opsiyonel bir query parametresi
    district: str = Query(None),
    textinput: str = Query(None),  # textinput opsiyonel bir query parametresi
    include_sub_branches: bool = Query(False),  # Alt şubeler dahil edilsin mi?
    db: AsyncSession = Depends(get_db)
):
    return await get_branches(db, company_id, skip=skip, limit=limit, city=city,district=district, textinput=textinput)

@router.put("/branches/{branch_id}", response_model=BranchUpdate)
async def update_branch_endpoint(branch_id: int, branch: BranchUpdate, db: AsyncSession = Depends(get_db)):
    updated_branch = await update_branch(db, branch_id, branch)
    if not updated_branch:
        raise HTTPException(status_code=404, detail="Şube bulunamadı.")

    # Pydantic modeline dönüştürme
    return BranchUpdate.from_orm(updated_branch)

@router.delete("/branches/{branch_id}", response_model=dict)
async def delete_branch_endpoint(branch_id: int, db: AsyncSession = Depends(get_db)):
    deleted_branch = await delete_branch(db, branch_id)
    if not deleted_branch:
        raise HTTPException(status_code=404, detail="Şube bulunamadı.")
    return {"detail": "Şube başarıyla silindi."}
from services.branch_service import create_branch, get_branches, get_all_branches, update_branch, delete_branch

@router.get("/branches", response_model=list[BranchResponse])
async def read_all_branches(
    limit: int = 50,  # Varsayılan limit 50
    city: Optional[str] = None,  # Şehir bilgisi opsiyonel
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """
    Şirket ID olmadan tüm şubeleri getirir. Varsayılan olarak ilk 50 şubeyi döndürür.
    Şehir bilgisi sağlanırsa, sadece o şehirdeki şubeleri döndürür.
    """
    user_id = get_user_id_from_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Geçersiz veya süresi dolmuş token.")

    return await get_all_branches(db, user_id=user_id, limit=limit, city=city)
# Alt Şube Ekleme (POST)
@router.post("/branches/{parent_branch_id}/sub-branches", response_model=BranchResponse)
async def create_sub_branch_endpoint(
    parent_branch_id: int, branch: BranchCreate, db: AsyncSession = Depends(get_db)
):
    try:
        created_sub_branch = await create_sub_branch(db, branch, parent_branch_id)
        return created_sub_branch
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/branches/{branch_id}/sub-branches", response_model=list[BranchResponse])
async def get_sub_branches_endpoint(branch_id: int, db: AsyncSession = Depends(get_db)):
    """
    Belirtilen branch_id'ye ait alt şubeleri döndürür.
    """
    sub_branches = await get_sub_branches(db, branch_id)
    if not sub_branches:
        raise HTTPException(status_code=404, detail="Alt şube bulunamadı.")
    return sub_branches


@router.post("/branches/{branch_id}/favorites")
async def add_to_favorites(
    branch_id: int,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    # Token'den kullanıcı ID'sini çıkar
    user_id = get_user_id_from_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Geçersiz veya süresi dolmuş token.")

    # Favori ekleme servisini çağır
    return await add_favorite_branch(db, user_id, branch_id)
@router.delete("/branches/{branch_id}/favorites")
async def remove_favorite_branch_endpoint(
    branch_id: int,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    user_id = get_user_id_from_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Geçersiz veya süresi dolmuş token.")

    # Favori şubeyi kaldırma işlemini çağır
    return await remove_favorite_branch(db, user_id, branch_id)
@router.get("/branches/export", response_description="Excel dosyası olarak şubeleri indir")
async def export_branches(
    company_id: int = Query(None),
    city: str = Query(None),
    district: str = Query(None),
    db: AsyncSession = Depends(get_db),
    authorization: str = Header(None)  # Authorization header'dan token alınıyor
):
    """
    Şubeleri filtreleyerek Excel dosyası olarak kullanıcıya gönderir.
    Kullanıcının 'branchViewing' izni kontrol edilir.
    """
    # Authorization header'dan token çıkar
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header eksik.")

    # Kullanıcı ID'sini token'dan al
    try:
        user_id = get_user_id_from_token(authorization.replace("Bearer ", ""))
    except HTTPException as e:
        raise HTTPException(status_code=401, detail="Geçersiz token.") from e

    # Kullanıcının izinlerini kontrol et
    permission = await db.execute(
        select(Permission).filter(Permission.user_id == user_id)
    )
    permission_data = permission.scalars().first()
    if not permission_data or "branchViewing" not in permission_data.permissions:
        raise HTTPException(
            status_code=403, detail="Şube bilgilerini görüntüleme yetkiniz yok."
        )
    # Şubeleri filtrele
    branches = await get_filtered_branches(db, company_id=company_id, city=city, district=district)

    # Excel dosyasını oluştur
    temp_file_name = await create_excel_file(branches)

    # Excel dosyasını kullanıcıya gönder
    return FileResponse(
        temp_file_name,
        filename="subeler.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )