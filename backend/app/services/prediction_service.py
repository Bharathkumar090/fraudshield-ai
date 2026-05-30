"""Prediction service for loading ML artifacts and scoring transactions."""

import json
import sys
from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
import pandas as pd
from fastapi import HTTPException, status


BACKEND_ROOT = Path(__file__).resolve().parents[2]
PROJECT_ROOT = Path(__file__).resolve().parents[3]
PROJECT_ML_ROOT = PROJECT_ROOT / "ml"
BACKEND_ML_ROOT = BACKEND_ROOT / "ml"
ML_ROOT = PROJECT_ML_ROOT if PROJECT_ML_ROOT.exists() else BACKEND_ML_ROOT
ARTIFACTS_DIR = (
    PROJECT_ML_ROOT / "artifacts"
    if (PROJECT_ML_ROOT / "artifacts").exists()
    else BACKEND_ML_ROOT / "artifacts"
)
MODEL_PATH = ARTIFACTS_DIR / "model.pkl"
PREPROCESSOR_PATH = ARTIFACTS_DIR / "preprocessor.pkl"
FEATURE_COLUMNS_PATH = ARTIFACTS_DIR / "feature_columns.json"
METRICS_PATH = ARTIFACTS_DIR / "metrics.json"
BUSINESS_MODEL_PATH = ARTIFACTS_DIR / "business_model.pkl"
BUSINESS_PREPROCESSOR_PATH = ARTIFACTS_DIR / "business_preprocessor.pkl"
BUSINESS_FEATURE_COLUMNS_PATH = ARTIFACTS_DIR / "business_feature_columns.json"
BUSINESS_METRICS_PATH = ARTIFACTS_DIR / "business_metrics.json"
DEFAULT_THRESHOLD = 0.5


def _ensure_ml_import_path() -> None:
    """Allow joblib to import classes pickled from the ml/src package."""
    ml_path = str(ML_ROOT)
    if ml_path not in sys.path:
        sys.path.insert(0, ml_path)


@lru_cache(maxsize=1)
def load_prediction_artifacts():
    """Load model, preprocessor, and feature column artifacts."""
    _ensure_ml_import_path()

    missing_paths = [
        path
        for path in (MODEL_PATH, PREPROCESSOR_PATH, FEATURE_COLUMNS_PATH)
        if not path.exists()
    ]
    if missing_paths:
        missing = ", ".join(path.name for path in missing_paths)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Prediction artifacts are missing from ml/artifacts: {missing}",
        )

    model = joblib.load(MODEL_PATH)
    preprocessor = joblib.load(PREPROCESSOR_PATH)
    with FEATURE_COLUMNS_PATH.open("r", encoding="utf-8") as feature_file:
        feature_columns = json.load(feature_file)

    return model, preprocessor, feature_columns


def load_model_metrics() -> dict[str, Any]:
    """Load saved model metrics."""
    if not METRICS_PATH.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model metrics file not found at ml/artifacts/metrics.json",
        )

    with METRICS_PATH.open("r", encoding="utf-8") as metrics_file:
        return json.load(metrics_file)


def load_business_model_metrics() -> dict[str, Any]:
    """Load saved business model metrics."""
    if not BUSINESS_METRICS_PATH.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business model metrics file not found at ml/artifacts/business_metrics.json",
        )

    with BUSINESS_METRICS_PATH.open("r", encoding="utf-8") as metrics_file:
        return json.load(metrics_file)


def load_best_kaggle_model_name() -> str | None:
    """Return the selected Kaggle model name when metrics are available."""
    if not METRICS_PATH.exists():
        return None

    with METRICS_PATH.open("r", encoding="utf-8") as metrics_file:
        metrics = json.load(metrics_file)

    best_model = metrics.get("best_model")
    if not best_model:
        return None
    return best_model if best_model.startswith("kaggle_") else f"kaggle_{best_model}"


def load_best_business_model_name() -> str | None:
    """Return the selected business model name when metrics are available."""
    if not BUSINESS_METRICS_PATH.exists():
        return None

    with BUSINESS_METRICS_PATH.open("r", encoding="utf-8") as metrics_file:
        metrics = json.load(metrics_file)

    return metrics.get("best_model")


def business_prediction_artifacts_available() -> bool:
    """Return whether the business transaction model artifacts are ready."""
    return all(
        path.exists()
        for path in (
            BUSINESS_MODEL_PATH,
            BUSINESS_PREPROCESSOR_PATH,
            BUSINESS_FEATURE_COLUMNS_PATH,
        )
    )


