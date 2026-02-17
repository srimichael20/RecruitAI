"""
Perfectly AI – FastAPI Backend
Main application entrypoint.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables on startup."""
    await init_db()
    await seed_demo_data()
    yield


app = FastAPI(
    title="Perfectly AI",
    description="AI Recruiting Agency – Backend API powering 5 intelligent agents",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS – allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Include Routers ──
from routers.intake import router as intake_router
from routers.vision import router as vision_router
from routers.classification import router as classification_router
from routers.integration import router as integration_router
from routers.candidates import router as candidates_router
from routers.dashboard import router as dashboard_router

app.include_router(intake_router, prefix="/api/v1")
app.include_router(vision_router, prefix="/api/v1")
app.include_router(classification_router, prefix="/api/v1")
app.include_router(integration_router, prefix="/api/v1")
app.include_router(candidates_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")


@app.get("/", tags=["Health"])
async def root():
    return {
        "name": "Perfectly AI",
        "version": "1.0.0",
        "status": "running",
        "agents": ["intake", "vision", "classification", "integration", "orchestrator"],
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}


# ── Seed Demo Data ──
async def seed_demo_data():
    """Populate the database with demo candidates if empty."""
    from database import async_session
    from models import Candidate, Classification
    from sqlalchemy import select

    async with async_session() as db:
        result = await db.execute(select(Candidate).limit(1))
        if result.scalar_one_or_none():
            return  # Already seeded

        candidates = [
            Candidate(
                name="Sarah Chen", initials="SC", title="Staff ML Engineer",
                company="Google", location="San Francisco, CA",
                skills=["Python", "PyTorch", "MLOps", "Kubernetes"],
                experience="8 years", match_score=97, screen_score=95,
                status="interview", source="LinkedIn",
            ),
            Candidate(
                name="Marcus Johnson", initials="MJ", title="Senior Frontend Engineer",
                company="Stripe", location="New York, NY",
                skills=["React", "TypeScript", "Next.js", "GraphQL"],
                experience="6 years", match_score=94, screen_score=91,
                status="screened", source="GitHub",
            ),
            Candidate(
                name="Priya Patel", initials="PP", title="Backend Engineer",
                company="Netflix", location="Los Angeles, CA",
                skills=["Go", "gRPC", "PostgreSQL", "Redis", "Kafka"],
                experience="5 years", match_score=92, screen_score=88,
                status="new", source="Referral",
            ),
            Candidate(
                name="David Kim", initials="DK", title="DevOps Lead",
                company="Uber", location="Seattle, WA",
                skills=["Terraform", "AWS", "Docker", "Kubernetes", "CI/CD"],
                experience="7 years", match_score=91, screen_score=89,
                status="interview", source="LinkedIn",
            ),
            Candidate(
                name="Emma Wilson", initials="EW", title="Product Designer",
                company="Figma", location="Remote",
                skills=["Figma", "User Research", "Design Systems", "Prototyping"],
                experience="4 years", match_score=89, screen_score=92,
                status="offer", source="AngelList",
            ),
            Candidate(
                name="Alex Rivera", initials="AR", title="Data Scientist",
                company="Meta", location="Menlo Park, CA",
                skills=["Python", "Spark", "SQL", "Tableau", "Scikit-learn"],
                experience="5 years", match_score=88, screen_score=85,
                status="screened", source="Stack Overflow",
            ),
            Candidate(
                name="Nina Kowalski", initials="NK", title="Engineering Manager",
                company="Shopify", location="Toronto, ON",
                skills=["Leadership", "Agile", "System Design", "Ruby", "Go"],
                experience="10 years", match_score=93, screen_score=96,
                status="hired", source="LinkedIn",
            ),
            Candidate(
                name="James Park", initials="JP", title="Mobile Engineer",
                company="DoorDash", location="San Francisco, CA",
                skills=["Swift", "Kotlin", "React Native", "Firebase"],
                experience="4 years", match_score=86, screen_score=83,
                status="new", source="GitHub",
            ),
            Candidate(
                name="Olivia Brown", initials="OB", title="ML Research Scientist",
                company="DeepMind", location="London, UK",
                skills=["Python", "TensorFlow", "JAX", "Research", "NLP"],
                experience="6 years", match_score=96, screen_score=94,
                status="interview", source="Referral",
            ),
            Candidate(
                name="Raj Mehta", initials="RM", title="Full Stack Engineer",
                company="Airbnb", location="San Francisco, CA",
                skills=["React", "Node.js", "Python", "PostgreSQL", "AWS"],
                experience="5 years", match_score=90, screen_score=87,
                status="screened", source="LinkedIn",
            ),
        ]

        db.add_all(candidates)
        await db.flush()

        # Seed classifications
        classifications_data = [
            ("Machine Learning", 96, "Staff", "Very High"),
            ("Frontend Engineering", 93, "Senior", "High"),
            ("Backend Engineering", 91, "Senior", "High"),
            ("DevOps / SRE", 89, "Senior", "High"),
            ("Product Design", 87, "Mid", "Very High"),
            ("Data Science", 90, "Senior", "High"),
            ("Engineering Management", 95, "Staff", "Very High"),
            ("Mobile Development", 84, "Mid", "Medium"),
            ("Machine Learning", 97, "Senior", "Very High"),
            ("Backend Engineering", 88, "Senior", "High"),
        ]

        for i, (cat, conf, sen, fit) in enumerate(classifications_data):
            classification = Classification(
                candidate_id=candidates[i].id,
                category=cat,
                confidence=conf,
                seniority=sen,
                culture_fit=fit,
            )
            db.add(classification)

        await db.commit()
        print("✅ Seeded 10 demo candidates with classifications")
