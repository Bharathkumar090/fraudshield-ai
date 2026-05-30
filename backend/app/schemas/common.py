"""Common response schemas."""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Health check response payload."""

    status: str
    service: str
    version: str
