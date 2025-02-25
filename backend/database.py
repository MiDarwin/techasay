from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI

client = AsyncIOMotorClient(MONGO_URI)
db = client.user_database
excel_data_collection = db.excel_data
def init_db():
    print("Database initialized")
