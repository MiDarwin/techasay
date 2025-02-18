from database import db
from models.userModel import User

async def save_user(user: User):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        return True
    await db.users.insert_one(user.dict())
    return False
