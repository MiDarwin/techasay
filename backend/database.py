# database.py

from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI
from bson import ObjectId
from datetime import datetime

client = AsyncIOMotorClient(MONGO_URI)
db = client.user_database

# Mevcut koleksiyonlar
excel_data_collection = db.excel_data
company_collection = db.companies
branch_collection = db.branches

# Yeni koleksiyon
inventory_collection = db.inventory  # Envanter koleksiyonu

def init_db():
    print("Database initialized")

# Helper Fonksiyonları

def company_helper(company) -> dict:
    return {
        "_id": str(company["_id"]),
        "company_id": company["company_id"],
        "name": company["name"],
        "created_at": company["created_at"],
        "updated_at": company["updated_at"]
    }

async def branch_helper(branch) -> dict:
    # Şirket bilgilerini almak için company_id'yi kullan
    company = await company_collection.find_one({"company_id": branch["company_id"]})

    # Eğer şirket bulunursa, adını al; bulunmazsa "Bilinmeyen Şirket"
    company_name = company.get("name", "Bilinmeyen Şirket") if company else "Bilinmeyen Şirket"

    return {
        "_id": str(branch["_id"]),
        "company_id": branch["company_id"],
        "company_name": company_name,
        "branch_name": branch["branch_name"],
        "address": branch["address"],
        "city": branch["city"],
        "phone_number": branch["phone_number"],
        "branch_note": branch.get("branch_note", ""),  # Şube notu eklendi
        "created_at": branch["created_at"],
        "updated_at": branch["updated_at"],
    }


async def inventory_helper(inventory) -> dict:
    # 🔥 branch_id'yi ObjectId'ye çevir
    branch_id = ObjectId(inventory["branch_id"])

    # 🔥 MongoDB'de branch_id ile eşleşen şubeyi bul
    branch = await branch_collection.find_one({"_id": branch_id})

    # 🔥 Eğer branch bulunursa, branch_name'i al; bulunmazsa "Bilinmeyen Şube" yap
    branch_name = branch.get("branch_name", "Bilinmeyen Şube") if branch else "Bilinmeyen Şube"
    print("Branch:", branch)
    print("Branch name:", branch_name)

    return {
        "id": str(inventory["_id"]),
        "branch_id": str(inventory["branch_id"]),
        "branch_name": branch_name,  # ✅ Artık doğru bir şekilde ekleniyor
        "device_type": inventory["device_type"],
        "device_model": inventory.get("device_model", ""),
        "quantity": inventory.get("quantity", 0),
        "specs": inventory.get("specs", {}),
        "created_at": inventory.get("created_at", datetime.utcnow()),
        "updated_at": inventory.get("updated_at", datetime.utcnow()),
    }


async def create_indexes():
    # Şirket koleksiyonu için indeksler
    await company_collection.create_index("company_id", unique=True)
    await company_collection.create_index("name")  # Opsiyonel: Şirket isimlerini indekslemek için

    # Branch koleksiyonu için indeksler
    await branch_collection.create_index("company_id")
    await branch_collection.create_index("branch_name")
    await branch_collection.create_index("city");  # Şehir için indeks
    # Envanter koleksiyonu için indeksler
    await inventory_collection.create_index("branch_id")
    await inventory_collection.create_index(
        [("branch_id", 1), ("device_type", 1), ("device_model", 1)],
        unique=True,
        name="unique_branch_device"
    )

async def init_indexes():
    await create_indexes()
    print("Indexes created")

# Database initialization fonksiyonunu çağırmayı unutmayın
init_db()