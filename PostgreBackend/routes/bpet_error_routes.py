from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from database import get_db  # senin mevcut dependency'n
from schemas.bpet_error import (
    ErrorCreate,
    ErrorUpdate,
    ErrorRead,
)
from services import bpet_error_service as svc

router = APIRouter()


@router.post(
    "/{bpet_id}",
    response_model=ErrorRead,
    status_code=status.HTTP_201_CREATED,
)
async def add_error_for_bpet(
    bpet_id: int = Path(..., gt=0),
    payload: ErrorCreate = ...,
    db: AsyncSession = Depends(get_db),
):
    return await svc.create_error(db, bpet_id, payload)


@router.patch("/{error_id}", response_model=ErrorRead)
async def edit_error(
    error_id: int = Path(..., gt=0),
    payload: ErrorUpdate = ...,
    db: AsyncSession = Depends(get_db),
):
    return await svc.update_error(db, error_id, payload)


@router.get("/{bpet_id}", response_model=List[ErrorRead])
async def get_errors_for_bpet(
    bpet_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_db),
):
    return await svc.list_errors_by_bpet(db, bpet_id)


@router.get("/", response_model=List[ErrorRead])
async def get_all_errors(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    db: AsyncSession = Depends(get_db),
):
    return await svc.list_errors(db, skip, limit)
