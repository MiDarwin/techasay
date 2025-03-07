from bson import ObjectId
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI
client = AsyncIOMotorClient(MONGO_URI)
db = client.user_database

# Mevcut koleksiyonlar
branch_collection = db.branches


async def inventory_helper(inventory) -> dict:
    # 🔥 branch_id'yi ObjectId'ye çevir
    branch_id = ObjectId(inventory["branch_id"])

    # 🔥 MongoDB'de branch_id ile eşleşen şubeyi bul
    branch = await branch_collection.find_one({"_id": branch_id})

    # 🔥 Eğer branch bulunursa, branch_name'i al; bulunmazsa "Bilinmeyen Şube" yap
    branch_name = branch.get("branch_name", "Bilinmeyen Şube") if branch else "Bilinmeyen Şube"
    #print("Branch:", branch)
    #print("Branch name:", branch_name)

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