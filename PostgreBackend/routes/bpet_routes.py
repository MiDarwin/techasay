# routes/bpet_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas.bpet import (
    BpetCreate, BpetUpdate, BpetOut, BpetHistoryOut
)
from services.bpet_service import (
    create_bpet, update_bpet,
    list_bpets_by_branch, list_bpets_in_warehouse,
    bpet_history
)

router = APIRouter()

@router.post("/", response_model=BpetOut)
async def add_bpet(payload: BpetCreate, db: AsyncSession = Depends(get_db)):
    return await create_bpet(db, payload)

@router.patch("/{bpet_id}", response_model=BpetOut)
async def edit_bpet(bpet_id: int, payload: BpetUpdate,
                    db: AsyncSession = Depends(get_db)):
    return await update_bpet(db, bpet_id, payload)

@router.get("/branch/{branch_id}", response_model=list[BpetOut])
async def list_branch_bpets(branch_id: int, db=Depends(get_db)):
    return await list_bpets_by_branch(db, branch_id)

@router.get("/warehouse", response_model=list[BpetOut])
async def list_warehouse(db=Depends(get_db)):
    return await list_bpets_in_warehouse(db)

@router.get("/{bpet_id}/history", response_model=list[BpetHistoryOut])
async def get_history(bpet_id: int, db=Depends(get_db)):
    return await bpet_history(db, bpet_id)
