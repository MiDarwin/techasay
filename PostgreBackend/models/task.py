from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from database import Base


class TaskStatus(str, Enum):
    ASSIGNED = "assigned"
    COMPLETED = "completed"
    RETURNED = "returned"
    APPROVED = "approved"


class TaskType(str, Enum):
    VISIT = "branch_visit"
    GENERAL = "general_task"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text)
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.ASSIGNED)
    task_type = Column(SQLEnum(TaskType), nullable=False)

    # Relationships
    assigner_id = Column(Integer, ForeignKey("users.id"))
    assignee_id = Column(Integer, ForeignKey("users.id"))
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)  # Only for visit tasks

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    approved_at = Column(DateTime, nullable=True)

    # Return/approval metadata
    return_reason = Column(Text, nullable=True)
    completion_notes = Column(Text, nullable=True)

    # Relationships
    assigner = relationship("User", foreign_keys=[assigner_id], back_populates="assigned_tasks")
    assignee = relationship("User", foreign_keys=[assignee_id], back_populates="received_tasks")
    branch = relationship("Branch", back_populates="tasks")