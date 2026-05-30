# FraudShield AI Architecture

FraudShield AI is organized as a modular full-stack fraud detection system. The frontend handles analyst workflows, the backend owns API validation and request orchestration, and the ML layer owns model training, artifacts, and prediction logic.

## Current v1 Architecture

```text
Frontend Upload
  -> Backend Upload API
  -> ML Prediction Service
  -> Backend Response
  -> Frontend Results
```

The current v1 implementation runs locally and keeps each layer separate:

- `frontend`: React + Vite dashboard, upload flow, analytics, transactions, model insights, audit logs, and settings UI.
- `backend`: FastAPI app with health, model metrics, prediction, and upload endpoints.
- `ml`: Scikit-learn pipeline for validation, preprocessing, training, evaluation, prediction, and artifact storage.
- `docs`: Architecture and project documentation.

## Data Flow

```text
Frontend Upload -> Backend Upload API -> ML Prediction Service -> Response -> Frontend Results
```

1. A user selects a CSV, TXT, or ZIP file in the frontend Upload Transactions page.
2. The frontend sends the file as `multipart/form-data` to `POST /upload/file`.
3. The backend validates file type, file size, required transaction columns, and ZIP safety.
4. Valid rows are passed to the backend prediction service.
5. The prediction service loads local ML artifacts from `ml/artifacts`.
6. The ML model returns fraud probability, prediction, risk level, and recommended action.
7. The backend returns upload summary counts and row-level results.
8. The frontend displays the summary, previews the first 10 results, and allows CSV download.

## Components

Frontend:
- Landing page
- Dashboard layout with sidebar and topbar
- Dashboard overview
- Upload Transactions page
- Transactions page
- Analytics page
- Model Insights page
- Audit Logs page
- Settings page
- API service layer

Backend:
- FastAPI application entry point
- Health router
- Model metrics router
- Prediction router
- Upload router
- Pydantic schemas
- Prediction service
- Upload service

ML:
- Dataset loading
- Dataset validation
- Preprocessing and scaling
- Logistic Regression and Random Forest training
- Model evaluation
- Prediction utilities
- Saved artifacts and reports

Artifacts:
- `model.pkl`
- `preprocessor.pkl`
- `feature_columns.json`
- `metrics.json`
- confusion matrix, ROC curve, precision-recall curve, and feature importance reports

## Current Constraints

- No authentication is enforced yet.
- No database persistence is connected yet.
- Audit logs and API keys are frontend UI only.
- Model reports are generated locally by the ML pipeline.
- Uploaded prediction results are returned directly to the frontend and are not stored.

## Planned v2 Architecture

The v2 architecture will add production-oriented controls:

- JWT authentication and role-based access control
- PostgreSQL persistence for users, transactions, predictions, and audit logs
- Backend-managed API keys
- Persisted upload history and result exports
- Production CORS and environment-based configuration
- Deployment for frontend and backend services
- PDF model reports
- SHAP-based model explainability

Planned v2 data flow:

```text
Authenticated Frontend
  -> FastAPI Backend
  -> Upload Validation
  -> ML Prediction Service
  -> PostgreSQL Persistence
  -> Audit Logging
  -> Frontend Results And Exports
```
