"""Model metadata API routes."""

from typing import Any

from fastapi import APIRouter

from app.services.prediction_service import load_model_metrics


router = APIRouter(prefix="/model", tags=["Model"])


@router.get("/metrics")
def get_model_metrics() -> dict[str, Any]:
    """Return saved model metrics."""
    return load_model_metrics()
