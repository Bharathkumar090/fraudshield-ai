# FraudShield AI - Product Requirements Document

## 1. Project Overview

FraudShield AI is a secure, full-stack fraud detection platform that uses machine learning to identify suspicious credit card transactions. The system allows users to upload transaction data, run fraud predictions, review risk scores, analyze fraud trends, and manage prediction results through an interactive dashboard.

This is not a notebook-only ML project. It is a production-style application with a frontend dashboard, FastAPI backend, ML pipeline, secure file upload system, authentication, privacy controls, audit logging, and deployment readiness.

## 2. Product Goal

Build and deploy a secure fraud detection platform that can:

- Accept transaction data through CSV, TXT, or ZIP files containing CSV files.
- Validate uploaded transaction data.
- Predict whether transactions are legitimate or fraudulent.
- Show fraud probability and risk level.
- Provide dashboard analytics.
- Store prediction history.
- Protect APIs using authentication and authorization.
- Follow privacy-first handling of sensitive transaction data.

## 3. Target Users

### Admin
Can manage users, view all analytics, access model metrics, manage API keys, and view audit logs.

### Fraud Analyst
Can upload transaction data, review predictions, filter suspicious transactions, and export results.

### Viewer
Can view dashboard analytics and prediction summaries but cannot perform sensitive actions.

### API Client
Can access prediction APIs using API authentication.

## 4. Core Features

### Authentication
- User login.
- JWT-based authentication.
- Role-based access control.
- Secure password hashing.
- Protected dashboard routes.

### Upload System
Supported file types:
- CSV
- TXT
- ZIP containing one or more CSV files

Upload requirements:
- Drag-and-drop upload UI.
- File validation.
- Column validation.
- Upload status tracking.
- Processing progress states.
- Result summary after prediction.
- Downloadable prediction report.

### Fraud Prediction
The system should return:
- Prediction: legitimate or fraud.
- Fraud probability.
- Risk level: low, medium, or high.
- Recommended action.

Risk level rules:
- 0.00 to 0.30: Low Risk
- 0.31 to 0.70: Medium Risk
- 0.71 to 1.00: High Risk

### Dashboard
The dashboard should include:
- Total transactions.
- Fraud detected.
- High-risk transactions.
- Average risk score.
- Recent high-risk transactions.
- Fraud vs legitimate chart.
- Risk distribution chart.

### Transaction Monitoring
The transaction page should support:
- Search.
- Filter by risk level.
- Filter by prediction status.
- Sorting.
- Pagination.
- Transaction detail side drawer.
- Actions such as review, approve, block, and export.

### Analytics
The analytics page should include:
- Fraud trend over time.
- Fraud by amount range.
- Risk score distribution.
- Prediction confidence distribution.

### Model Insights
The model insights page should show:
- Current model name.
- Model version.
- Precision.
- Recall.
- F1-score.
- ROC-AUC.
- PR-AUC.
- Confusion matrix.
- Feature importance.
- Adjustable threshold slider.

### Audit Logs
The system should log:
- Login attempts.
- Upload actions.
- Prediction requests.
- Export actions.
- Admin changes.
- API key usage.

### Settings
Settings should include:
- Profile.
- Security.
- API keys.
- Notification preferences.
- Model threshold settings.

## 5. Frontend Requirements

Frontend stack:
- React
- Vite
- Tailwind CSS
- React Router
- Recharts
- Framer Motion
- Axios or Fetch service layer
- React Hot Toast
- Lucide Icons

Frontend design direction:
- Light fintech SaaS theme.
- Soft white background.
- Purple/blue accent colors.
- Rounded cards.
- Spacious layout.
- Minimal text density.
- Interactive charts.
- Clean upload experience.

Frontend pages:
- Landing page
- Login page
- Dashboard overview
- Upload transactions page
- Transactions page
- Analytics page
- Model insights page
- Audit logs page
- Settings page

## 6. Backend Requirements

Backend stack:
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic
- PostgreSQL for production
- SQLite allowed for early local development
- JWT authentication
- Password hashing
- Python multipart upload support

Backend endpoints should include:
- GET /health
- POST /auth/login
- POST /auth/register
- POST /auth/refresh
- POST /predict/single
- POST /predict/batch
- POST /upload/file
- GET /transactions
- GET /analytics/summary
- GET /model/metrics
- GET /audit-logs

## 7. ML Requirements

ML stack:
- Python
- Pandas
- NumPy
- Scikit-learn
- Imbalanced-learn
- Joblib
- Matplotlib
- Optional: XGBoost or LightGBM
- Optional: SHAP for explainability

Dataset mode:
- Primary training dataset should support Kaggle-style credit card fraud data.
- Required columns:
  - Time
  - V1 to V28
  - Amount
  - Class

Model training should include:
- Data validation.
- Missing value checks.
- Duplicate checks.
- Feature scaling.
- Train/test split.
- Imbalance handling.
- Logistic Regression baseline.
- Random Forest model.
- Optional XGBoost or LightGBM.
- Model comparison.
- Best model selection.

Evaluation metrics:
- Confusion matrix.
- Precision.
- Recall.
- F1-score.
- ROC-AUC.
- PR-AUC.

Saved artifacts:
- model.pkl
- preprocessor.pkl
- feature_columns.json
- metrics.json

## 8. Privacy and Security Requirements

The system must:
- Never store raw passwords.
- Hash passwords using bcrypt or Argon2.
- Avoid storing full card numbers, CVV, or PIN.
- Mask sensitive card data where applicable.
- Use environment variables for secrets.
- Restrict CORS in production.
- Protect APIs using JWT and role-based access.
- Add API key support for external clients.
- Validate all file uploads.
- Reject unsafe ZIP files.
- Prevent ZIP path traversal.
- Log sensitive actions in audit logs.
- Avoid exposing sensitive information in errors.

## 9. Deployment Requirements

Frontend deployment:
- Vercel preferred.

Backend deployment:
- Render, Railway, or Fly.io.

Database:
- Neon PostgreSQL or Supabase PostgreSQL.

Deployment should include:
- Environment variables.
- Production CORS settings.
- Secure secrets.
- Live frontend URL.
- Live backend API URL.
- GitHub repository.
- README setup guide.

## 10. Development Strategy

The project must be built step by step.

Development order:
1. Project structure.
2. Frontend UI with mock data.
3. Frontend interactivity.
4. ML pipeline.
5. FastAPI backend.
6. Upload processing.
7. Authentication and role-based access.
8. Database integration.
9. Frontend-backend connection.
10. Deployment.

Do not build all features at once.
Each step should be reviewable and testable before moving to the next.