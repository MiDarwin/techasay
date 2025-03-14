# routes/branch.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.branch import BranchCreate, BranchResponse, BranchUpdate
from services.branch_service import create_branch, get_branches, update_branch, delete_branch
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
async def read_branches(company_id: int, skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    return await get_branches(db, company_id, skip=skip, limit=limit)


@router.put("/branches/{branch_id}", response_model=BranchUpdate)
async def update_branch_endpoint(branch_id: int, branch: BranchCreate, db: AsyncSession = Depends(get_db)):
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