from pymongo.errors import DuplicateKeyError

from database import branch_collection, branch_helper, company_collection,inventory_collection
from schemas.branch import BranchCreate, BranchUpdate, Branch
from fastapi import HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId


async def get_all_branches(city: str = None, search: str = None, company_id: int = None) -> List[Branch]:
    query = {}

    if city:
        query["city"] = city

    if company_id:  # Şirket ID'sine göre filtre
        query["company_id"] = company_id

    if search:
        query["$or"] = [
            {"branch_name": {"$regex": search, "$options": "i"}},  # Şube adında arama
            {"address": {"$regex": search, "$options": "i"}},    # Adreste arama
            {"phone_number": {"$regex": search, "$options": "i"}} # Telefon numarasında arama
        ]

    branches = []
    async for branch in branch_collection.find(query):
        branches.append(await branch_helper(branch))
    return branches

async def get_branch_by_id(branch_id: str) -> Branch:
    if not ObjectId.is_valid(branch_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid branch ID format")
    branch = await branch_collection.find_one({"_id": ObjectId(branch_id)})
    if branch:
        return await branch_helper(branch)  # ✅ await eklendi
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")

async def get_branches_by_company_id(company_id: int) -> List[Branch]:
    branches = []
    async for branch in branch_collection.find({"company_id": company_id}):
        branches.append(await branch_helper(branch))  # ✅ await eklendi
    return branches

async def create_branch(branch: BranchCreate) -> Branch:
    existing_company = await company_collection.find_one({"company_id": branch.company_id})
    if not existing_company:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Company ID does not exist")

    existing_branch = await branch_collection.find_one({
        "company_id": branch.company_id,
        "branch_name": branch.branch_name
    })
    if existing_branch:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A branch with this name already exists for the company"
        )

    branch_dict = branch.dict()
    branch_dict["created_at"] = datetime.utcnow()
    branch_dict["updated_at"] = datetime.utcnow()

    try:
        new_branch = await branch_collection.insert_one(branch_dict)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A branch with this name already exists for the company"
        )

    created_branch = await branch_collection.find_one({"_id": new_branch.inserted_id})
    return await branch_helper(created_branch)


async def update_branch(branch_id: str, branch: BranchUpdate) -> Branch:
    if not ObjectId.is_valid(branch_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid branch ID format")

    update_data = {k: v for k, v in branch.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()

        if "branch_name" in update_data:
            existing_branch = await branch_collection.find_one({
                "company_id": update_data.get("company_id", branch_id),
                "branch_name": update_data["branch_name"],
                "_id": {"$ne": ObjectId(branch_id)}
            })
            if existing_branch:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Another branch with this name already exists for the company"
                )

        result = await branch_collection.update_one({"_id": ObjectId(branch_id)}, {"$set": update_data})
        if result.modified_count == 1:
            updated_branch = await branch_collection.find_one({"_id": ObjectId(branch_id)})
            if updated_branch:
                return await branch_helper(updated_branch)

    existing_branch = await branch_collection.find_one({"_id": ObjectId(branch_id)})
    if existing_branch:
        return await branch_helper(existing_branch)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")

async def delete_branch(branch_id: str):
    if not ObjectId.is_valid(branch_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid branch ID format")

    # Envanterde bu şubeye ait herhangi bir kayıt olup olmadığını kontrol et
    inventory_exists = await inventory_collection.find_one({"branch_id": branch_id})
    if inventory_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete branch because it has associated inventory records."
        )

    # Şube silme işlemi
    result = await branch_collection.delete_one({"_id": ObjectId(branch_id)})
    if result.deleted_count == 1:
        return {"message": "Branch deleted successfully"}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")