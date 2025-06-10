# services/bpet_service.py
from datetime import datetime
from typing import List

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from models.bpet import Bpet, BpetHistory
from models.branch import Branch
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

    data = payload.dict(exclude_unset=True)   # gelen alanlar
    branch_included = "branch_id" in data
    attrs_included  = "attributes" in data

    if branch_included:
        new_branch = data["branch_id"]         # None (depo) veya int
        if new_branch is not None:
            # branch gerçekten var mı?
            if not await db.get(Branch, new_branch):
                raise HTTPException(400, "Branch ID geçersiz")
        if new_branch != bpet.branch_id:
            # eski history'yi kapat
            await db.execute(
                update(BpetHistory)
                .where(BpetHistory.bpet_id == bpet.id,
                       BpetHistory.ended_at.is_(None))
                .values(ended_at=datetime.utcnow())
            )
            state = "in_use" if new_branch is not None else "warehouse"
            await _open_history(db, bpet.id, new_branch, state)
            bpet.branch_id = new_branch

    if attrs_included and data["attributes"] != bpet.attributes:
        bpet.attributes = data["attributes"]

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
async def bulk_dismount_bpets(
    db: AsyncSession,
    bpet_ids: List[int],
    note: str | None = None,
):
    """
    Gelen id listesindeki tüm Bpet kayıtlarını depoya taşır.
    - branch_id -> NULL
    - açık history satırı kapanır, depo (warehouse) satırı açılır
    """
    if not bpet_ids:
        raise HTTPException(400, "Boş ID listesi")

    # İlgili kayıtları topla
    bpets = (
        await db.scalars(select(Bpet).where(Bpet.id.in_(bpet_ids)))
    ).all()
    if not bpets:
        raise HTTPException(404, "Hiçbiri bulunamadı")

    now = datetime.utcnow()

    for b in bpets:
        if b.branch_id is None:  # zaten depoda
            continue

        # 1) açık history'yi kapat
        await db.execute(
            update(BpetHistory)
            .where(BpetHistory.bpet_id == b.id,
                   BpetHistory.ended_at.is_(None))
            .values(ended_at=now)
        )

        # 2) depo history satırı
        db.add(
            BpetHistory(
                bpet_id=b.id,
                branch_id=None,
                state="warehouse",
                started_at=now,
                ended_at=None,
            )
        )

        # 3) ana kaydı NULL yap
        b.branch_id = None

    await db.commit()
    result = (
        await db.scalars(select(Bpet).where(Bpet.id.in_(bpet_ids)))
    ).all()
    return result 