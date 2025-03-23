# routes/company.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.company import CompanyCreate, CompanyResponse, CompanyUpdate
from services.company_service import create_company, get_companies, get_company_by_company_id
from database import get_db

router = APIRouter()

@router.post("/companies", response_model=CompanyResponse)
async def create_company_endpoint(company: CompanyCreate, db: AsyncSession = Depends(get_db)):
    try:
        db_company = await create_company(db, company)
        return db_company
    except HTTPException as e:
        raise e  # Hata mesajını döndür
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  # Genel hata

@router.get("/companies", response_model=list[CompanyResponse])
async def read_companies(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    companies = await get_companies(db, skip=skip, limit=limit)
    return companies

@router.put("/companies/{company_id}", response_model=CompanyResponse)
async def update_company_endpoint(company_id: int, company: CompanyUpdate, db: AsyncSession = Depends(get_db)):
    db_company = await get_company_by_company_id(db, company_id)
    if not db_company:
        raise HTTPException(status_code=404, detail="Şirket bulunamadı.")

    # Şirket adını güncelle
    db_company.name = company.name
    await db.commit()
    await db.refresh(db_company)
    return db_company

@router.delete("/companies/{company_id}", response_model=dict)
async def delete_company_endpoint(company_id: int, db: AsyncSession = Depends(get_db)):
    db_company = await get_company_by_company_id(db, company_id)
    if not db_company:
        raise HTTPException(status_code=404, detail="Şirket bulunamadı.")

    await db.delete(db_company)
    await db.commit()
    return {"detail": "Şirket başarıyla silindi."}