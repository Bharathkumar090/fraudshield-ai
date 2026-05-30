# FraudShield AI Backend

FastAPI backend for FraudShield AI upload validation, schema detection, model selection, fraud prediction, model metrics, and report downloads.

## Local Setup

From the `backend` folder:

```bash
pip install -r requirements.txt
```

## Local Run

From the `backend` folder:

```bash
python -m uvicorn app.main:app --reload
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

API docs:

```text
http://127.0.0.1:8000/docs
```

## Environment Variables

Copy `.env.example` when configuring deployment values:

```text
FRONTEND_ORIGIN=http://localhost:5173
```

Local frontend origins are allowed by default:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

Set `FRONTEND_ORIGIN` to the deployed frontend URL in production.

## Linux Deployment Start Command

Use:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

The same command is included in `start.sh`.

## Render Deployment Settings

If deploying from this repository on Render:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment variable: `FRONTEND_ORIGIN=<your deployed frontend URL>`

A starter `render.yaml` is included for convenience. Update `FRONTEND_ORIGIN` before production deployment.

## Required Model Artifacts

The deployed backend requires trained ML artifacts at these paths relative to the backend folder:

```text
../ml/artifacts/model.pkl
../ml/artifacts/preprocessor.pkl
../ml/artifacts/feature_columns.json
../ml/artifacts/metrics.json
../ml/artifacts/business_model.pkl
../ml/artifacts/business_preprocessor.pkl
../ml/artifacts/business_feature_columns.json
../ml/artifacts/business_metrics.json
```

Large datasets should not be committed. Train models locally or provide artifacts securely through your deployment workflow.

## Structure

- `app/api` for API routers
- `app/core` for settings and shared configuration
- `app/schemas` for request and response validation
- `app/services` for upload, prediction, and report logic
- `app/database` for future database configuration and models
