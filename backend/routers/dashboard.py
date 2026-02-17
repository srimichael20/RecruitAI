"""Dashboard router – Metrics, agent status, and activity feed."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from database import get_db
from models import ActivityLog
from schemas import DashboardMetrics, AgentStatus, ActivityItem, DashboardResponse
from agents.orchestrator import orchestrator

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/metrics", response_model=DashboardMetrics)
async def get_metrics():
    """Get aggregate dashboard metrics."""
    return DashboardMetrics(**orchestrator.get_metrics())


@router.get("/agents")
async def get_agent_statuses():
    """Get status of all agents."""
    return orchestrator.get_agent_statuses()


@router.get("/activity")
async def get_activity(limit: int = 10, db: AsyncSession = Depends(get_db)):
    """Get recent activity feed."""
    # Try DB first
    result = await db.execute(
        select(ActivityLog).order_by(desc(ActivityLog.created_at)).limit(limit)
    )
    logs = result.scalars().all()

    if logs:
        return [
            ActivityItem(
                text=log.action,
                time=log.created_at.strftime("%Hh %Mm ago") if log.created_at else "just now",
                agent=log.agent,
            )
            for log in logs
        ]

    # Fallback to orchestrator mock data
    return orchestrator.get_recent_activity()


@router.get("", response_model=DashboardResponse)
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    """Get full dashboard data in one call."""
    metrics = DashboardMetrics(**orchestrator.get_metrics())
    agents = [AgentStatus(**a) for a in orchestrator.get_agent_statuses()]
    activity = orchestrator.get_recent_activity()

    return DashboardResponse(
        metrics=metrics,
        agents=agents,
        activity=[ActivityItem(**a) for a in activity],
    )
