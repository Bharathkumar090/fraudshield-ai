"""Evaluation utilities for FraudShield AI models."""

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import (
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)


MAX_CURVE_POINTS = 500

try:
    from .config import (
        CONFUSION_MATRIX_REPORT_PATH,
        FEATURE_IMPORTANCE_REPORT_PATH,
        PRECISION_RECALL_CURVE_REPORT_PATH,
        REPORTS_DIR,
        ROC_CURVE_REPORT_PATH,
    )
except ImportError:
    from config import (
        CONFUSION_MATRIX_REPORT_PATH,
        FEATURE_IMPORTANCE_REPORT_PATH,
        PRECISION_RECALL_CURVE_REPORT_PATH,
        REPORTS_DIR,
        ROC_CURVE_REPORT_PATH,
    )


def evaluate_model(
    model,
    features,
    target,
    threshold=0.5,
    feature_names=None,
    save_reports=False,
    report_prefix=None,
):
    """Evaluate a trained fraud detection model and optionally save plots."""
    probabilities = _predict_probabilities(model, features)
    metrics = calculate_metrics_at_threshold(target, probabilities, threshold)
    metrics["probability_diagnostics"] = calculate_probability_diagnostics(probabilities)
    metrics["roc_curve_points"] = calculate_roc_curve_points(target, probabilities)
    metrics["precision_recall_curve_points"] = (
        calculate_precision_recall_curve_points(target, probabilities)
    )

    matrix = metrics["confusion_matrix"]

    if save_reports:
        REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        _save_confusion_matrix_plot(
            matrix["true_legitimate"],
            matrix["false_fraud_alert"],
            matrix["missed_fraud"],
            matrix["correct_fraud_detection"],
            _report_path(CONFUSION_MATRIX_REPORT_PATH, report_prefix),
        )
        _save_roc_curve_plot(target, probabilities, _report_path(ROC_CURVE_REPORT_PATH, report_prefix))
        _save_precision_recall_curve_plot(
            target,
            probabilities,
            _report_path(PRECISION_RECALL_CURVE_REPORT_PATH, report_prefix),
        )
        feature_importances = _get_feature_importances(model)
        if feature_importances is not None and feature_names is not None:
            _save_feature_importance_plot(
                feature_importances,
                feature_names,
                _report_path(FEATURE_IMPORTANCE_REPORT_PATH, report_prefix),
            )

    return metrics


def evaluate_thresholds(model, features, target, thresholds):
    """Evaluate one model across candidate fraud thresholds."""
    probabilities = _predict_probabilities(model, features)
    return [
        calculate_metrics_at_threshold(target, probabilities, threshold)
        for threshold in thresholds
    ]


