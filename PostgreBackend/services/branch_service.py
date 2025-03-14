# services/branch_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.branch import Branch
from schemas.branch import BranchCreate

async def create_branch(db: AsyncSession, branch: BranchCreate, company_id: int):
    db_branch = Branch(**branch.dict(), company_id=company_id)  # company_id kullanılıyor
    db.add(db_branch)
    await db.commit()
    await db.refresh(db_branch)
    return db_branch

async def get_branches(db: AsyncSession, company_id: int, skip: int = 0, limit: int = 10):
    result = await db.execute(select(Branch).filter(Branch.company_id == company_id).offset(skip).limit(limit))
    return result.scalars().all()

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