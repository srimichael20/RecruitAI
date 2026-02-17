"""Integration router – External system management and API logs."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas import IntegrationStatsResponse, ApiLogResponse, ApiLogListResponse
from agents.integration_agent import integration_agent

router = APIRouter(prefix="/integration", tags=["Integration Agent (MCP)"])


@router.get("/systems")
async def get_systems():
    """List all connected external systems."""
    return integration_agent.get_systems()


@router.post("/sync/{system_name}")
async def sync_system(system_name: str):
    """Trigger a sync for a specific system."""
    result = await integration_agent.sync_system(system_name)
    return result


@router.get("/logs", response_model=ApiLogListResponse)
async def get_api_logs(count: int = 10):
    """Get recent API call logs."""
    logs = integration_agent.generate_mock_logs(count)
    return ApiLogListResponse(
        logs=[ApiLogResponse(id=i + 1, **log) for i, log in enumerate(logs)],
        total=count,
    )


@router.get("/stats", response_model=IntegrationStatsResponse)
async def get_stats():
    """Get aggregate connection statistics."""
    stats = integration_agent.get_stats()
    return IntegrationStatsResponse(**stats)
