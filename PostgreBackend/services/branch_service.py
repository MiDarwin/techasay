# services/branch_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.branch import Branch
from models.company import Company
from schemas import company
from schemas.branch import BranchCreate, BranchResponse
from sqlalchemy.orm import joinedload  # Ekle


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


async def get_branches(db: AsyncSession, company_id: int, skip: int = 0, limit: int = 10):
    result = await db.execute(
        select(Branch)
        .options(joinedload(Branch.company))
        .filter(Branch.company_id == company_id)
        .offset(skip)
        .limit(limit)
    )
    branches = result.scalars().all()

    return [
        {
            "id": branch.id,
            "name": branch.branch_name,  # Burayı branch_name olarak güncelleyebilirsiniz.
            "address": branch.address,
            "city": branch.city,
            "phone_number": branch.phone_number,
            "company_id": branch.company_id,
            "company_name": branch.company.name,
            "location_link":branch.location_link,
            "branch_note": branch.branch_note if hasattr(branch, 'branch_note') else "",  # Varsayılan değer
        }
        for branch in branches
    ]

async def get_branch_by_id(db: AsyncSession, branch_id: int):
    result = await db.execute(select(Branch).filter(Branch.id == branch_id))
    return result.scalars().first()

async def update_branch(db: AsyncSession, branch_id: int, branch_data: BranchCreate):
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