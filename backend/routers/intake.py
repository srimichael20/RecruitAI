"""Intake router – Endpoints for voice, image, and text intake."""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from database import get_db
from models import Intake, ActivityLog
from schemas import IntakeTextRequest, IntakeResponse, IntakeHistoryResponse
from agents.intake_agent import intake_agent
from services.file_service import file_service
import json

router = APIRouter(prefix="/intake", tags=["Intake Agent"])


@router.post("/text", response_model=IntakeResponse)
async def intake_text(request: IntakeTextRequest, db: AsyncSession = Depends(get_db)):
    """Process text input and extract hiring preferences."""
    # Create intake record
    intake = Intake(mode="text", raw_input=request.text, status="processing")
    db.add(intake)
    await db.flush()

    # Process with agent
    result = await intake_agent.process_text(request.text)

    intake.parsed_data = result["parsed_data"]
    intake.confidence = result["confidence"]
    intake.status = "processed"

    # Log activity
    activity = ActivityLog(
        agent="intake",
        action=f"Processed text intake for {result['parsed_data'].get('job_title', 'Unknown Role')}",
        details={"intake_id": intake.id, "mode": "text"}
    )
    db.add(activity)

    return intake


@router.post("/image", response_model=IntakeResponse)
async def intake_image(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    """Process image/document upload and extract hiring preferences."""
    file_bytes = await file.read()
    file_path = file_service.save_file(file_bytes, file.filename)

    intake = Intake(mode="image", file_path=file_path, status="processing")
    db.add(intake)
    await db.flush()

    result = await intake_agent.process_image(file_bytes, file.filename)

    intake.parsed_data = result["parsed_data"]
    intake.confidence = result["confidence"]
    intake.status = "processed"

    activity = ActivityLog(
        agent="intake",
        action=f"Processed image upload — {file.filename}",
        details={"intake_id": intake.id, "mode": "image"}
    )
    db.add(activity)

    return intake


@router.post("/voice", response_model=IntakeResponse)
async def intake_voice(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    """Process voice recording and extract hiring preferences."""
    file_bytes = await file.read()
    file_path = file_service.save_file(file_bytes, file.filename)

    intake = Intake(mode="voice", file_path=file_path, status="processing")
    db.add(intake)
    await db.flush()

    result = await intake_agent.process_voice(file_bytes, file.filename)

    intake.parsed_data = result["parsed_data"]
    intake.confidence = result["confidence"]
    intake.status = "processed"

    activity = ActivityLog(
        agent="intake",
        action="Processed voice recording intake",
        details={"intake_id": intake.id, "mode": "voice"}
    )
    db.add(activity)

    return intake


@router.get("/history", response_model=IntakeHistoryResponse)
async def intake_history(limit: int = 20, db: AsyncSession = Depends(get_db)):
    """Get recent intake submissions."""
    result = await db.execute(
        select(Intake).order_by(desc(Intake.created_at)).limit(limit)
    )
    intakes = result.scalars().all()
    return IntakeHistoryResponse(intakes=intakes, total=len(intakes))
