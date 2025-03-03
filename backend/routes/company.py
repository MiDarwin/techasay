# routes/company.py

from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from schemas.company import Company, CompanyCreate, CompanyUpdate
from services.company import (
    get_all_companies,
    get_company_by_id,
    get_company_by_company_id,
    create_company,
    update_company,
    delete_company
)
from utils.auth import get_current_user

router = APIRouter(
    prefix="/companies",
    tags=["Companies"],
    dependencies=[Depends(get_current_user)],  # Tüm endpoint'ler için yetkilendirme
    responses={404: {"description": "Not Found"}},
)

@router.post("/", response_model=Company, status_code=status.HTTP_201_CREATED)
async def create_new_company(company: CompanyCreate):
    return await create_company(company)

@router.get("/", response_model=List[Company])
async def read_companies():
    return await get_all_companies()

@router.get("/{_id}", response_model=Company)
async def read_company(_id: str):
    return await get_company_by_id(_id)

@router.get("/by_company_id/{company_id}", response_model=Company)
async def read_company_by_company_id(company_id: int):
    return await get_company_by_company_id(company_id)

@router.put("/{_id}", response_model=Company)
async def modify_company(_id: str, company: CompanyUpdate):
    return await update_company(_id, company)

@router.delete("/{_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_company(_id: str):
    await delete_company(_id)
    return