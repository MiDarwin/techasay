from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from schemas.branch import Branch, BranchCreate, BranchUpdate
from schemas.sub_branch import SubBranchCreate
from services import branch as branch_service
from services.branch import create_sub_branch
from utils.auth import get_current_user

router = APIRouter(
    prefix="/branches",
    tags=["Branches"],
    dependencies=[Depends(get_current_user)],  # Tüm uç noktalar için kimlik doğrulama
)

@router.get("/", response_model=List[Branch])
async def read_branches(city: str = None, search: str = None, company_id: int = None):
    return await branch_service.get_all_branches(city=city, search=search, company_id=company_id)
@router.get("/{branch_id}", response_model=Branch)
async def read_branch(branch_id: str):
    return await branch_service.get_branch_by_id(branch_id)

@router.get("/company/{company_id}", response_model=List[Branch])
async def read_branches_by_company(company_id: int):
    return await branch_service.get_branches_by_company_id(company_id)

@router.post("/", response_model=Branch, status_code=status.HTTP_201_CREATED)
async def create_new_branch(branch: BranchCreate):
    return await branch_service.create_branch(branch)

@router.put("/{branch_id}", response_model=Branch)
async def update_existing_branch(branch_id: str, branch: BranchUpdate):
    return await branch_service.update_branch(branch_id, branch)

@router.delete("/{branch_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_branch(branch_id: str):
    await branch_service.delete_branch(branch_id)
    return

@router.post("/sub-branches", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_new_sub_branch(sub_branch: SubBranchCreate):
    return await create_sub_branch(sub_branch)
@router.get("/sub-branches/{branch_id}", response_model=List[dict])
async def read_sub_branches(branch_id: str):
    return await branch_service.get_sub_branches_by_branch_id(branch_id)