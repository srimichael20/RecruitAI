from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Intake(Base):
    """Raw intake submissions from hiring managers."""
    __tablename__ = "intakes"

    id = Column(Integer, primary_key=True, index=True)
    mode = Column(String(20), nullable=False)  # 'voice', 'image', 'text'
    raw_input = Column(Text, nullable=True)  # text content or file reference
    file_path = Column(String(500), nullable=True)  # uploaded file path
    parsed_data = Column(JSON, nullable=True)  # extracted structured data
    confidence = Column(Float, nullable=True)
    status = Column(String(20), default="pending")  # pending, processing, processed, error
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Document(Base):
    """Documents processed by the Vision Agent."""
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, png, jpg, docx
    doc_type = Column(String(50), nullable=True)  # Resume, Job Description, Org Chart, etc.
    extracted_fields = Column(JSON, nullable=True)
    confidence_scores = Column(JSON, nullable=True)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Candidate(Base):
    """Candidates sourced and matched by the platform."""
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    initials = Column(String(5), nullable=True)
    title = Column(String(200), nullable=True)
    company = Column(String(200), nullable=True)
    location = Column(String(200), nullable=True)
    skills = Column(JSON, nullable=True)
    experience = Column(String(50), nullable=True)
    match_score = Column(Float, nullable=True)
    screen_score = Column(Float, nullable=True)
    status = Column(String(20), default="new")  # new, screened, interview, offer, hired
    source = Column(String(100), nullable=True)  # LinkedIn, GitHub, Referral, etc.
    email = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    classification = relationship("Classification", back_populates="candidate", uselist=False)


class Classification(Base):
    """Classification results for a candidate."""
    __tablename__ = "classifications"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    category = Column(String(100), nullable=False)  # Machine Learning, Frontend, Backend, etc.
    confidence = Column(Float, nullable=False)
    seniority = Column(String(50), nullable=True)  # Junior, Mid, Senior, Staff, Principal
    culture_fit = Column(String(50), nullable=True)  # Low, Medium, High, Very High
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    candidate = relationship("Candidate", back_populates="classification")


class Integration(Base):
    """External system connections managed by the Integration Agent."""
    __tablename__ = "integrations"

    id = Column(Integer, primary_key=True, index=True)
    system_name = Column(String(100), nullable=False, unique=True)
    system_type = Column(String(50), nullable=True)  # ats, social, database, assessment
    status = Column(String(20), default="disconnected")  # connected, syncing, error, disconnected
    last_sync = Column(DateTime(timezone=True), nullable=True)
    record_count = Column(Integer, default=0)
    config = Column(JSON, nullable=True)  # connection parameters (non-sensitive)
    color = Column(String(20), nullable=True)  # UI display color


class ApiLog(Base):
    """API call logs for the Integration Agent."""
    __tablename__ = "api_logs"

    id = Column(Integer, primary_key=True, index=True)
    method = Column(String(10), nullable=False)
    endpoint = Column(String(500), nullable=False)
    source = Column(String(100), nullable=True)
    status_code = Column(Integer, nullable=False)
    duration_ms = Column(Integer, nullable=True)
    request_body = Column(JSON, nullable=True)
    response_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ActivityLog(Base):
    """General activity feed across all agents."""
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    agent = Column(String(50), nullable=False)  # intake, vision, classification, integration, orchestrator
    action = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
