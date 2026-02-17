"""
AI Service – Uses Ollama (local) or Gemini (cloud) for text and vision tasks.
Ollama is preferred (free, unlimited). Falls back to Gemini, then mock data.
"""
import json
import logging
import asyncio
import base64
import aiohttp
from typing import Dict, Any, Optional
from config import settings

logger = logging.getLogger(__name__)

OLLAMA_BASE = "http://localhost:11434"


class AIService:
    """Wrapper for AI inference — Ollama (local) preferred, Gemini fallback."""

    def __init__(self):
        self._ollama_available = None
        self._gemini_model = None
        self._initialized = False

    async def _check_ollama(self) -> bool:
        """Check if Ollama is running and has a model available."""
        if self._ollama_available is not None:
            return self._ollama_available

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{OLLAMA_BASE}/api/tags", timeout=aiohttp.ClientTimeout(total=3)) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        models = [m["name"] for m in data.get("models", [])]
                        if models:
                            print(f"✅ Ollama is running with models: {models}")
                            self._ollama_available = True
                            return True
                        else:
                            print("⚠️ Ollama is running but no models found. Pull one with: ollama pull gemma3:4b")
                            self._ollama_available = False
                            return False
        except Exception:
            print("ℹ️ Ollama is not running. Using Gemini or mock data.")
            self._ollama_available = False
            return False

    def _init_gemini(self):
        """Initialize Gemini as fallback."""
        if self._gemini_model is not None or not settings.has_gemini:
            return
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.gemini_api_key)
            self._gemini_model = genai.GenerativeModel("gemini-1.5-flash")
            print("✅ Gemini (1.5 Flash) initialized", flush=True)
        except Exception as e:
            print(f"⚠️ Gemini init failed: {e}", flush=True)

    async def _call_ollama(self, prompt: str, model: str = None) -> Optional[str]:
        """Send prompt to Ollama and return the text response."""
        if not model:
            # Auto-detect the best available model
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(f"{OLLAMA_BASE}/api/tags", timeout=aiohttp.ClientTimeout(total=3)) as resp:
                        data = await resp.json()
                        models = [m["name"] for m in data.get("models", [])]
                        # Prefer gemma3, then llama, then whatever is available
                        for preferred in ["gemma3", "gemma2", "llama3", "llama", "mistral", "phi"]:
                            match = [m for m in models if preferred in m.lower()]
                            if match:
                                model = match[0]
                                break
                        if not model and models:
                            model = models[0]
            except Exception:
                return None

        if not model:
            return None

        try:
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.3},
            }
            print(f"🔄 Calling Ollama ({model}) with {len(prompt)} chars...")
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{OLLAMA_BASE}/api/generate",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=120),
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        text = data.get("response", "").strip()
                        print(f"✅ Ollama responded ({len(text)} chars)")
                        return text
                    else:
                        print(f"❌ Ollama returned status {resp.status}")
                        return None
        except asyncio.TimeoutError:
            print("❌ Ollama timed out (120s)")
            return None
        except Exception as e:
            print(f"❌ Ollama call failed: {e}")
            return None

    async def extract_from_text(self, prompt: str) -> Dict[str, Any]:
        """Extract structured data from text using Gemini (preferred) or Ollama."""
        
        # Try Gemini first (higher quality)
        self._init_gemini()
        if self._gemini_model:
            try:
                print(f"🔄 Calling Gemini (Cloud)...", flush=True)
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None, self._gemini_model.generate_content, prompt
                )
                text = response.text.strip()
                result = self._parse_json(text)
                if result:
                    return result
            except Exception as e:
                print(f"❌ Gemini failed: {str(e)[:100]}", flush=True)

        # Fallback to Ollama (Local)
        if await self._check_ollama():
            text = await self._call_ollama(prompt)
            if text:
                result = self._parse_json(text)
                if result:
                    return result

        print("⚠️ All AI providers failed, using mock data", flush=True)
        return self._mock_text_response()

    async def extract_from_image(self, image_bytes: bytes, prompt: str) -> Dict[str, Any]:
        """Extract data from image using Gemini Vision (preferred) or Ollama (moondream)."""
        
        # Try Gemini Vision first (Higher Quality)
        self._init_gemini()
        if self._gemini_model:
            try:
                print(f"🔄 Calling Gemini Vision (Cloud)...", flush=True)
                image_part = {"mime_type": "image/png", "data": image_bytes}
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None, self._gemini_model.generate_content, [prompt, image_part]
                )
                result = self._parse_json(response.text.strip())
                if result:
                    return result
            except Exception as e:
                print(f"❌ Gemini vision failed: {e}", flush=True)

        # Fallback to Ollama (moondream)
        if await self._check_ollama():
            try:
                # Detect correct moondream model name
                model_name = "moondream"
                async with aiohttp.ClientSession() as session:
                    async with session.get(f"{OLLAMA_BASE}/api/tags", timeout=aiohttp.ClientTimeout(total=3)) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            models = [m["name"] for m in data.get("models", [])]
                            match = [m for m in models if "moondream" in m]
                            if match:
                                model_name = match[0]
                                print(f"✅ Using Vision Model: {model_name}", flush=True)

                # Convert image to base64
                import io
                from PIL import Image
                
                # Resize image for faster local inference
                image = Image.open(io.BytesIO(image_bytes))
                if image.mode != "RGB":
                    image = image.convert("RGB")
                    
                max_size = 1024
                if max(image.size) > max_size:
                    image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                    print(f"📉 Resized image to {image.size}", flush=True)
                
                buffered = io.BytesIO()
                image.save(buffered, format="JPEG", quality=85)
                img_b64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
                
                payload = {
                    "model": model_name,
                    "prompt": prompt + " Return valid JSON.",
                    "images": [img_b64],
                    "stream": False,
                    "options": {"temperature": 0.1},
                }
                
                print(f"🔄 Calling Ollama Vision ({model_name}) with image...", flush=True)
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        f"{OLLAMA_BASE}/api/generate",
                        json=payload,
                        timeout=aiohttp.ClientTimeout(total=120),
                    ) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            text = data.get("response", "").strip()
                            print(f"✅ Ollama Vision responded ({len(text)} chars)", flush=True)
                            result = self._parse_json(text)
                            if result:
                                return result
                        elif resp.status == 404:
                             print(f"⚠️ Model '{model_name}' not found. Pull with: ollama pull {model_name}", flush=True)
                        else:
                            print(f"❌ Ollama Vision returned status {resp.status}", flush=True)
            except asyncio.TimeoutError:
                print("❌ Ollama Vision timed out (120s)", flush=True)
            except Exception as e:
                print(f"❌ Ollama Vision failed: {e}", flush=True)

        return self._mock_vision_response()

    def _parse_json(self, text: str) -> Optional[Dict[str, Any]]:
        """Parse JSON from AI response, handling markdown code blocks and moondream chatter."""
        try:
            # 1. Clean markdown
            cleaned = text.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass

        try:
            # 2. Regex search for JSON object
            import re
            match = re.search(r'(\{.*\})', text, re.DOTALL)
            if match:
                json_str = match.group(1)
                return json.loads(json_str)
        except (json.JSONDecodeError, AttributeError):
            pass

        print(f"⚠️ Could not parse JSON from response: {text[:150]}", flush=True)
        return None

    def _mock_text_response(self) -> Dict[str, Any]:
        return {
            "job_title": "Senior ML Engineer",
            "skills": ["Python", "PyTorch", "MLOps", "Kubernetes", "AWS SageMaker"],
            "experience": "5-8 years",
            "budget": "$180,000 - $220,000",
            "culture_fit": "Collaborative, fast-paced startup",
            "location": "Remote (US timezone)",
            "urgency": "High — fill within 3 weeks",
            "_confidence": 0.92,
        }

    def _mock_vision_response(self) -> Dict[str, Any]:
        return {
            "doc_type": "Resume",
            "fields": [
                {"field": "Candidate Name", "value": "Alexandra Chen", "confidence": 98},
                {"field": "Current Title", "value": "Senior Software Engineer", "confidence": 95},
                {"field": "Company", "value": "Google LLC", "confidence": 97},
                {"field": "Years Experience", "value": "7 years", "confidence": 92},
                {"field": "Education", "value": "MS Computer Science, Stanford", "confidence": 94},
                {"field": "Key Skills", "value": "Python, TensorFlow, Kubernetes, gRPC", "confidence": 89},
                {"field": "Contact Email", "value": "a.chen@example.com", "confidence": 99},
                {"field": "Location", "value": "San Francisco, CA", "confidence": 96},
            ],
        }


# Singleton instance
ai_service = AIService()
