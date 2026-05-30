# FraudShield AI - Secure Credit Card Fraud Detection Platform

FraudShield AI is a full-stack machine learning fraud detection platform built with a React frontend, FastAPI backend, and Scikit-learn ML pipeline. It supports CSV, TXT, and ZIP transaction uploads, Kaggle-style and business-style schema detection, automatic model selection, fraud probability scoring, risk levels, upload evaluation, analytics, model insights, and downloadable reports.

## Features

- Interactive fraud monitoring dashboard
- CSV, TXT, and ZIP transaction upload
- Kaggle-style and business-style schema detection
- Automatic model selection based on uploaded schema
- Fraud probability scoring and risk classification
- Upload-specific evaluation with precision, recall, F1-score, and confusion matrix
- ROC Curve and Precision-Recall Curve in Model Insights
- Transaction monitoring and analytics from latest upload
- Downloadable prediction results and model reports
- Unsupported-schema handling with clear messages

## Tech Stack

Frontend:
- React
- Vite
- Tailwind CSS
- Recharts
- Axios

Backend:
- FastAPI
- Pydantic
- Pandas
- Uvicorn

ML:
- Python
- Pandas
- NumPy
- Scikit-learn
- Imbalanced-learn
- Joblib
- Matplotlib

## Project Structure

```text
frontend/
backend/
ml/
docs/
PRD.md
PROJECT_RULES.md
README.md
```

## Dataset And Artifacts Note

Large datasets and trained model artifacts are not committed to GitHub.

The Kaggle-style Credit Card Fraud Detection dataset should be placed at:

```text
ml/data/creditcard.csv
```

The business-style synthetic dataset can be generated with:

```bash
python -m src.generate_business_data
```

Generated model files, metrics, and reports are saved locally under `ml/artifacts/` and `ml/reports/`.

## Setup Instructions

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

ML:

```bash
cd ml
pip install -r requirements.txt
python -m src.train
python -m src.generate_business_data
python -m src.train_business_model
```

## API Endpoints

- `GET /health`
- `GET /model/metrics`
- `POST /predict/single`
- `POST /predict/batch`
- `POST /upload/file`
- `GET /reports/confusion-matrix`
- `GET /reports/roc-curve`
- `GET /reports/precision-recall-curve`
- `GET /reports/feature-importance`
- `GET /reports/metrics`

## Supported Schemas

Kaggle-style schema:

```text
Time, V1 to V28, Amount, Class optional
```

Business-style schema:

```text
amount, merchant_category, is_international, hour, device_risk_score,
customer_history_risk, failed_attempts, class optional
```

## Current Status

FraudShield AI v1 is a working full-stack ML demo with real upload, prediction, schema detection, model selection, analytics, model insights, and downloads.

## Security And Privacy Notes

- No raw card number storage in the current app design
- File type validation
- ZIP path traversal protection
- Unsupported file rejection
- Local model artifacts
- JWT authentication planned for v2

## Future Improvements

- JWT authentication
- PostgreSQL database
- Persistent transaction history
- Real audit log persistence
- API key backend validation
- Cloud deployment
- PDF model reports
- SHAP explainability
- Manual column mapping UI

## Screenshots

Screenshots can be added later under `docs/screenshots/`.
