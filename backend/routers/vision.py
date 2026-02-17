"""Vision router – Document upload and extraction endpoints."""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from database import get_db
from models import Document, ActivityLog
from schemas import DocumentResponse, DocumentListResponse
from agents.vision_agent import vision_agent
from services.file_service import file_service

router = APIRouter(prefix="/vision", tags=["Vision Agent"])


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    """Upload a document for AI extraction."""
    file_bytes = await file.read()
    file_path = file_service.save_file(file_bytes, file.filename)
    file_type = file_service.get_file_type(file.filename)

    doc = Document(
        filename=file.filename,
        file_path=file_path,
        file_type=file_type,
        status="processing",
    )
    db.add(doc)
    await db.flush()

    result = await vision_agent.process_document(file_bytes, file.filename, file_type)

    doc.doc_type = result.get("doc_type", "Document")
    doc.extracted_fields = result.get("fields", [])
    doc.confidence_scores = result.get("confidence_scores", {})
    doc.status = "complete"

    activity = ActivityLog(
        agent="vision",
        action=f"Extracted {len(result.get('fields', []))} fields from {file.filename}",
        details={"document_id": doc.id}
    )
    db.add(activity)

    return doc


@router.get("/documents", response_model=DocumentListResponse)
async def list_documents(limit: int = 20, db: AsyncSession = Depends(get_db)):
    """List all processed documents."""
    result = await db.execute(
        select(Document).order_by(desc(Document.created_at)).limit(limit)
    )
    documents = result.scalars().all()
    return DocumentListResponse(documents=documents, total=len(documents))


@router.get("/documents/{doc_id}", response_model=DocumentResponse)
async def get_document(doc_id: int, db: AsyncSession = Depends(get_db)):
    """Get extraction results for a specific document."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc
