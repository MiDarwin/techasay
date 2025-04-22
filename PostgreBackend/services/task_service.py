from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError
from models.branch import Branch
from models.task import Task, TaskStatus, TaskType
from datetime import datetime
from fastapi import HTTPException

from models.user import User


async def create_task(db: AsyncSession, task_data, assigner_id: int):
    # Manual existence checks
    assignee_exists = await db.execute(
        select(User).where(User.id == task_data.assignee_id))
    if not assignee_exists.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Assignee not found")

    if task_data.task_type == TaskType.VISIT:
        branch_exists = await db.execute(select(Branch).where(Branch.id == task_data.branch_id))
        if not branch_exists.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Branch not found")

    # Create task with raw data
    task = Task(
        title=task_data.title,
        description=task_data.description,
        task_type=task_data.task_type,
        assigner_id=assigner_id,
        assignee_id=task_data.assignee_id,
        branch_id=task_data.branch_id if task_data.task_type == TaskType.VISIT else None,
        status=TaskStatus.ASSIGNED
    )

    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


async def update_task_status(
        db: AsyncSession,
        task_id: int,
        user_id: int,
        update_data
):
    # Get task with manual query
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Status transition logic
    if update_data.status == TaskStatus.COMPLETED:
        if task.assignee_id != user_id:
            raise HTTPException(status_code=403, detail="Only assignee can complete task")

        await db.execute(
            update(Task)
            .where(Task.id == task_id)
            .values(
                status=TaskStatus.COMPLETED,
                completed_at=datetime.utcnow(),
                completion_notes=update_data.completion_notes
            )
        )

    elif update_data.status in [TaskStatus.APPROVED, TaskStatus.RETURNED]:
        if task.assigner_id != user_id:
            raise HTTPException(status_code=403, detail="Only assigner can approve/return tasks")

        values = {
            "status": update_data.status,
            "return_reason": update_data.return_reason if update_data.status == TaskStatus.RETURNED else None
        }

        if update_data.status == TaskStatus.APPROVED:
            values["approved_at"] = datetime.utcnow()
            if task.task_type == TaskType.VISIT:
                await _create_visit_from_task(db, task)

        await db.execute(update(Task).where(Task.id == task_id).values(**values))

    await db.commit()

    # Return fresh task data
    result = await db.execute(select(Task).where(Task.id == task_id))
    return result.scalar_one()


async def _create_visit_from_task(db: AsyncSession, task: Task):
    from models.visit import Visit

    visit = Visit(
        branch_id=task.branch_id,
        user_id=task.assignee_id,
        note=f"Task completed: {task.title}",
        visit_date=datetime.utcnow()
    )
    db.add(visit)
    await db.commit()


async def get_tasks_service(
        db: AsyncSession,
        current_user_id: int,
        status: Optional[str] = None,
        assignee_id: Optional[int] = None,
        assigner_id: Optional[int] = None,
        task_type: Optional[str] = None,
        page: int = 1,
        limit: int = 10
):
    try:
        # Base query
        query = select(Task).options(
            selectinload(Task.assigner),
            selectinload(Task.assignee),
            selectinload(Task.branch)
        )

        # Apply filters
        filters = []
        if status:
            filters.append(Task.status == status)
        if assignee_id:
            filters.append(Task.assignee_id == assignee_id)
        if assigner_id:
            filters.append(Task.assigner_id == assigner_id)
        if task_type:
            filters.append(Task.task_type == task_type)

        # Security filter - users can only see tasks they created or were assigned
        filters.append(
            or_(
                Task.assigner_id == current_user_id,
                Task.assignee_id == current_user_id
            )
        )

        # Execute query
        result = await db.execute(
            query.where(and_(*filters))
            .offset((page - 1) * limit)
            .limit(limit)
        )

        tasks = result.scalars().all()

        # Get total count for pagination
        count_result = await db.execute(
            select(func.count()).select_from(Task).where(and_(*filters))
        )
        total = count_result.scalar_one()

        return {
            "data": tasks,
            "total": total,
            "page": page,
            "limit": limit
        }

    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )