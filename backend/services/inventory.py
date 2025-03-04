# services/inventory.py

from datetime import datetime
from bson import ObjectId
from typing import List, Optional, Dict

from database import inventory_collection
from models.inventory import inventory_helper
from schemas.inventory import InventoryCreate, InventoryUpdate, InventorySearch


# Diğer CRUD fonksiyonları...

# Envanter Oluşturma
async def add_inventory(inventory_data: InventoryCreate) -> dict:
    inventory = inventory_data.dict()
    inventory["created_at"] = datetime.utcnow()
    inventory["updated_at"] = datetime.utcnow()
    result = await inventory_collection.insert_one(inventory)
    new_inventory = await inventory_collection.find_one({"_id": result.inserted_id})
    return inventory_helper(new_inventory)


# Şubeye Ait Envanterleri Getirme
async def get_inventory_by_branch(branch_id: str) -> List[dict]:
    inventories = []
    cursor = inventory_collection.find({"branch_id": branch_id})
    async for inventory in cursor:
        inventories.append(inventory_helper(inventory))
    return inventories


# Envanteri Güncelleme
async def update_inventory(inventory_id: str, update_data: InventoryUpdate) -> Optional[dict]:
    update = {k: v for k, v in update_data.dict().items() if v is not None}
    if update:
        update["updated_at"] = datetime.utcnow()
        await inventory_collection.update_one(
            {"_id": ObjectId(inventory_id)},
            {"$set": update}
        )
    updated_inventory = await inventory_collection.find_one({"_id": ObjectId(inventory_id)})
    if updated_inventory:
        return inventory_helper(updated_inventory)
    return None


# Envanteri Silme
async def delete_inventory(inventory_id: str) -> bool:
    result = await inventory_collection.delete_one({"_id": ObjectId(inventory_id)})
    return result.deleted_count == 1


# Belirli Bir Envanteri Getirme
async def get_inventory_by_id(inventory_id: str) -> Optional[dict]:
    inventory = await inventory_collection.find_one({"_id": ObjectId(inventory_id)})
    if inventory:
        return inventory_helper(inventory)
    return None


# Genel Arama Fonksiyonu
async def search_inventory(search_params: InventorySearch) -> List[dict]:
    query = {}

    if search_params.branch_id:
        query["branch_id"] = search_params.branch_id
    if search_params.device_type:
        query["device_type"] = {"$regex": search_params.device_type, "$options": "i"}  # Büyük küçük harf duyarsız
    if search_params.device_model:
        query["device_model"] = {"$regex": search_params.device_model, "$options": "i"}
    if search_params.quantity is not None:
        query["quantity"] = search_params.quantity
    if search_params.specs:
        # specs içinde belirli anahtar-değer çiftleri aramak
        for key, value in search_params.specs.items():
            query[f"specs.{key}"] = {"$regex": value, "$options": "i"}

    inventories = []
    cursor = inventory_collection.find(query)
    async for inventory in cursor:
        inventories.append(inventory_helper(inventory))
    return inventories