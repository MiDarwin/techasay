from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
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


class TaskResponse(BaseModel):
    id: int
    title: str
    status: TaskStatus
    task_type: TaskType
    assigner_id: int
    assignee_id: int
    branch_id: Optional[int]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True