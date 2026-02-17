"""Candidates router – Candidate listing, detail, and status management."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_
from database import get_db
from models import Candidate
from schemas import CandidateResponse, CandidateListResponse, CandidateStatusUpdate

router = APIRouter(prefix="/candidates", tags=["Candidates Portal"])


@router.get("", response_model=CandidateListResponse)
async def list_candidates(
    search: str = None,
    status: str = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """List candidates with optional search and status filter."""
    query = select(Candidate).order_by(desc(Candidate.match_score))

    if status and status != "all":
        query = query.where(Candidate.status == status)

    if search:
        search_filter = f"%{search}%"
        query = query.where(
            or_(
                Candidate.name.ilike(search_filter),
                Candidate.title.ilike(search_filter),
                Candidate.company.ilike(search_filter),
            )
        )

    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    candidates = result.scalars().all()

    # Get total count
    count_query = select(Candidate)
    if status and status != "all":
        count_query = count_query.where(Candidate.status == status)
    count_result = await db.execute(count_query)
    total = len(count_result.scalars().all())

    return CandidateListResponse(candidates=candidates, total=total)


@router.get("/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(candidate_id: int, db: AsyncSession = Depends(get_db)):
    """Get a candidate by ID."""
    result = await db.execute(select(Candidate).where(Candidate.id == candidate_id))
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.put("/{candidate_id}/status", response_model=CandidateResponse)
async def update_candidate_status(
    candidate_id: int,
    update: CandidateStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a candidate's status."""
    result = await db.execute(select(Candidate).where(Candidate.id == candidate_id))
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    candidate.status = update.status
    return candidate
