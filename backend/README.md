# Backend

FastAPI backend foundation for FraudShield AI.

## Current Phase

Backend skeleton with a health endpoint and local frontend CORS support.
Authentication, database integration, upload processing, and ML model connection
will be added in later steps.

## Setup

From the `backend` folder:

```bash
pip install -r requirements.txt
```

## Run

From the `backend` folder:

```bash
uvicorn app.main:app --reload
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "FraudShield AI Backend",
  "version": "0.1.0"
}
```

## Structure

- `app/api` for API routers.
- `app/core` for settings and shared configuration.
- `app/schemas` for request and response validation.
- `app/services` for business logic.
- `app/database` for database configuration and models.
