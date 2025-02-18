from models.userModel import User, LoginUser
from services.authService import save_user, authenticate_user
from utils.tokenUtils import create_access_token

async def register_user(user: User):
    user_id = await save_user(user)
    if not user_id:
        raise HTTPException(status_code=400, detail="User already exists")
    return {"message": f"User registered successfully. ID: {user_id}"}

async def login_user(user: LoginUser):
    is_authenticated, user_data = await authenticate_user(user)
    if not is_authenticated:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Kullanıcı doğrulandı, Bearer Token oluştur
    token_data = {"user_id": user_data["user_id"]}
    access_token = create_access_token(data=token_data)
    return {"access_token": access_token, "token_type": "Bearer"}
