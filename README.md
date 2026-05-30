# FraudShield AI - Secure Credit Card Fraud Detection Platform

FraudShield AI is a full-stack machine learning fraud detection platform for reviewing credit card transaction risk. It combines a React frontend, FastAPI backend, and Scikit-learn ML pipeline to support CSV, TXT, and ZIP uploads, real-time fraud probability, risk scoring, model insights, and downloadable prediction results.

The current version is a local v1 full-stack demo focused on the complete fraud prediction workflow. Authentication, persistence, and deployment hardening are planned for v2.

## Features

- Interactive fraud monitoring dashboard
- Transaction upload flow for CSV, TXT, and ZIP files containing CSV data
- Fraud prediction with probability scores and recommended actions
- Risk levels: Low, Medium, and High
- Transaction monitoring UI with filters, sorting, and review actions
- Analytics page with fraud trend and risk distribution charts
- Model insights page connected to backend metrics
- Audit logs UI for sensitive event visibility
- Settings and API keys UI
- CSV results download from prediction results

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
- Joblib
- Matplotlib

## Project Structure

```text
fraudshield-ai/
  frontend/   React + Vite frontend dashboard
  backend/    FastAPI backend and API services
  ml/         ML training, evaluation, prediction, and artifacts
  docs/       Architecture and project documentation
```

## Dataset

The ML pipeline expects a Kaggle-style Credit Card Fraud Detection dataset.

Required columns:

```text
Time, V1 to V28, Amount, Class
```

Place the dataset locally at:

```text
ml/data/creditcard.csv
```

Do not commit large dataset files to GitHub. Keep raw datasets local or use external storage.

## Run ML Training

```bash
cd ml
pip install -r requirements.txt
python -m src.train
```

Training outputs are saved under `ml/artifacts` and `ml/reports`.

## Run Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Backend URLs:

- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- `http://localhost:5173`

By default, the frontend calls the backend at `http://127.0.0.1:8000`. You can override this with `VITE_API_BASE_URL`.

## API Endpoints

- `GET /health`
- `GET /model/metrics`
- `POST /predict/single`
- `POST /predict/batch`
- `POST /upload/file`

## Security And Privacy Notes

- The app design does not store raw card numbers, CVV, or PIN data.
- Uploaded files are validated before prediction.
- Unsupported file types are rejected.
- ZIP uploads include path traversal protection.
- Password-protected ZIP files are rejected where detectable.
- Model artifacts are loaded locally from `ml/artifacts`.
- JWT authentication, role-based access, and persisted audit logging are planned for v2.

## Current Status

v1 full-stack demo complete:

- Frontend dashboard and core product pages
- ML training and prediction pipeline
- FastAPI health, model metrics, prediction, and upload APIs
- Frontend upload flow connected to backend predictions
- Model insights connected to backend metrics

Planned v2 work includes authentication, database persistence, deployment, and production security hardening.

## Future Improvements

- JWT authentication and role-based authorization
- PostgreSQL persistence for transactions, users, and audit logs
- API key backend validation
- Persisted audit logs
- PDF model reports
- Production deployment
- SHAP explainability for model decisions
