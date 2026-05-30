"""Configuration values for the FraudShield AI ML pipeline."""

from pathlib import Path


ML_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ML_ROOT / "data"
ARTIFACTS_DIR = ML_ROOT / "artifacts"
REPORTS_DIR = ML_ROOT / "reports"

DATASET_PATH = DATA_DIR / "creditcard.csv"
BUSINESS_DATASET_PATH = DATA_DIR / "business_transactions.csv"
MODEL_PATH = ARTIFACTS_DIR / "model.pkl"
PREPROCESSOR_PATH = ARTIFACTS_DIR / "preprocessor.pkl"
FEATURE_COLUMNS_PATH = ARTIFACTS_DIR / "feature_columns.json"
METRICS_PATH = ARTIFACTS_DIR / "metrics.json"
BUSINESS_MODEL_PATH = ARTIFACTS_DIR / "business_model.pkl"
BUSINESS_PREPROCESSOR_PATH = ARTIFACTS_DIR / "business_preprocessor.pkl"
BUSINESS_FEATURE_COLUMNS_PATH = ARTIFACTS_DIR / "business_feature_columns.json"
BUSINESS_METRICS_PATH = ARTIFACTS_DIR / "business_metrics.json"

CONFUSION_MATRIX_REPORT_PATH = REPORTS_DIR / "confusion_matrix.png"
ROC_CURVE_REPORT_PATH = REPORTS_DIR / "roc_curve.png"
PRECISION_RECALL_CURVE_REPORT_PATH = REPORTS_DIR / "precision_recall_curve.png"
FEATURE_IMPORTANCE_REPORT_PATH = REPORTS_DIR / "feature_importance.png"

TARGET_COLUMN = "Class"
FEATURE_COLUMNS = ["Time", *[f"V{index}" for index in range(1, 29)], "Amount"]
REQUIRED_COLUMNS = [*FEATURE_COLUMNS, TARGET_COLUMN]

BUSINESS_TARGET_COLUMN = "class"
BUSINESS_FEATURE_COLUMNS = [
    "amount",
    "merchant_category",
    "is_international",
    "hour",
    "device_risk_score",
    "customer_history_risk",
    "failed_attempts",
]
BUSINESS_NUMERIC_COLUMNS = [
    "amount",
    "is_international",
    "hour",
    "device_risk_score",
    "customer_history_risk",
    "failed_attempts",
]
BUSINESS_CATEGORICAL_COLUMNS = ["merchant_category"]
BUSINESS_REQUIRED_COLUMNS = [*BUSINESS_FEATURE_COLUMNS, BUSINESS_TARGET_COLUMN]

RANDOM_STATE = 42
TEST_SIZE = 0.2
DEFAULT_THRESHOLD = 0.5
CANDIDATE_THRESHOLDS = [0.10, 0.20, 0.30, 0.40, 0.50]
