# routes/branch.py
from fastapi import APIRouter, Depends, HTTPException,Query
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.branch import BranchCreate, BranchResponse, BranchUpdate
from services.branch_service import create_branch, get_branches, update_branch, delete_branch, create_sub_branch, \
    get_sub_branches
from database import get_db

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
    textinput: str = Query(None),  # textinput opsiyonel bir query parametresi
    include_sub_branches: bool = Query(False),  # Alt şubeler dahil edilsin mi?
    db: AsyncSession = Depends(get_db)
):
    return await get_branches(db, company_id, skip=skip, limit=limit, city=city, textinput=textinput)

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
    db: AsyncSession = Depends(get_db)
):
    """
    Şirket ID olmadan tüm şubeleri getirir. Varsayılan olarak ilk 50 şubeyi döndürür.
    """
    return await get_all_branches(db, limit=limit)
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