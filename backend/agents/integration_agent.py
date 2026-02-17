"""
Integration Agent (MCP) – Connects to external APIs and databases.
Uses a pluggable connector architecture with mock implementations.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import random


class BaseConnector:
    """Base class for external system connectors."""

    def __init__(self, name: str, system_type: str, color: str):
        self.name = name
        self.system_type = system_type
        self.color = color
        self.status = "connected"
        self.record_count = 0
        self.last_sync = datetime.now(timezone.utc)

    async def sync(self) -> Dict[str, Any]:
        """Sync data from the external system."""
        raise NotImplementedError

    async def search(self, query: str) -> List[Dict[str, Any]]:
        """Search for candidates in the external system."""
        raise NotImplementedError

    async def push_candidate(self, candidate: Dict[str, Any]) -> bool:
        """Push a candidate to the external system."""
        raise NotImplementedError


class MockConnector(BaseConnector):
    """Mock connector that simulates external API calls."""

    def __init__(self, name: str, system_type: str, color: str, record_count: int):
        super().__init__(name, system_type, color)
        self.record_count = record_count

    async def sync(self) -> Dict[str, Any]:
        new_records = random.randint(5, 50)
        self.record_count += new_records
        self.last_sync = datetime.now(timezone.utc)
        return {
            "status": "success",
            "new_records": new_records,
            "total_records": self.record_count,
        }

    async def search(self, query: str) -> List[Dict[str, Any]]:
        return [
            {"name": f"Candidate from {self.name}", "source": self.name, "score": random.randint(70, 99)}
            for _ in range(random.randint(3, 10))
        ]

    async def push_candidate(self, candidate: Dict[str, Any]) -> bool:
        return True


class IntegrationAgent:
    """Manages external system connections via MCP-style connectors."""

    def __init__(self):
        self.connectors: Dict[str, BaseConnector] = {}
        self._init_mock_connectors()

    def _init_mock_connectors(self):
        """Initialize mock connectors for demo."""
        mocks = [
            ("LinkedIn Recruiter", "social", "#0a66c2", 12456),
            ("GitHub", "social", "#f0f0f0", 8234),
            ("Greenhouse ATS", "ats", "#24a147", 3421),
            ("Lever ATS", "ats", "#5851db", 2187),
            ("Stack Overflow", "social", "#f48024", 5678),
            ("AngelList", "social", "#000000", 1923),
            ("Internal Database", "database", "#7c3aed", 45678),
            ("HackerRank", "assessment", "#39424e", 987),
        ]
        for name, sys_type, color, count in mocks:
            self.connectors[name] = MockConnector(name, sys_type, color, count)

        # Simulate one with error
        self.connectors["HackerRank"].status = "error"

    def get_systems(self) -> List[Dict[str, Any]]:
        """Get all connected systems and their status."""
        return [
            {
                "system_name": c.name,
                "system_type": c.system_type,
                "status": c.status,
                "last_sync": c.last_sync.isoformat() if c.last_sync else None,
                "record_count": c.record_count,
                "color": c.color,
            }
            for c in self.connectors.values()
        ]

    async def sync_system(self, system_name: str) -> Dict[str, Any]:
        """Trigger sync for a specific system."""
        connector = self.connectors.get(system_name)
        if not connector:
            return {"error": f"System '{system_name}' not found"}

        connector.status = "syncing"
        result = await connector.sync()
        connector.status = "connected"
        return result

    def get_stats(self) -> Dict[str, int]:
        """Get aggregate connection stats."""
        systems = list(self.connectors.values())
        return {
            "connected": sum(1 for s in systems if s.status == "connected"),
            "syncing": sum(1 for s in systems if s.status == "syncing"),
            "errors": sum(1 for s in systems if s.status == "error"),
            "total_records": sum(s.record_count for s in systems),
        }

    def generate_mock_logs(self, count: int = 10) -> List[Dict[str, Any]]:
        """Generate mock API logs for the UI."""
        methods = ["GET", "POST", "PUT"]
        endpoints = [
            "/api/v1/candidates/sync",
            "/api/v1/profiles/batch",
            "/api/v1/ats/greenhouse/push",
            "/api/v1/candidates/search",
            "/api/v1/profiles/enrich",
            "/api/v1/assessments",
            "/api/v1/candidates/match",
            "/api/v1/ats/lever/update",
        ]
        sources = ["LinkedIn", "GitHub", "Greenhouse", "Internal DB", "Stack Overflow", "HackerRank", "Orchestrator", "Lever"]

        logs = []
        for i in range(count):
            status = 200 if random.random() > 0.1 else random.choice([400, 500, 503])
            logs.append({
                "method": random.choice(methods),
                "endpoint": random.choice(endpoints),
                "source": random.choice(sources),
                "status_code": status,
                "duration_ms": random.randint(50, 500) if status < 400 else random.randint(1000, 3000),
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        return logs


integration_agent = IntegrationAgent()
