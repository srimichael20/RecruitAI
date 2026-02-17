"""
Classification Agent – Categorizes candidates by skills, seniority, and culture fit.
"""
from typing import Dict, Any, List
from services.ai_service import ai_service


CATEGORIES = [
    {"name": "Machine Learning", "color": "#7c3aed"},
    {"name": "Frontend Engineering", "color": "#06b6d4"},
    {"name": "Backend Engineering", "color": "#10b981"},
    {"name": "DevOps / SRE", "color": "#f59e0b"},
    {"name": "Product Design", "color": "#f43f5e"},
    {"name": "Data Science", "color": "#3b82f6"},
    {"name": "Engineering Management", "color": "#8b5cf6"},
    {"name": "Mobile Development", "color": "#22d3ee"},
]


class ClassificationAgent:
    """Classifies candidates into categories with confidence scoring."""

    CLASSIFY_PROMPT = """Given the following candidate profile, classify them.
Return a JSON object with:
- category: one of [Machine Learning, Frontend Engineering, Backend Engineering, DevOps / SRE, Product Design, Data Science, Engineering Management, Mobile Development]
- confidence: 0-100 confidence score
- seniority: one of [Junior, Mid, Senior, Staff, Principal]
- culture_fit: one of [Low, Medium, High, Very High]

Candidate Profile:
Name: {name}
Title: {title}
Company: {company}
Skills: {skills}
Experience: {experience}

Return ONLY valid JSON."""

    async def classify_candidate(self, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        """Classify a single candidate."""
        prompt = self.CLASSIFY_PROMPT.format(
            name=candidate_data.get("name", "Unknown"),
            title=candidate_data.get("title", "Unknown"),
            company=candidate_data.get("company", "Unknown"),
            skills=", ".join(candidate_data.get("skills", [])),
            experience=candidate_data.get("experience", "Unknown"),
        )

        result = await ai_service.extract_from_text(prompt)

        if isinstance(result, dict) and "category" in result:
            return result

        return self._mock_classification(candidate_data)

    async def batch_classify(self, candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Classify multiple candidates."""
        results = []
        for candidate in candidates:
            result = await self.classify_candidate(candidate)
            results.append(result)
        return results

    def get_categories(self) -> List[Dict[str, str]]:
        """Return available categories."""
        return CATEGORIES

    def _mock_classification(self, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback mock classification."""
        skills = candidate_data.get("skills", [])
        skills_lower = [s.lower() for s in skills] if skills else []

        if any(s in skills_lower for s in ["pytorch", "tensorflow", "ml", "machine learning"]):
            category = "Machine Learning"
        elif any(s in skills_lower for s in ["react", "vue", "angular", "frontend", "css"]):
            category = "Frontend Engineering"
        elif any(s in skills_lower for s in ["go", "java", "postgresql", "backend", "api"]):
            category = "Backend Engineering"
        elif any(s in skills_lower for s in ["docker", "kubernetes", "terraform", "devops", "aws"]):
            category = "DevOps / SRE"
        else:
            category = "Backend Engineering"

        return {
            "category": category,
            "confidence": 88.0,
            "seniority": "Senior",
            "culture_fit": "High",
        }


classification_agent = ClassificationAgent()
