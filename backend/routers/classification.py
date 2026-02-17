"""Classification router – Candidate categorization endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from database import get_db
from models import Candidate, Classification, ActivityLog
from schemas import (
    ClassifyRequest, ClassificationResponse, ClassificationListResponse,
    CategoryBreakdown
)
from agents.classification_agent import classification_agent, CATEGORIES

router = APIRouter(prefix="/classification", tags=["Classification Agent"])


@router.post("/classify", response_model=ClassificationResponse)
async def classify_candidate(request: ClassifyRequest, db: AsyncSession = Depends(get_db)):
    """Classify a single candidate."""
    result = await db.execute(select(Candidate).where(Candidate.id == request.candidate_id))
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    candidate_data = {
        "name": candidate.name,
        "title": candidate.title,
        "company": candidate.company,
        "skills": candidate.skills or [],
        "experience": candidate.experience,
    }

    classification_result = await classification_agent.classify_candidate(candidate_data)

    classification = Classification(
        candidate_id=candidate.id,
        category=classification_result["category"],
        confidence=classification_result["confidence"],
        seniority=classification_result.get("seniority"),
        culture_fit=classification_result.get("culture_fit"),
    )
    db.add(classification)

    activity = ActivityLog(
        agent="classification",
        action=f"Classified {candidate.name} as {classification_result['category']} ({classification_result['confidence']}%)",
        details={"candidate_id": candidate.id}
    )
    db.add(activity)

    await db.flush()
    return classification


@router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Get category breakdown with counts."""
    # Get counts from DB
    result = await db.execute(
        select(Classification.category, func.count(Classification.id))
        .group_by(Classification.category)
    )
    counts = dict(result.all())

    total = sum(counts.values()) or 1
    categories = []
    for cat in CATEGORIES:
        count = counts.get(cat["name"], 0)
        categories.append(CategoryBreakdown(
            name=cat["name"],
            count=count,
            color=cat["color"],
            percentage=round((count / total) * 100, 1) if total > 0 else 0,
        ))

    return categories


@router.get("/results", response_model=ClassificationListResponse)
async def get_classification_results(
    category: str = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Get classified candidates with optional category filter."""
    query = select(Classification).order_by(desc(Classification.created_at))
    if category:
        query = query.where(Classification.category == category)
    query = query.limit(limit)

    result = await db.execute(query)
    classifications = result.scalars().all()

    # Get categories
    cat_result = await db.execute(
        select(Classification.category, func.count(Classification.id))
        .group_by(Classification.category)
    )
    counts = dict(cat_result.all())
    total = sum(counts.values()) or 1

    categories = [
        CategoryBreakdown(
            name=c["name"], count=counts.get(c["name"], 0),
            color=c["color"],
            percentage=round((counts.get(c["name"], 0) / total) * 100, 1)
        )
        for c in CATEGORIES
    ]

    return ClassificationListResponse(classifications=classifications, categories=categories)
