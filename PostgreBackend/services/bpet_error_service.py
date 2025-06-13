from typing import List, Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from models.bpet import BpetError
from models.bpet import Bpet
from schemas.bpet_error import ErrorCreate, ErrorUpdate


async def create_error(
    db: AsyncSession, bpet_id: int, data: ErrorCreate
) -> BpetError:
    # Bpet var mı?
    bpet = await db.get(Bpet, bpet_id)
    if not bpet:
        raise HTTPException(404, "Bpet not found")

    new_error = BpetError(bpet_id=bpet_id, **data.dict(exclude_unset=True))
    db.add(new_error)
    await db.commit()
    await db.refresh(new_error)
    return new_error


async def update_error(
    db: AsyncSession, error_id: int, data: ErrorUpdate
) -> BpetError:
    error: Optional[BpetError] = await db.get(BpetError, error_id)
    if not error:
        raise HTTPException(404, "Error not found")

    for k, v in data.dict(exclude_unset=True).items():
        setattr(error, k, v)

    await db.commit()
    await db.refresh(error)
    return error


async def list_errors_by_bpet(
    db: AsyncSession, bpet_id: int
) -> List[BpetError]:
    stmt = select(BpetError).where(BpetError.bpet_id == bpet_id).order_by(
        BpetError.occurred_at.desc()
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def list_errors(
    db: AsyncSession, skip: int = 0, limit: int = 100
) -> List[BpetError]:
    stmt = select(BpetError).offset(skip).limit(limit).order_by(
        BpetError.occurred_at.desc()
    )
    result = await db.execute(stmt)
    return result.scalars().all()
