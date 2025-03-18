# routes/permissions.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.permissions import PermissionCreate, PermissionResponse
from dependencies import get_current_user
from database import get_db
from services.permissions_service import add_permissions_to_user, get_permissions_by_user_id

router = APIRouter()

@router.post("/permissions", response_model=PermissionResponse)
async def add_permissions(
    permissions_data: PermissionCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await add_permissions_to_user(db, current_user.id, permissions_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/permissions", response_model=list[str])
async def get_permissions(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_permissions_by_user_id(db, current_user.id)