# database.py

from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI
from bson import ObjectId
from datetime import datetime

client = AsyncIOMotorClient(MONGO_URI)
db = client.user_database

# Mevcut koleksiyon
excel_data_collection = db.excel_data

# Yeni koleksiyonlar
company_collection = db.companies
branch_collection = db.branches
def init_db():
    print("Database initialized")

# Helper Fonksiyonları

def company_helper(company) -> dict:
    return {
        "_id": str(company["_id"]),  # _id'yi koruyun
        "company_id": company["company_id"],
        "name": company["name"],
        "created_at": company["created_at"],
        "updated_at": company["updated_at"]
    }

async def create_indexes():
    # Şirket koleksiyonu için indeksler
    await company_collection.create_index("company_id", unique=True)
    await company_collection.create_index("name")  # Opsiyonel: Şirket isimlerini indekslemek için

def branch_helper(branch) -> dict:
    return {
        "_id": str(branch["_id"]),
        "company_id": branch["company_id"],
        "branch_name": branch["branch_name"],  # Şube ismi ekleniyor
        "address": branch["address"],
        "city": branch["city"],
        "phone_number": branch["phone_number"],
        "created_at": branch["created_at"],
        "updated_at": branch["updated_at"],
    }
async def init_indexes():
    await branch_collection.create_index(
        [("company_id", 1), ("branch_name", 1)],
        unique=True,
        name="unique_company_branch"
    )