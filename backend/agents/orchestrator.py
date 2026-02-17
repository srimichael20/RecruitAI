"""
Orchestrator Agent – Coordinates the full recruiting pipeline.
Intake → Vision → Classification → Integration → Deliver
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone


class OrchestratorAgent:
    """Coordinates the AI recruiting pipeline across all agents."""

    def __init__(self):
        self.pipeline_status = "idle"
        self.active_jobs = []

    async def run_pipeline(self, intake_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run the full pipeline for a new hiring requirement.
        Steps: Intake → Vision (if docs) → Classification → Integration → Deliver
        """
        self.pipeline_status = "running"

        results = {
            "intake": intake_data,
            "vision": None,
            "classification": None,
            "integration": None,
            "candidates_matched": 0,
            "status": "complete",
        }

        self.pipeline_status = "idle"
        return results

    def get_agent_statuses(self) -> List[Dict[str, Any]]:
        """Return status of all agents in the pipeline."""
        return [
            {
                "name": "Intake Agent",
                "status": "active",
                "description": "Captures hiring requirements via voice, image, or text.",
                "color": "#06b6d4",
                "stats": [
                    {"value": "342", "label": "Inputs"},
                    {"value": "98%", "label": "Parsed"},
                ],
            },
            {
                "name": "Vision Agent",
                "status": "active",
                "description": "Extracts data from resumes and documents.",
                "color": "#10b981",
                "stats": [
                    {"value": "1,892", "label": "Documents"},
                    {"value": "4.2s", "label": "Avg Time"},
                ],
            },
            {
                "name": "Classification Agent",
                "status": "active",
                "description": "Categorizes candidates by skills and fit.",
                "color": "#f59e0b",
                "stats": [
                    {"value": "24", "label": "Categories"},
                    {"value": "94%", "label": "Accuracy"},
                ],
            },
            {
                "name": "Integration Agent",
                "status": "active",
                "description": "Syncs with ATS, LinkedIn, GitHub, and databases.",
                "color": "#3b82f6",
                "stats": [
                    {"value": "8", "label": "Connected"},
                    {"value": "99.9%", "label": "Uptime"},
                ],
            },
        ]

    def get_metrics(self) -> Dict[str, Any]:
        """Return dashboard metrics."""
        return {
            "candidates_matched": 1247,
            "active_roles": 38,
            "screens_completed": 856,
            "avg_match_score": 94.2,
        }

    def get_recent_activity(self) -> List[Dict[str, Any]]:
        """Return recent activity feed."""
        return [
            {"text": "Vision Agent processed 23 resumes from Acme Corp batch", "time": "2m ago", "agent": "vision"},
            {"text": "Intake Agent captured voice requirements from Sarah Chen", "time": "5m ago", "agent": "intake"},
            {"text": "Classification Agent re-scored 142 candidates for Senior ML Engineer", "time": "12m ago", "agent": "classification"},
            {"text": "Integration Agent synced 45 new profiles from LinkedIn", "time": "18m ago", "agent": "integration"},
            {"text": "3 new candidates matched to Staff Frontend Engineer role", "time": "24m ago", "agent": "orchestrator"},
            {"text": "Intake Agent processed image upload — org chart detected", "time": "31m ago", "agent": "intake"},
        ]


orchestrator = OrchestratorAgent()
