from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional,List
from enum import Enum


class TaskStatus(str, Enum):
    ASSIGNED = "assigned"
    COMPLETED = "completed"
    RETURNED = "returned"
    APPROVED = "approved"


class TaskType(str, Enum):
    VISIT = "branch_visit"
    GENERAL = "general_task"


class TaskCreate(BaseModel):
    title: str = Field(..., max_length=100)
    description: str
    task_type: TaskType
    assignee_id: int
    branch_id: Optional[int] = None  # Required if task_type == VISIT


class TaskUpdate(BaseModel):
    completion_notes: Optional[str] = None
    status: Optional[TaskStatus] = None
    return_reason: Optional[str] = None



class UserSimple(BaseModel):
    id: int
    name: str
    surname: str
    email: str


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    task_type: TaskType
    assigner_id: int
    assignee_id: int
    branch_id: Optional[int]
    created_at: datetime
    completed_at: Optional[datetime]
    approved_at: Optional[datetime]
    return_reason: Optional[str]

    # Include nested user details
    assigner: Optional[UserSimple]
    assignee: Optional[UserSimple]

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    data: List[TaskResponse]
    total: int
    page: int
    limit: int

