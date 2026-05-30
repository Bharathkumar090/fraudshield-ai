# FraudShield AI - Project Rules

## 1. Development Style

Build this project step by step. Do not generate the entire application at once.

Each change should be:
- Small
- Reviewable
- Modular
- Easy to test
- Consistent with the project architecture

Avoid large uncontrolled rewrites.

## 2. Architecture Rules

The project must keep these layers separate:

- Frontend UI
- Backend API
- Machine learning pipeline
- Database models
- Authentication and security
- Deployment configuration
- Documentation

Do not mix frontend logic with backend logic.
Do not place ML training code inside API route files.
Do not place database queries directly inside frontend code.
Do not hardcode secrets or credentials.

## 3. Frontend Rules

Frontend stack:
- React
- Vite
- Tailwind CSS
- React Router
- Recharts
- Lucide Icons
- Framer Motion
- React Hot Toast

Frontend design:
- Light fintech SaaS theme
- Soft white background
- Purple/blue accent color
- Rounded cards
- Spacious layout
- Minimal text density
- Clean typography
- Interactive but not cluttered

Frontend code rules:
- Use reusable components.
- Keep pages clean.
- Move repeated UI into components.
- Use mock data until backend is ready.
- Use a service layer for API calls.
- Do not directly call backend APIs inside deeply nested components.
- Add loading, empty, success, and error states where needed.

Required frontend folders:
- src/components
- src/pages
- src/services
- src/routes
- src/data

## 4. Backend Rules

Backend stack:
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic
- PostgreSQL for production
- SQLite allowed for early local development

Backend code rules:
- Use routers for API endpoints.
- Use schemas for request and response validation.
- Use services for business logic.
- Use database models separately from schemas.
- Use environment variables for settings.
- Add clear error handling.
- Do not expose internal stack traces to users.
- Do not hardcode secrets.

Required backend folders:
- app/api
- app/core
- app/schemas
- app/services
- app/database

## 5. ML Rules

ML code must stay inside the ml folder.

Required ML folders:
- ml/src
- ml/data
- ml/artifacts
- ml/reports
- ml/notebooks

ML pipeline must include:
- Data loading
- Data validation
- Preprocessing
- Training
- Evaluation
- Prediction
- Artifact saving

Required artifacts:
- model.pkl
- preprocessor.pkl
- feature_columns.json
- metrics.json

Model evaluation must include:
- Precision
- Recall
- F1-score
- ROC-AUC
- PR-AUC
- Confusion matrix

Do not use accuracy as the main success metric.
For fraud detection, recall and PR-AUC are more important than plain accuracy.

## 6. Security Rules

Security must be considered from the beginning.

The system must:
- Hash passwords.
- Never store raw passwords.
- Avoid storing full card numbers, CVV, or PIN.
- Mask sensitive transaction fields.
- Use JWT for protected APIs.
- Use role-based access control.
- Use API keys for external clients later.
- Validate all uploaded files.
- Reject unsafe ZIP files.
- Prevent ZIP path traversal.
- Store secrets in environment variables.
- Add audit logs for sensitive actions.

## 7. Upload Rules

Supported uploads:
- CSV
- TXT
- ZIP containing CSV files

Upload system must:
- Validate file extension.
- Validate file size.
- Validate required columns.
- Return clear validation errors.
- Track upload state.
- Support partial success where possible.
- Reject unsupported files.
- Reject password-protected ZIP files.
- Reject suspicious ZIP paths.
- Only process CSV files inside ZIP files.

## 8. Coding Quality Rules

Code should be:
- Readable
- Modular
- Typed where useful
- Easy to debug
- Easy to extend

Avoid:
- Huge single files
- Repeated code
- Hardcoded data in production paths
- Unclear variable names
- Unused files
- Dead code
- Overengineering too early

## 9. Git Rules

Use small commits.

Recommended commit order:
1. Initial project structure
2. PRD and project rules
3. Frontend setup
4. Frontend layout
5. Frontend interactivity
6. ML pipeline
7. Backend setup
8. Backend prediction APIs
9. Upload system
10. Authentication
11. Database integration
12. Frontend-backend connection
13. Deployment

## 10. Codex Rules

When using Codex:
- Give one task at a time.
- Do not ask Codex to build the whole app in one prompt.
- Review generated files after every task.
- Run the app or tests after major changes.
- Fix errors before moving to the next feature.
- Keep PRD.md and PROJECT_RULES.md as guiding files.
- Ask Codex to follow these files before making changes.