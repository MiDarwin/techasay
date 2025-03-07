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


async def update_company(_id: str, company: CompanyUpdate) -> dict:
    # 1. _id'nin geçerli bir ObjectId olup olmadığını kontrol et
    if not ObjectId.is_valid(_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid company ID format"
        )

    # 2. Güncelleme verilerini filtrele (None olanları çıkar)
    update_data = {k: v for k, v in company.dict().items() if v is not None}

    # 3. Mevcut şirketi bul (_id ile)
    existing_company = await company_collection.find_one({"_id": ObjectId(_id)})
    if not existing_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {_id} not found."
        )

    # 4. Eğer "company_id" değiştiriliyorsa, ilişkili şubeleri kontrol et
    if "company_id" in update_data:
        if update_data["company_id"] != existing_company["company_id"]:
            # Bu şirkete ait şubeler var mı?
            related_branch = await branch_collection.find_one({"company_id": existing_company["company_id"]})
            if related_branch:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Cannot update company ID because this company has associated branches. "
                        "Please delete or reassign the branches first."
                    )
                )

    # 5. Güncelleme verisi varsa, updated_at alanını güncelle
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        try:
            # Şirketi güncelle
            result = await company_collection.update_one({"_id": ObjectId(_id)}, {"$set": update_data})
            if result.modified_count == 1:
                updated_company = await company_collection.find_one({"_id": ObjectId(_id)})
                if updated_company:
                    return company_helper(updated_company)
        except DuplicateKeyError as e:
            # DuplicateKeyError durumunda açıklayıcı bir hata mesajı döndür
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Duplicate company_id detected: {update_data.get('company_id')}. "
                       f"Ensure that the company_id is unique. Full error: {str(e)}"
            )

    # 6. Eğer güncellenmemişse, mevcut şirketi dön
    existing_company = await company_collection.find_one({"_id": ObjectId(_id)})
    if existing_company:
        return company_helper(existing_company)

    # 7. Şirket bulunamazsa hata fırlat
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Company not found"
    )
async def delete_company(_id: str) -> None:
    # 1. _id'nin geçerli bir ObjectId olup olmadığını kontrol et
    if not ObjectId.is_valid(_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid company ID format. It should be a valid ObjectId."
        )

    # 2. Veritabanından _id ile şirket kaydını bul
    company = await company_collection.find_one({"_id": ObjectId(_id)})
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with _id {_id} not found."
        )

    # 3. Şirketin company_id'sini al
    company_id = company["company_id"]

    # 4. branch_collection'da bu company_id ile ilişkili şubeler olup olmadığını kontrol et
    associated_branch = await branch_collection.find_one({"company_id": company_id})
    if associated_branch:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Cannot delete the company with ID {_id}. "
                "This company has associated branches. Please delete or reassign the branches first."
            )
        )

    # 5. Şirketi sil (_id üzerinden)
    delete_result = await company_collection.delete_one({"_id": ObjectId(_id)})
    if delete_result.deleted_count == 1:
        return

    # 6. Eğer silme başarısızsa, hata fırlat
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to delete the company with _id {_id}."
    )