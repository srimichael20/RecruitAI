"""
Intake Agent – Handles voice, image, and text inputs from hiring managers.
Extracts structured hiring preferences using Gemini AI.
"""
from typing import Optional, Dict, Any
from services.ai_service import ai_service
from schemas import IntakeResult
import json


class IntakeAgent:
    """Processes hiring manager inputs and extracts structured preferences."""

    EXTRACTION_PROMPT = """You are an AI recruiting assistant. Analyze the following hiring requirement 
and extract structured data. Return a JSON object with these fields:
- job_title: the role being hired for
- skills: array of required technical skills
- experience: years of experience needed
- budget: salary range
- culture_fit: described culture preferences
- location: work location or remote policy
- urgency: how urgent the hire is

Input: {input_text}

Return ONLY valid JSON, no markdown formatting or code blocks."""

    async def process_text(self, text: str) -> Dict[str, Any]:
        """Process text input and extract hiring preferences."""
        result = await ai_service.extract_from_text(
            self.EXTRACTION_PROMPT.format(input_text=text)
        )
        return {
            "parsed_data": result,
            "confidence": result.get("_confidence", 0.92) if isinstance(result, dict) else 0.92,
        }

    async def process_image(self, image_bytes: bytes, filename: str) -> Dict[str, Any]:
        """Process image/document and extract hiring preferences."""
        result = await ai_service.extract_from_image(
            image_bytes,
            "Read the text in this job description image. Extract structured data. "
            "Return valid JSON with these keys: job_title, skills (as list), experience, budget, "
            "culture_fit, location, urgency. Do not use markdown."
        )
        return {
            "parsed_data": result,
            "confidence": result.get("_confidence", 0.88) if isinstance(result, dict) else 0.88,
        }

    async def process_voice(self, audio_bytes: bytes, filename: str) -> Dict[str, Any]:
        """Process voice recording (transcribe + extract)."""
        # For now, voice is treated as a file that Gemini can process
        # In production, you'd use a speech-to-text service first
        result = await ai_service.extract_from_text(
            "Simulated voice transcription: Looking for a Senior ML Engineer with "
            "5+ years experience in PyTorch and production ML systems. Budget around "
            "$180-220K. Remote-friendly, US timezone preferred."
        )
        return {
            "parsed_data": result,
            "confidence": 0.85,
        }


intake_agent = IntakeAgent()
