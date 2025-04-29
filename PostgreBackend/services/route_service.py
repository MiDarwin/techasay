import os
import asyncio
from typing import List, Dict, Any,Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.branch import Branch as BranchModel
from config import GOOGLE_MAPS_API_KEY
from services.route_optimizer import RouteOptimizer

# instantiate once
_optimizer = RouteOptimizer(GOOGLE_MAPS_API_KEY)


async def optimize_branch_route(
    db: AsyncSession,
    start: Tuple[float, float],
    end:   Tuple[float, float],
    priority_branch_ids: List[int],
    branch_ids:          List[int],
) -> Dict[str, Any]:
    """
    - start/end: (lat, lng) olarak gelmeli
    - priority_branch_ids ve branch_ids: şube ID listeleri
    """
    # 1) Branch koordinatlarını çek
    needed_ids = set(priority_branch_ids + branch_ids)
    q = await db.execute(select(BranchModel).where(BranchModel.id.in_(needed_ids)))
    branches = q.scalars().all()
    bmap = {b.id: b for b in branches}

    def coord_of(bid: int) -> Tuple[float, float]:
        b = bmap.get(bid)
        if not b or b.latitude is None or b.longitude is None:
            raise ValueError(f"Branch {bid} has no coordinates")
        return (b.latitude, b.longitude)

    # 2) Öncelikli ve diğerlerin koordinat listesi
    prio_ids = [i for i in priority_branch_ids if i in branch_ids]
    other_ids = [i for i in branch_ids if i not in prio_ids]

    prio_coords  = [coord_of(i) for i in prio_ids]
    other_coords = [coord_of(i) for i in other_ids]

    # 3) Optimize (öncelikli ilk tur, diğerler ikinci tur)
    r1 = await asyncio.to_thread(
        _optimizer.optimize_route, start, end, prio_coords
    ) if prio_coords else None
    order1 = r1["routes"][0]["waypoint_order"] if r1 else []

    r2 = await asyncio.to_thread(
        _optimizer.optimize_route, start, end, other_coords
    ) if other_coords else None
    order2 = r2["routes"][0]["waypoint_order"] if r2 else []

    # 4) Sıralı ID listesi
    ordered_ids = [prio_ids[i] for i in order1] + [other_ids[i] for i in order2]
    ordered_coords = [prio_coords[i] for i in order1] + [other_coords[i] for i in order2]

    # 5) Google Maps URL üret
    url = _optimizer.generate_google_maps_url(
        start,
        end,
        ordered_coords,
        list(range(len(ordered_coords))),
    )

    return {
        "ordered_branch_ids": ordered_ids,
        "google_maps_url":    url
    }