# routes/visit.py
from fastapi import APIRouter, Depends, HTTPException,Header
from sqlalchemy.orm import Session
from schemas.visit import VisitCreate, VisitResponse
from services.visit_service import create_visit
from database import get_db
from utils.bearerToken import get_user_id_from_token
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.post("/branches/{branch_id}/visits", response_model=VisitResponse)
async def add_visit(
        branch_id: int,
        visit: VisitCreate,
        db: AsyncSession = Depends(get_db),
        authorization: str = Header(None)  # Authorization header'dan token alıyoruz
):
    # Authorization header'dan token çıkar
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header eksik.")

    # Kullanıcı ID'sini token'dan al
    user_id = get_user_id_from_token(authorization.replace("Bearer ", ""))
    if not user_id:
        raise HTTPException(status_code=401, detail="Geçersiz token.")

    # Ziyaret ekleme işlemi
    try:
        new_visit = await create_visit(branch_id=branch_id, user_id=user_id, visit=visit, db=db)

        # SQLAlchemy nesnesini manuel olarak dönüştür
        response_data = {
            "id": new_visit.id,
            "branch_id": new_visit.branch_id,
            "user_id": new_visit.user_id,
            "visit_date": new_visit.visit_date,
            "note": new_visit.note,
        }
        return VisitResponse(**response_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ziyaret eklenirken bir hata oluştu: {str(e)}")