@lru_cache(maxsize=1)
def load_selected_threshold() -> float:
    """Load the selected fraud threshold, falling back to 0.50."""
    if not METRICS_PATH.exists():
        return DEFAULT_THRESHOLD

    with METRICS_PATH.open("r", encoding="utf-8") as metrics_file:
        metrics = json.load(metrics_file)

    return float(metrics.get("selected_threshold", DEFAULT_THRESHOLD))


@lru_cache(maxsize=1)
def load_selected_business_threshold() -> float:
    """Load the selected business fraud threshold, falling back to 0.50."""
    if not BUSINESS_METRICS_PATH.exists():
        return DEFAULT_THRESHOLD

    with BUSINESS_METRICS_PATH.open("r", encoding="utf-8") as metrics_file:
        metrics = json.load(metrics_file)

    return float(metrics.get("selected_threshold", DEFAULT_THRESHOLD))


@lru_cache(maxsize=1)
def load_business_prediction_artifacts():
    """Load business model, preprocessor, and raw feature column artifacts."""
    _ensure_ml_import_path()

    missing_paths = [
        path
        for path in (
            BUSINESS_MODEL_PATH,
            BUSINESS_PREPROCESSOR_PATH,
            BUSINESS_FEATURE_COLUMNS_PATH,
        )
        if not path.exists()
    ]
    if missing_paths:
        missing = ", ".join(path.name for path in missing_paths)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Business prediction artifacts are missing from ml/artifacts: {missing}",
        )

    model = joblib.load(BUSINESS_MODEL_PATH)
    preprocessor = joblib.load(BUSINESS_PREPROCESSOR_PATH)
    with BUSINESS_FEATURE_COLUMNS_PATH.open("r", encoding="utf-8") as feature_file:
        feature_columns = json.load(feature_file)

    return model, preprocessor, feature_columns


def predict_single(transaction: dict[str, float]) -> dict[str, Any]:
    """Score one transaction."""
    return predict_batch([transaction])[0]


def predict_batch(
    transactions: list[dict[str, float]],
    threshold: float | None = None,
) -> list[dict[str, Any]]:
    """Score a batch of transactions."""
    if not transactions:
        return []

    model, preprocessor, feature_columns = load_prediction_artifacts()
    transaction_frame = pd.DataFrame(transactions)
    missing_columns = [
        column for column in feature_columns if column not in transaction_frame.columns
    ]
    if missing_columns:
        missing = ", ".join(missing_columns)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Missing required feature columns: {missing}",
        )

    features = transaction_frame[feature_columns]
    processed_features = preprocessor.transform(features)
    probabilities = model.predict_proba(processed_features)[:, 1]
    threshold = load_selected_threshold() if threshold is None else threshold

    return [
        build_prediction_result(float(probability), threshold)
        for probability in probabilities
    ]


def predict_business_batch(
    transactions: list[dict[str, Any]],
    threshold: float | None = None,
) -> list[dict[str, Any]]:
    """Score business-style transaction rows."""
    if not transactions:
        return []

    model, preprocessor, feature_columns = load_business_prediction_artifacts()
    transaction_frame = pd.DataFrame(transactions)
    missing_columns = [
        column for column in feature_columns if column not in transaction_frame.columns
    ]
    if missing_columns:
        missing = ", ".join(missing_columns)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Missing required business feature columns: {missing}",
        )

    features = transaction_frame[feature_columns]
    processed_features = preprocessor.transform(features)
    probabilities = model.predict_proba(processed_features)[:, 1]
    threshold = load_selected_business_threshold() if threshold is None else threshold

    return [
        build_prediction_result(float(probability), threshold)
        for probability in probabilities
    ]


def build_prediction_result(probability: float, threshold: float = DEFAULT_THRESHOLD) -> dict[str, Any]:
    """Build the public API response for one probability."""
    risk_level = get_risk_level(probability)
    return {
        "prediction": "Fraud" if probability >= threshold else "Legitimate",
        "fraud_probability": probability,
        "risk_level": risk_level,
        "recommended_action": get_recommended_action(risk_level),
    }


def get_risk_level(probability: float) -> str:
    """Map fraud probability to the product risk level."""
    if probability <= 0.30:
        return "Low"
    if probability <= 0.70:
        return "Medium"
    return "High"


def get_recommended_action(risk_level: str) -> str:
    """Map risk level to the public recommended action."""
    actions = {
        "Low": "Approve transaction",
        "Medium": "Review transaction",
        "High": "Block or verify transaction",
    }
    return actions[risk_level]
