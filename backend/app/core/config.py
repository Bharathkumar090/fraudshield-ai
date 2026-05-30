"""Application configuration for the FraudShield AI backend."""

from pydantic import BaseModel


class Settings(BaseModel):
    """Runtime settings for the FastAPI application."""

    app_name: str = "FraudShield AI Backend"
    app_version: str = "0.1.0"
    app_description: str = (
        "Secure API foundation for FraudShield AI fraud detection workflows."
    )
    cors_origins: tuple[str, ...] = (
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    )


settings = Settings()
