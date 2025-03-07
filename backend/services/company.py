# services/company.py

from database import company_collection, company_helper
from schemas.company import CompanyCreate, CompanyUpdate, Company
from fastapi import HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId
from database import branch_collection  # Circular import önlemek için içeriye alıyoruz
from pymongo.errors import DuplicateKeyError

async def get_all_companies() -> List[Company]:
    companies = []
    async for company in company_collection.find():
        companies.append(company_helper(company))
    return companies


async def get_company_by_id(_id: str) -> Company:
    if not ObjectId.is_valid(_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid company ID format")
    company = await company_collection.find_one({"_id": ObjectId(_id)})
    if company:
        return company_helper(company)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")


async def get_company_by_company_id(company_id: int) -> Company:
    company = await company_collection.find_one({"company_id": company_id})
    if company:
        return company_helper(company)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")


async def create_company(company: CompanyCreate) -> Company:
    # company_id'nin benzersiz olup olmadığını kontrol et
    existing_company = await company_collection.find_one({"company_id": company.company_id})
    if existing_company:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="company_id already exists")

    company_dict = company.dict()
    company_dict["created_at"] = datetime.utcnow()
    company_dict["updated_at"] = datetime.utcnow()

    new_company = await company_collection.insert_one(company_dict)
    created_company = await company_collection.find_one({"_id": new_company.inserted_id})
    return company_helper(created_company)


async def update_company(_id: str, company: CompanyUpdate) -> Company:
    if not ObjectId.is_valid(_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid company ID format")

    update_data = {k: v for k, v in company.dict().items() if v is not None}

    # company_id'nin benzersiz olup olmadığını kontrol et
    if "company_id" in update_data:
        existing_company = await company_collection.find_one({"company_id": update_data["company_id"]})
        if existing_company and str(existing_company["_id"]) != _id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Company ID {update_data['company_id']} already exists for another company."
            )

    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        try:
            result = await company_collection.update_one({"_id": ObjectId(_id)}, {"$set": update_data})
            if result.modified_count == 1:
                updated_company = await company_collection.find_one({"_id": ObjectId(_id)})
                if updated_company:
                    return company_helper(updated_company)
        except DuplicateKeyError as e:
            # DuplicateKeyError durumunda daha açıklayıcı bir hata mesajı döndürün
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Duplicate company_id detected: {update_data.get('company_id')}. "
                       f"Ensure that the company_id is unique. Full error: {str(e)}"
            )

    # Eğer güncellenmemişse, mevcut şirketi dön
    existing_company = await company_collection.find_one({"_id": ObjectId(_id)})
    if existing_company:
        return company_helper(existing_company)

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

async def delete_company(_id: str) -> None:
    if not ObjectId.is_valid(_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid company ID format")

    # Şirket silmeden önce ilişkili şubelerin olup olmadığını kontrol et

    branch = await branch_collection.find_one({"company_id": _id})  # Şirket ID'sini ObjectId olarak göndermediniz
    if branch:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Cannot delete company with existing branches")

    delete_result = await company_collection.delete_one({"_id": ObjectId(_id)})
    if delete_result.deleted_count == 1:
        return
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")