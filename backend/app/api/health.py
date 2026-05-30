"""Health check API routes."""

from fastapi import APIRouter

from app.core.config import settings
from app.schemas.common import HealthResponse


router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """Return backend service health."""
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.app_version,
    )
