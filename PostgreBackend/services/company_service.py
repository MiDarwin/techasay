# services/company_service.py
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.company import Company
from schemas.company import CompanyCreate

from sqlalchemy.future import select  # Asenkron sorgular için gerekli

async def create_company(db: AsyncSession, company: CompanyCreate):
    # Aynı isimde bir şirket var mı kontrol et
    query = select(Company).where(Company.name == company.name)
    result = await db.execute(query)
    existing_company = result.scalar_one_or_none()  # Tek bir sonuç bekleniyor

    if existing_company:
        raise HTTPException(
            status_code=400,
            detail=f"'{company.name}' isimli bir şirket zaten mevcut."
        )

    # Yeni şirket oluştur
    db_company = Company(name=company.name)  # company_id alınmıyor, yalnızca name alınacak
    db.add(db_company)
    await db.commit()
    await db.refresh(db_company)

    # id'yi company_id'ye atıyoruz
    db_company.company_id = db_company.id
    db.add(db_company)
    await db.commit()
    await db.refresh(db_company)

    return db_company

async def get_company_by_company_id(db: AsyncSession, company_id: int):
    # company_id'ye göre sorgulama yapıyoruz
    result = await db.execute(select(Company).filter(Company.company_id == company_id))
    return result.scalars().first()

async def get_companies(db: AsyncSession, skip: int = 0, limit: int = 10):
    result = await db.execute(select(Company).offset(skip).limit(limit))
    return result.scalars().all()