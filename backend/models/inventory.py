from bson import ObjectId
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI

client = AsyncIOMotorClient(MONGO_URI)
db = client.user_database

# Mevcut koleksiyonlar
branch_collection = db.branches
sub_branch_collection = db.sub_branches

async def inventory_helper(inventory) -> dict:
    # Şube bilgisi
    branch_id = ObjectId(inventory["branch_id"])
    branch = await branch_collection.find_one({"_id": branch_id})
    branch_name = branch["branch_name"] if branch else "Bilinmeyen Şube"

    # Alt şube bilgisi
    sub_branch_name = "Bilinmeyen Alt Şube"  # Varsayılan değer
    if "sub_branch_id" in inventory and inventory["sub_branch_id"]:
        sub_branch_id = ObjectId(inventory["sub_branch_id"])
        sub_branch = await sub_branch_collection.find_one({"_id": sub_branch_id})
        if sub_branch:
            sub_branch_name = sub_branch["name"]

    return {
        "id": str(inventory["_id"]),
        "branch_id": str(inventory["branch_id"]),
        "sub_branch_id": str(inventory.get("sub_branch_id", "")),
        "sub_branch_name": sub_branch_name,  # Alt şube adını ekleyin
        "branch_name": branch_name,
        "device_type": inventory["device_type"],
        "device_model": inventory.get("device_model", ""),
        "quantity": inventory.get("quantity", 0),
        "specs": inventory.get("specs", {}),
        "product_detail": inventory.get("product_detail", ""),
        "note": inventory.get("note", ""),
        "created_at": inventory.get("created_at"),
        "updated_at": inventory.get("updated_at", datetime.utcnow()),
    }