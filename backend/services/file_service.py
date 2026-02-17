"""
File Service – Handles file upload storage and management.
"""
import os
import uuid
from typing import Optional
from config import settings


class FileService:
    """Manages file uploads and storage."""

    def __init__(self):
        os.makedirs(settings.upload_dir, exist_ok=True)

    def save_file(self, file_bytes: bytes, original_filename: str) -> str:
        """Save uploaded file and return the storage path."""
        ext = original_filename.rsplit(".", 1)[-1] if "." in original_filename else "bin"
        unique_name = f"{uuid.uuid4().hex[:12]}_{original_filename}"
        file_path = os.path.join(settings.upload_dir, unique_name)

        with open(file_path, "wb") as f:
            f.write(file_bytes)

        return file_path

    def get_file_type(self, filename: str) -> str:
        """Extract file extension/type from filename."""
        if "." in filename:
            return filename.rsplit(".", 1)[-1].lower()
        return "unknown"

    def delete_file(self, file_path: str) -> bool:
        """Delete a stored file."""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
        except Exception:
            pass
        return False


file_service = FileService()
