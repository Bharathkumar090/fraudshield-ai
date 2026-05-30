# FraudShield AI Architecture

FraudShield AI is a modular full-stack fraud detection platform. The React frontend provides analyst workflows, the FastAPI backend handles upload validation and API orchestration, and the ML layer owns dataset preparation, model training, evaluation, and prediction artifacts.

## Current v1 Architecture

```text
React Frontend
  -> FastAPI Backend
  -> Upload Service
  -> Schema Detection
  -> Model Selection
  -> ML Prediction Service
  -> Response Payload
  -> Frontend Results, Analytics, and Downloads
```

Current v1 components:

- `frontend/`: React + Vite application with landing page, dashboard, upload flow, transactions, analytics, model insights, audit logs, and settings UI.
- `backend/`: FastAPI app with health, model metrics, prediction, upload, and report download endpoints.
- `ml/`: Scikit-learn pipelines for Kaggle-style and business-style fraud models, saved artifacts, metrics, and reports.
- `docs/`: Architecture and project documentation.

## Data Flow

```text
Frontend Upload -> Backend Upload API -> Schema Detection -> Model Selection -> ML Prediction Service -> Frontend Results
```

1. A user uploads a CSV, TXT, or ZIP file from the Upload Transactions page.
2. The frontend sends the file to `POST /upload/file` as `multipart/form-data`.
3. The backend validates file type, file size, and ZIP safety.
4. The upload service normalizes aliases and detects the transaction schema.
5. Schema detection selects one of three outcomes: Kaggle-style, business-style, or unsupported.
6. Model selection chooses the matching local model artifact when available.
7. The prediction service returns fraud probability, prediction label, risk level, and recommended action.
8. If labels are included, the backend calculates upload-specific precision, recall, F1-score, and confusion matrix.
9. The frontend displays upload summary, schema report, model selection, evaluation, prediction preview, analytics, and CSV download.

## Supported Schemas

Kaggle-style credit card schema:

```text
Time, V1 to V28, Amount, Class optional
```

This schema uses the Kaggle PCA-feature model.

Business-style transaction schema:

```text
amount, merchant_category, is_international, hour, device_risk_score,
customer_history_risk, failed_attempts, class optional
```

This schema uses the readable business transaction model.

Unsupported schemas return a clear validation response instead of crashing or running an incompatible model.

## Backend Components

- Health router: service status endpoint.
- Model router: global Kaggle model metrics.
- Prediction router: single and batch prediction APIs.
- Upload router: multipart upload API for CSV, TXT, and ZIP files.
- Reports router: downloadable ML report files.
- Upload service: file validation, schema detection, model selection, row validation, and upload evaluation.
- Prediction service: model artifact loading, threshold handling, and scoring.

## ML Components

- Kaggle pipeline: trains a model on `Time`, `V1` to `V28`, `Amount`, and `Class`.
- Business data generator: creates synthetic readable transaction data.
- Business pipeline: trains a separate model for business-style transaction fields.
- Evaluation utilities: precision, recall, F1-score, ROC-AUC, PR-AUC, confusion matrix, ROC curve points, and precision-recall curve points.
- Artifacts: local model, preprocessor, feature column, metrics, and report files.

## Current v1 Constraints

- Authentication is not implemented yet.
- Database persistence is not connected yet.
- Latest upload results are stored in frontend localStorage for v1.
- Audit logs and API key settings are UI-only in the current version.
- Model artifacts and reports are stored locally.
- Large datasets and trained artifacts are intentionally excluded from GitHub.

## Planned v2 Architecture

v2 will add production-oriented controls and persistence:

- JWT authentication and role-based access control
- PostgreSQL persistence for users, transactions, predictions, uploads, and audit logs
- Backend-validated API keys
- Persisted transaction history and export history
- Real audit log persistence for sensitive actions
- Manual column mapping UI for unsupported or custom schemas
- Cloud deployment for frontend and backend
- PDF model reports
- SHAP explainability for model decisions

Planned v2 flow:

```text
Authenticated Frontend
  -> FastAPI Backend
  -> Upload Validation
  -> Schema Detection And Column Mapping
  -> Model Selection
  -> ML Prediction Service
  -> PostgreSQL Persistence
  -> Audit Logging
  -> Frontend Results And Exports
```
