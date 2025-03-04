# models/inventory.py

from bson import ObjectId
from datetime import datetime

def inventory_helper(inventory) -> dict:
    return {
        "id": str(inventory["_id"]),  # _id'yi id olarak yeniden adlandırın
        "branch_id": str(inventory["branch_id"]),
        "device_type": inventory["device_type"],
        "device_model": inventory.get("device_model", ""),
        "quantity": inventory.get("quantity", 0),
        "specs": inventory.get("specs", {}),
        "created_at": inventory.get("created_at", datetime.utcnow()),
        "updated_at": inventory.get("updated_at", datetime.utcnow()),
    }