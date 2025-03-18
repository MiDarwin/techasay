# services/permissions_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.permissions import Permission
from schemas.permissions import PermissionCreate

async def add_permissions_to_user(db: AsyncSession, user_id: int, permissions_data: PermissionCreate):
    new_permissions = Permission(user_id=user_id, permissions=permissions_data.permissions)
    db.add(new_permissions)
    await db.commit()
    await db.refresh(new_permissions)
    return new_permissions

async def get_permissions_by_user_id(db: AsyncSession, user_id: int):
    result = await db.execute(select(Permission).filter(Permission.user_id == user_id))
    permission_record = result.scalars().first()
    if permission_record:
        return permission_record.permissions  # İzinleri dizi olarak döndür
    return []