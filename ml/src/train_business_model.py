"""Train the business-style transaction fraud model."""

import json

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

try:
    from .business_preprocess import fit_business_preprocessor
    from .config import (
        ARTIFACTS_DIR,
        BUSINESS_DATASET_PATH,
        BUSINESS_FEATURE_COLUMNS,
        BUSINESS_FEATURE_COLUMNS_PATH,
        BUSINESS_METRICS_PATH,
        BUSINESS_MODEL_PATH,
        BUSINESS_PREPROCESSOR_PATH,
        BUSINESS_REQUIRED_COLUMNS,
        BUSINESS_TARGET_COLUMN,
        CANDIDATE_THRESHOLDS,
        RANDOM_STATE,
        TEST_SIZE,
    )
    from .evaluate import evaluate_model, evaluate_thresholds
except ImportError:
    from business_preprocess import fit_business_preprocessor
    from config import (
        ARTIFACTS_DIR,
        BUSINESS_DATASET_PATH,
        BUSINESS_FEATURE_COLUMNS,
        BUSINESS_FEATURE_COLUMNS_PATH,
        BUSINESS_METRICS_PATH,
        BUSINESS_MODEL_PATH,
        BUSINESS_PREPROCESSOR_PATH,
        BUSINESS_REQUIRED_COLUMNS,
        BUSINESS_TARGET_COLUMN,
        CANDIDATE_THRESHOLDS,
        RANDOM_STATE,
        TEST_SIZE,
    )
    from evaluate import evaluate_model, evaluate_thresholds


def load_business_dataset(dataset_path=BUSINESS_DATASET_PATH) -> pd.DataFrame:
    """Load and validate the generated business transaction dataset."""
    if not dataset_path.exists():
        raise FileNotFoundError(
            f"Business dataset not found at {dataset_path}. "
            "Run python -m src.generate_business_data first."
        )

    frame = pd.read_csv(dataset_path)
    missing_columns = [
        column for column in BUSINESS_REQUIRED_COLUMNS if column not in frame.columns
    ]
    if missing_columns:
        missing = ", ".join(missing_columns)
        raise ValueError(f"Business dataset is missing required columns: {missing}")

    frame = frame[BUSINESS_REQUIRED_COLUMNS].copy()
    frame[BUSINESS_TARGET_COLUMN] = frame[BUSINESS_TARGET_COLUMN].map(_normalize_target)
    if frame[BUSINESS_TARGET_COLUMN].isna().any():
        raise ValueError("Business dataset target column must contain binary labels.")

    return frame.dropna(subset=BUSINESS_FEATURE_COLUMNS)


def build_business_models() -> dict[str, object]:
    """Create business fraud candidate models."""
    return {
        "business_logistic_regression": LogisticRegression(
            class_weight="balanced",
            max_iter=1000,
            random_state=RANDOM_STATE,
        ),
        "business_random_forest": RandomForestClassifier(
            n_estimators=140,
            class_weight="balanced",
            random_state=RANDOM_STATE,
            n_jobs=1,
            max_depth=None,
        ),
    }


def train_business_models(dataset_path=BUSINESS_DATASET_PATH) -> dict:
    """Train and save the best business transaction fraud model."""
    frame = load_business_dataset(dataset_path)
    features = frame[BUSINESS_FEATURE_COLUMNS]
    target = frame[BUSINESS_TARGET_COLUMN].astype(int)

    x_train, x_test, y_train, y_test = train_test_split(
        features,
        target,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=target,
    )

    preprocessor = fit_business_preprocessor(x_train)
    x_train_processed = preprocessor.transform(x_train)
    x_test_processed = preprocessor.transform(x_test)

    results = []
    for model_name, model in build_business_models().items():
        print(f"Training {model_name}...")
        model.fit(x_train_processed, y_train)
        threshold_metrics = evaluate_thresholds(
            model,
            x_test_processed,
            y_test,
            CANDIDATE_THRESHOLDS,
        )
        selected_threshold_metrics = _select_best_threshold(threshold_metrics)
        metrics = evaluate_model(
            model,
            x_test_processed,
            y_test,
            threshold=selected_threshold_metrics["threshold"],
            feature_names=x_train_processed.columns,
        )
        metrics["selected_threshold"] = selected_threshold_metrics["threshold"]
        metrics["threshold_metrics"] = threshold_metrics
        results.append(
            {
                "name": model_name,
                "model": model,
                "metrics": metrics,
                "selected_threshold_metrics": selected_threshold_metrics,
            }
        )

    best = _select_best_model(results)
    selected_threshold = best["selected_threshold_metrics"]["threshold"]
    print(f"Best business model: {best['name']} at threshold {selected_threshold:.2f}")

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(best["model"], BUSINESS_MODEL_PATH)
    joblib.dump(preprocessor, BUSINESS_PREPROCESSOR_PATH)

    with BUSINESS_FEATURE_COLUMNS_PATH.open("w", encoding="utf-8") as feature_file:
        json.dump(list(BUSINESS_FEATURE_COLUMNS), feature_file, indent=2)

    report_metrics = evaluate_model(
        best["model"],
        x_test_processed,
        y_test,
        threshold=selected_threshold,
        feature_names=x_train_processed.columns,
        save_reports=True,
        report_prefix="business",
    )

    final_metrics = {
        "best_model": best["name"],
        "selected_threshold": selected_threshold,
        "selection_metric": "recall_then_pr_auc_then_f1_score",
        "dataset_path": str(dataset_path),
        "feature_columns": list(BUSINESS_FEATURE_COLUMNS),
        "transformed_feature_columns": list(preprocessor.output_feature_columns),
        **report_metrics["probability_diagnostics"],
        "roc_curve_points": report_metrics.get("roc_curve_points", []),
        "precision_recall_curve_points": report_metrics.get(
            "precision_recall_curve_points",
            [],
        ),
        "models": {result["name"]: result["metrics"] for result in results},
    }

    with BUSINESS_METRICS_PATH.open("w", encoding="utf-8") as metrics_file:
        json.dump(final_metrics, metrics_file, indent=2)

    return final_metrics


def _select_best_model(results: list[dict]) -> dict:
    return max(
        results,
        key=lambda result: (
            result["selected_threshold_metrics"]["recall"],
            result["selected_threshold_metrics"]["pr_auc"],
            result["selected_threshold_metrics"]["f1_score"],
        ),
    )


def _select_best_threshold(threshold_metrics: list[dict]) -> dict:
    return max(
        threshold_metrics,
        key=lambda metrics: (
            metrics["recall"],
            metrics["pr_auc"],
            metrics["f1_score"],
        ),
    )


def _normalize_target(value):
    if pd.isna(value):
        return None

    normalized = str(value).strip().lower()
    fraud_values = {"1", "1.0", "true", "fraud", "fraudulent", "yes"}
    legitimate_values = {"0", "0.0", "false", "legitimate", "normal", "no"}
    if normalized in fraud_values:
        return 1
    if normalized in legitimate_values:
        return 0
    return None


def main() -> None:
    """Run business model training."""
    metrics = train_business_models()
    print("Business model training complete.")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
