from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, join, func
from models.inventory import Inventory
from schemas.inventory import InventoryCreate, InventoryResponse,InventoryUpdate
from models.branch import Branch  # Branch modelini içe aktarın
from models.company import Company
from typing import Optional  # Bunu ekleyin

async def create_inventory(db: AsyncSession, branch_id: int, inventory: InventoryCreate):
    db_inventory = Inventory(
        device_type=inventory.device_type,
        device_model=inventory.device_model,
        quantity=inventory.quantity,
        specs=inventory.specs,
        branch_id=branch_id  # URL'den alınan branch_id
    )
    db.add(db_inventory)
    await db.commit()
    await db.refresh(db_inventory)
    return InventoryResponse.from_orm(db_inventory)

async def get_inventory_by_branch(db: AsyncSession, branch_id: int):
    query = (
        select(Inventory, Branch.branch_name)
        .join(Branch, Inventory.branch_id == Branch.id)
        .filter(Inventory.branch_id == branch_id)
    )
    result = await db.execute(query)
    rows = result.all()

    # InventoryResponse'a branch_name eklenerek dönülüyor
    return [
        InventoryResponse(
            id=row.Inventory.id,
            device_type=row.Inventory.device_type,
            device_model=row.Inventory.device_model,
            quantity=row.Inventory.quantity,
            specs=row.Inventory.specs,
            branch_id=row.Inventory.branch_id,
            branch_name=row.branch_name,  # Şube adı
        )
        for row in rows
    ]

async def delete_inventory(db: AsyncSession, inventory_id: int):
    query = select(Inventory).filter(Inventory.id == inventory_id)
    result = await db.execute(query)
    db_inventory = result.scalars().first()
    if db_inventory:
        await db.delete(db_inventory)
        await db.commit()
        return db_inventory
    return None
async def get_all_inventory(db: AsyncSession, limit: int = 50, company_name: Optional[str] = None, branch_name: Optional[str] = None):
    # Baz sorgu: Inventory, Branch ve Company tablosunu birleştiriyoruz
    query = (
        select(Inventory, Branch.branch_name, Company.name.label("company_name"))
        .join(Branch, Inventory.branch_id == Branch.id)
        .join(Company, Branch.company_id == Company.company_id)
    )

    # Şirket adına göre filtreleme
    if company_name:
        query = query.filter(Company.name == company_name)

    # Şube adına göre filtreleme
    if branch_name:
        query = query.filter(Branch.branch_name == branch_name)

    # Limit ekleyelim
    query = query.limit(limit)

    # Sorguyu çalıştır ve sonucu al
    result = await db.execute(query)
    rows = result.all()

    # InventoryResponse'a branch_name ve company_name eklenerek dönülüyor
    return [
        InventoryResponse(
            id=row.Inventory.id,
            device_type=row.Inventory.device_type,
            device_model=row.Inventory.device_model,
            quantity=row.Inventory.quantity,
            specs=row.Inventory.specs,
            branch_id=row.Inventory.branch_id,
            branch_name=row.branch_name,
            company_name=row.company_name
        )
        for row in rows
    ]
async def update_inventory(db: AsyncSession, inventory_id: int, inventory_update: InventoryUpdate):
    # Envanteri veritabanından getir
    result = await db.execute(select(Inventory).filter(Inventory.id == inventory_id))
    db_inventory = result.scalar_one_or_none()

    if not db_inventory:
        raise ValueError("Envanter bulunamadı.")  # Eğer envanter yoksa hata döndür

    # Gelen alanları güncelle
    for key, value in inventory_update.dict(exclude_unset=True).items():
        setattr(db_inventory, key, value)

    # Veritabanına güncellemeyi uygula
    db.add(db_inventory)
    await db.commit()
    await db.refresh(db_inventory)

    return db_inventory
async def get_inventory_by_branch_id(db, branch_id: int):
    # 1. Ana şubenin kendi envanteri
    main_branch_inventory_query = (
        select(Inventory.device_type, Inventory.device_model, func.sum(Inventory.quantity).label("total_quantity"))
        .where(Inventory.branch_id == branch_id)
        .group_by(Inventory.device_type, Inventory.device_model)
    )
    main_branch_inventory = await db.execute(main_branch_inventory_query)
    main_branch_inventory_results = main_branch_inventory.all()

    # 2. Alt şubelerin envanterini toplama
    sub_branches_query = select(Branch.id).where(Branch.parent_branch_id == branch_id)
    sub_branches = await db.execute(sub_branches_query)
    sub_branch_ids = [row[0] for row in sub_branches]

    if sub_branch_ids:
        sub_branch_inventory_query = (
            select(Inventory.device_type, Inventory.device_model, func.sum(Inventory.quantity).label("total_quantity"))
            .where(Inventory.branch_id.in_(sub_branch_ids))
            .group_by(Inventory.device_type, Inventory.device_model)
        )
        sub_branch_inventory = await db.execute(sub_branch_inventory_query)
        sub_branch_inventory_results = sub_branch_inventory.all()
    else:
        sub_branch_inventory_results = []

    # 3. Ana şube ve alt şube envanterlerini birleştirme
    inventory_dict = {}

    # Ana şube envanteri ekleniyor
    for device_type, device_model, total_quantity in main_branch_inventory_results:
        inventory_dict[(device_type, device_model)] = total_quantity

    # Alt şube envanteri ekleniyor
    for device_type, device_model, total_quantity in sub_branch_inventory_results:
        if (device_type, device_model) in inventory_dict:
            inventory_dict[(device_type, device_model)] += total_quantity
        else:
            inventory_dict[(device_type, device_model)] = total_quantity

    # Sonuçları liste olarak döndür
    return [
        {"device_type": device_type, "device_model": device_model, "quantity": quantity}
        for (device_type, device_model), quantity in inventory_dict.items()
    ]