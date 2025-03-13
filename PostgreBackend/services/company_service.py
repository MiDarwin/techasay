# services/company_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.company import Company
from schemas.company import CompanyCreate

async def create_company(db: AsyncSession, company: CompanyCreate):
    db_company = Company(name=company.name, company_id=company.company_id)
    db.add(db_company)
    await db.commit()
    await db.refresh(db_company)
    return db_company

async def get_company_by_id(db: AsyncSession, company_id: int):
    result = await db.execute(select(Company).filter(Company.id == company_id))
    return result.scalars().first()

async def get_companies(db: AsyncSession, skip: int = 0, limit: int = 10):
    result = await db.execute(select(Company).offset(skip).limit(limit))
    return result.scalars().all()