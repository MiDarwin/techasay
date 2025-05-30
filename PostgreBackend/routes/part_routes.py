from fastapi import APIRouter, Depends
from typing import List
from database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.part import PartCreate, PartOut, PartTimelineOut, PartDismountIn
from services.part_service import add_parts, dismount_parts, get_part_history, get_branch_history

router = APIRouter()

@router.post("/bulk", response_model=List[PartOut])
async def bulk_add(parts: List[PartCreate], db: AsyncSession = Depends(get_db)):
    result = await add_parts(db, [p.dict() for p in parts])
    return result

@router.post("/dismount")
async def dismount(body: PartDismountIn, db: AsyncSession = Depends(get_db)):
    await dismount_parts(db, body.serial_nos, body.note)
    return {"detail": "Seçilen parçalar depoya alındı"}

@router.get("/{serial_no}/history", response_model=List[PartTimelineOut])
async def part_history(serial_no: str, db: AsyncSession = Depends(get_db)):
    return await get_part_history(db, serial_no)

@router.get("/branch/{branch_id}/history", response_model=List[PartTimelineOut])
async def branch_history(branch_id: int, db: AsyncSession = Depends(get_db)):
    return await get_branch_history(db, branch_id)