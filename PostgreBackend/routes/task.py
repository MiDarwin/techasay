from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from services.task_service import create_task, update_task_status
from schemas.task import TaskCreate, TaskUpdate, TaskResponse
from database import get_db
from utils.bearerToken import get_user_id_from_token

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/", response_model=TaskResponse)
async def create_new_task(
    task_data: TaskCreate,
    db: AsyncSession = Depends(get_db),
    authorization: str = Header(...)
):
    try:
        assigner_id = get_user_id_from_token(authorization.replace("Bearer ", ""))
        return await create_task(db, task_data, assigner_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    update_data: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    authorization: str = Header(...)
):
    try:
        user_id = get_user_id_from_token(authorization.replace("Bearer ", ""))
        return await update_task_status(db, task_id, user_id, update_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))