from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserCreate

async def create_user(db: Session, user: UserCreate):
    db_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone=user.phone,
        password=user.password  # Şifreleri hash'lemek için bir yöntem kullanmalısınız.
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user