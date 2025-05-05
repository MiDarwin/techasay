from tempfile import NamedTemporaryFile

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from openpyxl import Workbook
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional

from sqlalchemy.sql.functions import current_user
from starlette.responses import FileResponse

from dependencies import get_current_user
from models.branch import Branch
from models.inventory import Inventory
from schemas.inventory import InventoryOut, InventoryCreateBody, InventoryImportResponse
from services.inventory_service import get_inventory_by_branch, create_inventory, update_inventory, \
    generate_inventory_excel, import_inventory_from_excel, get_inventory_fields_by_branch
from database import get_db


router = APIRouter(prefix="", tags=["inventory"])
@router.get(
    "",
    response_model=List[InventoryOut],
    summary="Belirtilen branch_id ile envanter kayıtlarını döner"
)
async def read_inventory(
    branch_id: int = Query(..., description="Envanter alınacak şube ID"),
    limit:Optional[int] = Query(
                  None,
                  description="Gösterilecek kayıt sayısı (15,25,40 veya None için tümü)"
              ),
    db:        AsyncSession = Depends(get_db),
):

    try:
        return await get_inventory_by_branch(db, branch_id,limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.patch("/{inventory_id}", response_model=InventoryOut)
async def edit_inventory(
    inventory_id: int,
    payload:      Dict[str, Any],
    db:           AsyncSession = Depends(get_db),

):

    try:
        return await update_inventory(db, inventory_id, payload)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=InventoryOut, summary="Yeni envanter kaydı (branch_id body'den)")
async def add_inventory(
    inv_in: InventoryCreateBody,
    db:     AsyncSession = Depends(get_db),
):

    try:
        return await create_inventory(db, inv_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/export",
    response_description="Excel dosyası olarak envanteri indir",
    summary="Envanter Excel olarak indir"
)
async def export_inventory(
    db: AsyncSession = Depends(get_db),
):

    try:
        file_path = await generate_inventory_excel(db)
        return FileResponse(
            file_path,
            filename="envanter.xlsx",
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.post(
    "/import",
    response_model=InventoryImportResponse,
    summary="Excel ile envanter import et (merge-only, silme yok)"
)
async def import_inventory(
    file: UploadFile = File(..., description="Excel dosyası"),
    db:   AsyncSession = Depends(get_db),
):

    try:
        result = await import_inventory_from_excel(db, file)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.get(
    "/fields",
    response_model=List[str],
    summary="Branch bazlı envanter alan adlarını döner"
)
async def read_inventory_fields(
    branch_id: int = Query(..., description="Alanları alınacak şube ID"),
    db:        AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    GET /api/inventory/fields?branch_id=5
    Bu branch için geçmişte kullanılmış envanter alan adlarının listesini döner.
    """
    try:
        return await get_inventory_fields_by_branch(db, branch_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))