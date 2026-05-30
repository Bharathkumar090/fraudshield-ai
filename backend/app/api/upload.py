"""Upload API routes."""

from fastapi import APIRouter, File, Form, UploadFile

from app.schemas.upload import UploadResponse
from app.services.upload_service import process_upload


router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/file", response_model=UploadResponse)
async def upload_transaction_file(
    file: UploadFile = File(...),
    threshold: float | None = Form(default=None),
) -> UploadResponse:
    """Upload transaction data and return fraud prediction results."""
    file_bytes = await file.read()
    result = process_upload(file.filename or "uploaded_file", file_bytes, threshold)
    return UploadResponse(**result)
