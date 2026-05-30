"""Training entry point for FraudShield AI."""

import json

import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

try:
    from .config import (
        ARTIFACTS_DIR,
        CANDIDATE_THRESHOLDS,
        DATASET_PATH,
        FEATURE_COLUMNS_PATH,
        METRICS_PATH,
        MODEL_PATH,
        PREPROCESSOR_PATH,
        RANDOM_STATE,
    )
    from .evaluate import evaluate_model, evaluate_thresholds
    from .load_data import load_dataset
    from .preprocess import prepare_train_test_data
except ImportError:
    from config import (
        ARTIFACTS_DIR,
        CANDIDATE_THRESHOLDS,
        DATASET_PATH,
        FEATURE_COLUMNS_PATH,
        METRICS_PATH,
        MODEL_PATH,
        PREPROCESSOR_PATH,
        RANDOM_STATE,
    )
    from evaluate import evaluate_model, evaluate_thresholds
    from load_data import load_dataset
    from preprocess import prepare_train_test_data

try:
    from imblearn.over_sampling import SMOTE
    from imblearn.pipeline import Pipeline as ImbalancedPipeline
except ImportError:
    SMOTE = None
    ImbalancedPipeline = None


def build_models():
    """Create candidate fraud detection models."""
    random_forest_estimators = 80
    models = {
        "logistic_regression": LogisticRegression(
            class_weight="balanced",
            max_iter=1000,
            random_state=RANDOM_STATE,
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=random_forest_estimators,
            class_weight="balanced",
            random_state=RANDOM_STATE,
            n_jobs=1,
            max_depth=None,
        ),
    }

    if SMOTE is not None and ImbalancedPipeline is not None:
        models["random_forest_smote"] = ImbalancedPipeline(
            steps=[
                (
                    "smote",
                    SMOTE(
                        sampling_strategy=0.10,
                        random_state=RANDOM_STATE,
                        k_neighbors=3,
                    ),
                ),
                (
                    "classifier",
                    RandomForestClassifier(
                        n_estimators=random_forest_estimators,
                        class_weight="balanced",
                        random_state=RANDOM_STATE,
                        n_jobs=1,
                        max_depth=None,
                    ),
                ),
            ]
        )

    return models


def select_best_model(results):
    """Select best model and threshold by recall first, then PR-AUC and F1."""
    return max(
        results,
        key=lambda result: (
            result["selected_threshold_metrics"]["recall"],
            result["selected_threshold_metrics"]["pr_auc"],
            result["selected_threshold_metrics"]["f1_score"],
        ),
    )


def select_best_threshold(threshold_metrics):
    """Select threshold by recall first, then PR-AUC and F1."""
    return max(
        threshold_metrics,
        key=lambda metrics: (
            metrics["recall"],
            metrics["pr_auc"],
            metrics["f1_score"],
        ),
    )


def train_models(dataset_path=DATASET_PATH):
    """Train candidate models and save the best pipeline artifacts."""
    df = load_dataset(dataset_path)
    x_train, x_test, y_train, y_test, preprocessor = prepare_train_test_data(df)

    results = []
    for model_name, model in build_models().items():
        print(f"Training {model_name}...")
        model.fit(x_train, y_train)
        threshold_metrics = evaluate_thresholds(
            model,
            x_test,
            y_test,
            CANDIDATE_THRESHOLDS,
        )
        selected_threshold_metrics = select_best_threshold(threshold_metrics)
        metrics = evaluate_model(
            model,
            x_test,
            y_test,
            threshold=selected_threshold_metrics["threshold"],
            feature_names=x_train.columns,
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

    best = select_best_model(results)
    selected_threshold = best["selected_threshold_metrics"]["threshold"]
    print(f"Best model: {best['name']} at threshold {selected_threshold:.2f}")

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(best["model"], MODEL_PATH)
    joblib.dump(preprocessor, PREPROCESSOR_PATH)

    with FEATURE_COLUMNS_PATH.open("w", encoding="utf-8") as feature_file:
        json.dump(list(preprocessor.feature_columns), feature_file, indent=2)

    final_metrics = {
        "best_model": best["name"],
        "selected_threshold": selected_threshold,
        "selection_metric": "recall_then_pr_auc_then_f1_score",
        **best["metrics"]["probability_diagnostics"],
        "roc_curve_points": best["metrics"].get("roc_curve_points", []),
        "precision_recall_curve_points": best["metrics"].get(
            "precision_recall_curve_points",
            [],
        ),
        "models": {
            result["name"]: result["metrics"]
            for result in results
        },
    }

    evaluate_model(
        best["model"],
        x_test,
        y_test,
        threshold=selected_threshold,
        feature_names=x_train.columns,
        save_reports=True,
    )

    with METRICS_PATH.open("w", encoding="utf-8") as metrics_file:
        json.dump(final_metrics, metrics_file, indent=2)

    return final_metrics


def main():
    """Run model training from the configured dataset path."""
    metrics = train_models()
    print("Training complete.")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
