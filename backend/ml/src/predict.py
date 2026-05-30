"""Prediction utilities for saved FraudShield AI model artifacts."""

import json

import joblib
import pandas as pd

try:
    from .config import (
        DEFAULT_THRESHOLD,
        FEATURE_COLUMNS,
        METRICS_PATH,
        MODEL_PATH,
        PREPROCESSOR_PATH,
    )
except ImportError:
    from config import (
        DEFAULT_THRESHOLD,
        FEATURE_COLUMNS,
        METRICS_PATH,
        MODEL_PATH,
        PREPROCESSOR_PATH,
    )


def load_artifacts(model_path=MODEL_PATH, preprocessor_path=PREPROCESSOR_PATH):
    """Load saved model and preprocessor artifacts."""
    if not model_path.exists():
        raise FileNotFoundError(f"Model artifact not found: {model_path}")
    if not preprocessor_path.exists():
        raise FileNotFoundError(f"Preprocessor artifact not found: {preprocessor_path}")

    return joblib.load(model_path), joblib.load(preprocessor_path)


def load_selected_threshold(metrics_path=METRICS_PATH):
    """Load the selected fraud threshold from saved metrics."""
    if not metrics_path.exists():
        return DEFAULT_THRESHOLD

    with metrics_path.open("r", encoding="utf-8") as metrics_file:
        metrics = json.load(metrics_file)

    return float(metrics.get("selected_threshold", DEFAULT_THRESHOLD))


def predict_fraud(df, threshold=None, model=None, preprocessor=None):
    """Predict fraud risk for dataframe rows."""
    if not isinstance(df, pd.DataFrame):
        raise TypeError("predict_fraud expects a pandas DataFrame.")

    missing_columns = [column for column in FEATURE_COLUMNS if column not in df.columns]
    if missing_columns:
        missing = ", ".join(missing_columns)
        raise ValueError(f"Missing required feature columns: {missing}")

    if model is None or preprocessor is None:
        model, preprocessor = load_artifacts()

    if threshold is None:
        threshold = load_selected_threshold()

    features = df[FEATURE_COLUMNS]
    processed_features = preprocessor.transform(features)
    probabilities = model.predict_proba(processed_features)[:, 1]
    predictions = (probabilities >= threshold).astype(int)

    results = []
    for prediction, probability in zip(predictions, probabilities):
        risk_level = get_risk_level(float(probability))
        results.append(
            {
                "prediction": "fraud" if int(prediction) == 1 else "legitimate",
                "fraud_probability": float(probability),
                "risk_level": risk_level,
                "recommended_action": get_recommended_action(risk_level),
            }
        )

    return results


def get_risk_level(probability):
    """Map fraud probability to product risk levels."""
    if probability <= 0.30:
        return "Low"
    if probability <= 0.70:
        return "Medium"
    return "High"


def get_recommended_action(risk_level):
    """Return a product action recommendation for a risk level."""
    recommendations = {
        "Low": "Approve and monitor normally.",
        "Medium": "Review transaction context before approval.",
        "High": "Block or escalate for fraud analyst review.",
    }
    return recommendations[risk_level]
