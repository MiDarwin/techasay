from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

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