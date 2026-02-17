from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


# ── Intake Schemas ──

class IntakeTextRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Hiring requirement description")

class IntakeResult(BaseModel):
    job_title: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[str] = None
    budget: Optional[str] = None
    culture_fit: Optional[str] = None
    location: Optional[str] = None
    urgency: Optional[str] = None

class IntakeResponse(BaseModel):
    id: int
    mode: str
    parsed_data: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class IntakeHistoryResponse(BaseModel):
    intakes: List[IntakeResponse]
    total: int


# ── Vision / Document Schemas ──

class ExtractedField(BaseModel):
    field: str
    value: str
    confidence: float

class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    doc_type: Optional[str] = None
    extracted_fields: Optional[List[ExtractedField]] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int


# ── Classification Schemas ──

class ClassifyRequest(BaseModel):
    candidate_id: int

class ClassificationResult(BaseModel):
    category: str
    confidence: float
    seniority: Optional[str] = None
    culture_fit: Optional[str] = None

class ClassificationResponse(BaseModel):
    id: int
    candidate_id: int
    category: str
    confidence: float
    seniority: Optional[str] = None
    culture_fit: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CategoryBreakdown(BaseModel):
    name: str
    count: int
    color: str
    percentage: float

class ClassificationListResponse(BaseModel):
    classifications: List[ClassificationResponse]
    categories: List[CategoryBreakdown]


# ── Candidate Schemas ──

class CandidateResponse(BaseModel):
    id: int
    name: str
    initials: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[str] = None
    match_score: Optional[float] = None
    screen_score: Optional[float] = None
    status: str
    source: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CandidateListResponse(BaseModel):
    candidates: List[CandidateResponse]
    total: int

class CandidateStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(new|screened|interview|offer|hired)$")


# ── Integration Schemas ──

class IntegrationSystemResponse(BaseModel):
    id: int
    system_name: str
    system_type: Optional[str] = None
    status: str
    last_sync: Optional[datetime] = None
    record_count: int
    color: Optional[str] = None

    class Config:
        from_attributes = True

class IntegrationStatsResponse(BaseModel):
    connected: int
    syncing: int
    errors: int
    total_records: int

class ApiLogResponse(BaseModel):
    id: int
    method: str
    endpoint: str
    source: Optional[str] = None
    status_code: int
    duration_ms: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ApiLogListResponse(BaseModel):
    logs: List[ApiLogResponse]
    total: int


# ── Dashboard Schemas ──

class DashboardMetrics(BaseModel):
    candidates_matched: int
    active_roles: int
    screens_completed: int
    avg_match_score: float

class AgentStatus(BaseModel):
    name: str
    status: str  # active, idle, error
    description: str
    color: str
    stats: List[Dict[str, str]]

class ActivityItem(BaseModel):
    text: str
    time: str
    agent: str

class DashboardResponse(BaseModel):
    metrics: DashboardMetrics
    agents: List[AgentStatus]
    activity: List[ActivityItem]
