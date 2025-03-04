from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from schemas.branch import Branch, BranchCreate, BranchUpdate
from services import branch as branch_service
from utils.auth import get_current_user

router = APIRouter(
    prefix="/branches",
    tags=["Branches"],
    dependencies=[Depends(get_current_user)],  # Tüm uç noktalar için kimlik doğrulama
)

@router.get("/", response_model=List[Branch])
async def read_branches():
    return await branch_service.get_all_branches()

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