def calculate_metrics_at_threshold(target, probabilities, threshold):
    """Calculate threshold-dependent and ranking metrics."""
    predictions = (probabilities >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(target, predictions, labels=[0, 1]).ravel()
    return {
        "threshold": float(threshold),
        "precision": float(precision_score(target, predictions, zero_division=0)),
        "recall": float(recall_score(target, predictions, zero_division=0)),
        "f1_score": float(f1_score(target, predictions, zero_division=0)),
        "roc_auc": float(roc_auc_score(target, probabilities)),
        "pr_auc": float(average_precision_score(target, probabilities)),
        "confusion_matrix": {
            "true_legitimate": int(tn),
            "false_fraud_alert": int(fp),
            "missed_fraud": int(fn),
            "correct_fraud_detection": int(tp),
        },
    }


def calculate_probability_diagnostics(probabilities):
    """Summarize fraud probability spread for diagnostics."""
    percentiles = np.percentile(probabilities, [1, 5, 10, 25, 50, 75, 90, 95, 99])
    return {
        "min_fraud_probability": float(np.min(probabilities)),
        "max_fraud_probability": float(np.max(probabilities)),
        "mean_fraud_probability": float(np.mean(probabilities)),
        "fraud_probability_percentiles": {
            "p01": float(percentiles[0]),
            "p05": float(percentiles[1]),
            "p10": float(percentiles[2]),
            "p25": float(percentiles[3]),
            "p50": float(percentiles[4]),
            "p75": float(percentiles[5]),
            "p90": float(percentiles[6]),
            "p95": float(percentiles[7]),
            "p99": float(percentiles[8]),
        },
    }


def calculate_roc_curve_points(target, probabilities, max_points=MAX_CURVE_POINTS):
    """Calculate frontend-friendly ROC curve points."""
    fpr_values, tpr_values, threshold_values = roc_curve(target, probabilities)
    points = [
        {
            "fpr": float(fpr),
            "tpr": float(tpr),
            "threshold": _safe_threshold(threshold),
        }
        for fpr, tpr, threshold in zip(fpr_values, tpr_values, threshold_values)
    ]
    return _downsample_points(points, max_points)


def calculate_precision_recall_curve_points(
    target,
    probabilities,
    max_points=MAX_CURVE_POINTS,
):
    """Calculate frontend-friendly precision-recall curve points."""
    precision_values, recall_values, threshold_values = precision_recall_curve(
        target,
        probabilities,
    )
    points = []
    for index, (precision, recall) in enumerate(zip(precision_values, recall_values)):
        threshold = (
            threshold_values[index]
            if index < len(threshold_values)
            else 1.0
        )
        points.append(
            {
                "recall": float(recall),
                "precision": float(precision),
                "threshold": _safe_threshold(threshold),
            }
        )

    return _downsample_points(points, max_points)


def _downsample_points(points, max_points):
    if len(points) <= max_points:
        return points

    selected_indexes = np.linspace(0, len(points) - 1, max_points, dtype=int)
    return [points[index] for index in selected_indexes]


def _safe_threshold(threshold):
    if np.isposinf(threshold):
        return 1.0
    if np.isneginf(threshold):
        return 0.0
    return float(threshold)


def _predict_probabilities(model, features):
    if not hasattr(model, "predict_proba"):
        raise ValueError("Model must support predict_proba for fraud risk scoring.")

    return model.predict_proba(features)[:, 1]


def _get_feature_importances(model):
    if hasattr(model, "feature_importances_"):
        return model.feature_importances_
    if hasattr(model, "named_steps"):
        for step in reversed(model.named_steps.values()):
            if hasattr(step, "feature_importances_"):
                return step.feature_importances_
    return None


def _report_path(default_path, prefix):
    if not prefix:
        return default_path
    return default_path.with_name(f"{prefix}_{default_path.name}")


def _save_confusion_matrix_plot(tn, fp, fn, tp, output_path):
    matrix = [[tn, fp], [fn, tp]]
    fig, ax = plt.subplots(figsize=(6, 5))
    image = ax.imshow(matrix, cmap="Blues")
    ax.set_xticks([0, 1], labels=["Pred Legit", "Pred Fraud"])
    ax.set_yticks([0, 1], labels=["Actual Legit", "Actual Fraud"])
    ax.set_title("Confusion Matrix")

    for row_index, row in enumerate(matrix):
        for column_index, value in enumerate(row):
            ax.text(column_index, row_index, f"{value:,}", ha="center", va="center")

    fig.colorbar(image, ax=ax, fraction=0.046, pad=0.04)
    fig.tight_layout()
    fig.savefig(output_path, dpi=160)
    plt.close(fig)


def _save_roc_curve_plot(target, probabilities, output_path):
    fpr, tpr, _ = roc_curve(target, probabilities)
    fig, ax = plt.subplots(figsize=(6, 5))
    ax.plot(fpr, tpr, color="#2563eb", linewidth=2)
    ax.plot([0, 1], [0, 1], color="#94a3b8", linestyle="--")
    ax.set_title("ROC Curve")
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.grid(alpha=0.25)
    fig.tight_layout()
    fig.savefig(output_path, dpi=160)
    plt.close(fig)


def _save_precision_recall_curve_plot(target, probabilities, output_path):
    precision, recall, _ = precision_recall_curve(target, probabilities)
    fig, ax = plt.subplots(figsize=(6, 5))
    ax.plot(recall, precision, color="#7c3aed", linewidth=2)
    ax.set_title("Precision-Recall Curve")
    ax.set_xlabel("Recall")
    ax.set_ylabel("Precision")
    ax.grid(alpha=0.25)
    fig.tight_layout()
    fig.savefig(output_path, dpi=160)
    plt.close(fig)


def _save_feature_importance_plot(feature_importances, feature_names, output_path):
    importance_frame = (
        pd.DataFrame(
            {"feature": list(feature_names), "importance": feature_importances}
        )
        .sort_values("importance", ascending=False)
        .head(15)
        .sort_values("importance", ascending=True)
    )

    fig, ax = plt.subplots(figsize=(7, 5))
    ax.barh(importance_frame["feature"], importance_frame["importance"], color="#2563eb")
    ax.set_title("Feature Importance")
    ax.set_xlabel("Importance")
    ax.grid(axis="x", alpha=0.25)
    fig.tight_layout()
    fig.savefig(output_path, dpi=160)
    plt.close(fig)
