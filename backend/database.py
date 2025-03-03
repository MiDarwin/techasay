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