# routes/company.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.company import CompanyCreate, CompanyResponse
from services.company_service import create_company, get_companies
from database import get_db

router = APIRouter()

@router.post("/companies", response_model=CompanyResponse)
async def create_company_endpoint(company: CompanyCreate, db: AsyncSession = Depends(get_db)):
    try:
        db_company = await create_company(db, company)
        return db_company
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/companies", response_model=list[CompanyResponse])
async def read_companies(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    companies = await get_companies(db, skip=skip, limit=limit)
    return companies