from typing import List, Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Body, Response
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import FileResponse

from database import get_db
from schemas.inventory import InventoryOut, InventoryCreateBody, InventoryImportResponse
from services.inventory_service import create_inventory, update_inventory, \
    generate_inventory_excel, import_inventory_from_excel, get_inventories, \
    get_inventory_fields_by_company, count_inventories, import_inventory_for_company

router = APIRouter(prefix="", tags=["inventory"])
@router.get(
    "",
    response_model=List[InventoryOut],
    summary="Branch veya Company bazlı envanter kayıtlarını döner"
)
async def read_inventory(
    response: Response,
    branch_id:  Optional[int] = Query(None, description="Şube ID (öncelikli)"),
    company_id: Optional[int] = Query(None, description="Şirket ID"),
q:          Optional[str]   = Query(None, description="Aranacak metin"),
    limit:      Optional[int] = Query(
                  None,
                  description="Gösterilecek kayıt sayısı (15,25,40 veya None için tümü)"
                ),
    db:         AsyncSession    = Depends(get_db),
):

    if branch_id is None and company_id is None:
        raise HTTPException(
            status_code=400,
            detail="branch_id veya company_id sorgu parametresinden en az biri gerekli"
        )

    try:

        total = await count_inventories(db, branch_id, company_id, q)

        items = await get_inventories(db, branch_id, company_id, limit, q)

        response.headers["X-Total-Count"] = str(total)

        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.patch("/{inventory_id}", response_model=InventoryOut)
async def edit_inventory(
    inventory_id: int,
    details: Dict[str, Any] = Body(...),      # <— doğrudan JSON objesi olarak al
    db: AsyncSession = Depends(get_db),
):
    """
    Gelen 'details' objesini olduğu gibi envanter kaydına yazar.
    Eksik alanlar silinmiş olur, yeni alanlar eklenir.
    """
    try:
        return await update_inventory(db, inventory_id, details)
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


@router.get("/export", response_description="Excel olarak indir")
async def export_inventory(
    branch_id:  Optional[List[int]] = Query(None, alias="branch_id"),
    company_id: Optional[int]  = Query(None),
    db:       AsyncSession    = Depends(get_db),
):
    branch_ids = branch_id if branch_id else None


    try:
        file_path = await generate_inventory_excel(db, branch_ids, company_id)
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
    summary="Şirket bazlı envanter alan adlarını döner"
)
async def read_inventory_fields(
    company_id: int = Query(..., description="Alanları alınacak şirket ID"),
    db:         AsyncSession = Depends(get_db),
):
    """
    GET /api/inventory/fields?company_id=2
    Bu şirkete ait tüm şubelerde geçmişte kullanılmış
    envanter alan adlarının listesini döner.
    """
    try:
        return await get_inventory_fields_by_company(db, company_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.post(
    "/import/company/{company_id}",
    response_model=InventoryImportResponse,
    summary="Şirkete özel Excel ile envanter yükle (alt-şube bazlı)"
)
async def import_by_company(
    company_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await import_inventory_for_company(db, file, company_id)
        return InventoryImportResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))