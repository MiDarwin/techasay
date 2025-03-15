# services/branch_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.branch import Branch
from models.company import Company
from schemas import company
from schemas.branch import BranchCreate, BranchResponse,BranchUpdate
from sqlalchemy.orm import joinedload  # Ekle
from sqlalchemy import or_


async def create_branch(db: AsyncSession, branch: BranchCreate, company_id: int):
    db_branch = Branch(
        branch_name=branch.branch_name,
        address=branch.address,
        city=branch.city,
        phone_number=branch.phone_number,
        branch_note=branch.branch_note,
        location_link=branch.location_link,
        company_id=company_id
    )

    db.add(db_branch)
    await db.commit()
    await db.refresh(db_branch)

    # Şirketi yükleyin
    company_result = await db.execute(select(Company).filter(Company.id == company_id))
    company = company_result.scalars().first()

    return BranchResponse(
        id=db_branch.id,
        name=db_branch.branch_name,
        address=db_branch.address,
        city=db_branch.city,
        phone_number=db_branch.phone_number,
        company_id=db_branch.company_id,
        company_name=company.name if company else "",  # Şirket adı varsa
        branch_note=db_branch.branch_note,
        location_link=db_branch.location_link
    )


async def get_branches(db: AsyncSession, company_id: int, skip: int = 0, limit: int = 10, city: str = None,
                       textinput: str = None):
    query = select(Branch).options(joinedload(Branch.company)).filter(Branch.company_id == company_id)

    if city:  # Eğer city parametresi varsa, city'e göre filtrele
        query = query.filter(Branch.city.ilike(f"%{city}%"))

    if textinput:  # Eğer textinput varsa, name, address, city ve phone_number'da arama yap
        query = query.filter(
            or_(
                Branch.branch_name.ilike(f"%{textinput}%"),
                Branch.address.ilike(f"%{textinput}%"),
                Branch.city.ilike(f"%{textinput}%"),
                Branch.phone_number.ilike(f"%{textinput}%")
            )
        )

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    branches = result.scalars().all()

    return [
        {
            "id": branch.id,
            "name": branch.branch_name,
            "address": branch.address,
            "city": branch.city,
            "phone_number": branch.phone_number,
            "company_id": branch.company_id,
            "company_name": branch.company.name if branch.company_id else None,  # Alt şubelerde company_name None
            "location_link": branch.location_link,
            "branch_note": branch.branch_note if hasattr(branch, 'branch_note') else "",
        }
        for branch in branches
    ]

async def get_branch_by_id(db: AsyncSession, branch_id: int):
    result = await db.execute(select(Branch).filter(Branch.id == branch_id))
    return result.scalars().first()

async def update_branch(db: AsyncSession, branch_id: int, branch_data: BranchUpdate):
    db_branch = await get_branch_by_id(db, branch_id)
    if db_branch:
        for key, value in branch_data.dict().items():
            setattr(db_branch, key, value)
        await db.commit()
        await db.refresh(db_branch)
        return db_branch
    return None

async def delete_branch(db: AsyncSession, branch_id: int):
    db_branch = await get_branch_by_id(db, branch_id)
    if db_branch:
        await db.delete(db_branch)
        await db.commit()
        return db_branch
    return None
async def get_all_branches(db: AsyncSession, limit: int = 50):

    query = select(Branch).options(joinedload(Branch.company)).filter(Branch.company_id.isnot(None)).limit(limit)
    result = await db.execute(query)
    branches = result.scalars().all()

    branch_responses = []
    for branch in branches:
        # Alt şubeler olup olmadığını kontrol et
        sub_branch_query = select(Branch).filter(Branch.parent_branch_id == branch.id)
        sub_branch_result = await db.execute(sub_branch_query)
        has_sub_branches = sub_branch_result.scalars().first() is not None

        branch_responses.append({
            "id": branch.id,
            "name": branch.branch_name,
            "address": branch.address,
            "city": branch.city,
            "phone_number": branch.phone_number,
            "company_id": branch.company_id,
            "company_name": branch.company.name if branch.company else None,
            "location_link": branch.location_link,
            "branch_note": branch.branch_note if hasattr(branch, 'branch_note') else "",
            "parent_branch_id": branch.parent_branch_id,
            "has_sub_branches": has_sub_branches  # Yeni alan eklendi
        })

    return branch_responses

async def create_sub_branch(db: AsyncSession, branch: BranchCreate, parent_branch_id: int):
    # Alt şube ekleme işlemi
    db_branch = Branch(
        branch_name=branch.branch_name,
        address=branch.address,
        city=branch.city,
        phone_number=branch.phone_number,
        branch_note=branch.branch_note,
        location_link=branch.location_link,
        parent_branch_id=parent_branch_id  # Alt şube için parent_branch_id atanır
    )

    db.add(db_branch)
    await db.commit()
    await db.refresh(db_branch)

    # Üst şube bilgisi yüklenir
    parent_branch_result = await db.execute(select(Branch).filter(Branch.id == parent_branch_id))
    parent_branch = parent_branch_result.scalars().first()

    return BranchResponse(
        id=db_branch.id,
        name=db_branch.branch_name,
        address=db_branch.address,
        city=db_branch.city,
        phone_number=db_branch.phone_number,
        parent_branch_id=db_branch.parent_branch_id,
        branch_note=db_branch.branch_note,
        location_link=db_branch.location_link,
        company_id=parent_branch.company_id if parent_branch else None,  # Üst şube şirketi
        company_name=parent_branch.company.name if parent_branch and parent_branch.company else None  # Şirket adı
    )
async def get_sub_branches(db: AsyncSession, parent_branch_id: int):
    """Belirtilen parent_branch_id'ye ait alt şubeleri getirir."""
    query = select(Branch).filter(Branch.parent_branch_id == parent_branch_id)
    result = await db.execute(query)
    sub_branches = result.scalars().all()

    return [
        {
            "id": branch.id,
            "name": branch.branch_name,
            "address": branch.address,
            "city": branch.city,
            "phone_number": branch.phone_number,
            "company_id": branch.company_id,
            "location_link": branch.location_link,
            "branch_note": branch.branch_note if hasattr(branch, 'branch_note') else "",
            "parent_branch_id": branch.parent_branch_id,
        }
        for branch in sub_branches
    ]