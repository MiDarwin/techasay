from datetime import datetime
from typing import List
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from models.part_master import PartMaster, PartKind
from models.part_timeline import PartTimeline, PartState
from models.inventory import Inventory

async def add_parts(db: AsyncSession, parts: List[dict]):
    """Toplu parça ekleme."""
    instances = []
    for p in parts:
        if await db.get(PartMaster, p["serial_no"]):
            continue  # skip duplicates
        part = PartMaster(**p)
        db.add(part)
        instances.append(part)
        # initial timeline
        tl = PartTimeline(
            serial_no=part.serial_no,
            branch_id=p["branch_id"],
            inventory_id=p["inventory_id"],
            state=PartState.in_use,
            note="initial insert"
        )
        db.add(tl)
    await db.commit()
    return instances

async def dismount_parts(db: AsyncSession, serial_nos: List[str], note: str | None = None):
    q = select(PartMaster).where(PartMaster.serial_no.in_(serial_nos))
    parts = (await db.scalars(q)).all()
    if not parts:
        raise HTTPException(404, "Seçili seri numaraları bulunamadı")
    for part in parts:
        # kapat açık timeline
        await db.execute(
            update(PartTimeline)
            .where(PartTimeline.serial_no == part.serial_no,
                   PartTimeline.ended_at.is_(None))
            .values(ended_at=datetime.utcnow())
        )
        # yeni depo timeline
        tl = PartTimeline(
            serial_no=part.serial_no,
            branch_id=None,
            inventory_id=part.current_inventory_id,
            state=PartState.warehouse,
            note=note
        )
        db.add(tl)
        part.current_branch_id = None
    await db.commit()
    return parts

async def get_part_history(db: AsyncSession, serial_no: str):
    q = select(PartTimeline).where(PartTimeline.serial_no == serial_no).order_by(PartTimeline.started_at.desc())
    return (await db.scalars(q)).all()

async def get_branch_history(db: AsyncSession, branch_id: int):
    q = select(PartTimeline).where(PartTimeline.branch_id == branch_id).order_by(PartTimeline.started_at.desc())
    return (await db.scalars(q)).all()