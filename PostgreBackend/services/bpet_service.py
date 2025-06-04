# services/bpet_service.py
from datetime import datetime
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from models.bpet import Bpet, BpetHistory
from schemas.bpet import BpetCreate, BpetUpdate


async def _open_history(db: AsyncSession, bpet_id: int,
                        branch_id: int | None, state: str):
    db.add(BpetHistory(
        bpet_id=bpet_id,
        branch_id=branch_id,
        state=state,
        started_at=datetime.utcnow()
    ))


async def create_bpet(db: AsyncSession, payload: BpetCreate) -> Bpet:
    bpet = Bpet(**payload.dict())
    db.add(bpet)
    await db.flush()           # id oluşsun

    await _open_history(db, bpet.id,
                        payload.branch_id,
                        "in_use" if payload.branch_id else "warehouse")
    await db.commit(); await db.refresh(bpet)
    return bpet


async def update_bpet(db: AsyncSession, bpet_id: int,
                      payload: BpetUpdate) -> Bpet:
    bpet: Bpet = await db.get(Bpet, bpet_id)
    if not bpet:
        raise HTTPException(404, "Bpet bulunamadı")

    branch_changed = payload.branch_id is not None \
                     and payload.branch_id != bpet.branch_id
    attrs_changed = payload.attributes is not None \
                    and payload.attributes != bpet.attributes

    if branch_changed:
        # eski kaydı kapat
        await db.execute(
            update(BpetHistory)
            .where(BpetHistory.bpet_id == bpet.id,
                   BpetHistory.ended_at.is_(None))
            .values(ended_at=datetime.utcnow())
        )
        await _open_history(db, bpet.id,
                            payload.branch_id,
                            "in_use" if payload.branch_id else "warehouse")
        bpet.branch_id = payload.branch_id

    if attrs_changed:
        bpet.attributes = payload.attributes

    await db.commit(); await db.refresh(bpet)
    return bpet


async def list_bpets_by_branch(db: AsyncSession, branch_id: int):
    q = select(Bpet).where(Bpet.branch_id == branch_id)
    return (await db.scalars(q)).all()


async def list_bpets_in_warehouse(db: AsyncSession):
    q = select(Bpet).where(Bpet.branch_id.is_(None))
    return (await db.scalars(q)).all()


async def bpet_history(db: AsyncSession, bpet_id: int):
    q = (select(BpetHistory)
         .where(BpetHistory.bpet_id == bpet_id)
         .order_by(BpetHistory.started_at.desc()))
    return (await db.scalars(q)).all()
