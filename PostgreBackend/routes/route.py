from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, conlist
from typing import List, Tuple
from services.route_service import optimize_branch_route
from dependencies import get_db

router = APIRouter(prefix="",         tags=["route"])

class RouteRequest(BaseModel):
    start: conlist(float)
    end:   conlist(float)
    priority_branch_ids: List[int] = []
    branch_ids:          List[int]


class RouteResponse(BaseModel):
    ordered_branch_ids: List[int]
    google_maps_url:    str


@router.post("/", response_model=RouteResponse)
async def optimize_route_endpoint(
    req: RouteRequest,
    db:  AsyncSession = Depends(get_db),

):
    try:
        result = await optimize_branch_route(
            db,
            start=tuple(req.start),
            end=tuple(req.end),
            priority_branch_ids=req.priority_branch_ids,
            branch_ids=req.branch_ids,
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Rota oluşturulurken hata oluştu.")
