"""Application configuration for the FraudShield AI backend."""

import os

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
        "https://fraudshield-ai-lime.vercel.app",
    )

    def allowed_cors_origins(self) -> list[str]:
        """Return local and deployment frontend origins."""
        origins = list(self.cors_origins)
        frontend_origin = os.getenv("FRONTEND_ORIGIN")
        if frontend_origin and frontend_origin not in origins:
            origins.append(frontend_origin)
        return origins


settings = Settings()
