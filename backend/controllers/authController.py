from models.userModel import User
from services.authService import save_user

async def register_user(user: User):
    user_exists = await save_user(user)
    if user_exists:
        raise HTTPException(status_code=400, detail="User already exists")
    return {"message": "User registered successfully"}
