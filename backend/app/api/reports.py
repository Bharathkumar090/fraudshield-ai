"""Model report download API routes."""

from pathlib import Path

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse


router = APIRouter(prefix="/reports", tags=["Reports"])

BACKEND_ROOT = Path(__file__).resolve().parents[2]
PROJECT_ROOT = Path(__file__).resolve().parents[3]
PROJECT_ML_ROOT = PROJECT_ROOT / "ml"
BACKEND_ML_ROOT = BACKEND_ROOT / "ml"
ML_REPORTS_DIR = (
    PROJECT_ML_ROOT / "reports"
    if (PROJECT_ML_ROOT / "reports").exists()
    else BACKEND_ML_ROOT / "reports"
)
ML_ARTIFACTS_DIR = (
    PROJECT_ML_ROOT / "artifacts"
    if (PROJECT_ML_ROOT / "artifacts").exists()
    else BACKEND_ML_ROOT / "artifacts"
)
MISSING_REPORT_DETAIL = "Report file is unavailable. Please train the model first."


REPORT_FILES = {
    "confusion-matrix": {
        "path": ML_REPORTS_DIR / "confusion_matrix.png",
        "filename": "confusion_matrix.png",
        "media_type": "image/png",
    },
    "roc-curve": {
        "path": ML_REPORTS_DIR / "roc_curve.png",
        "filename": "roc_curve.png",
        "media_type": "image/png",
    },
    "precision-recall-curve": {
        "path": ML_REPORTS_DIR / "precision_recall_curve.png",
        "filename": "precision_recall_curve.png",
        "media_type": "image/png",
    },
    "feature-importance": {
        "path": ML_REPORTS_DIR / "feature_importance.png",
        "filename": "feature_importance.png",
        "media_type": "image/png",
    },
    "metrics": {
        "path": ML_ARTIFACTS_DIR / "metrics.json",
        "filename": "metrics.json",
        "media_type": "application/json",
    },
}


@router.get("/confusion-matrix")
def download_confusion_matrix() -> FileResponse:
    """Download the confusion matrix report image."""
    return _download_report("confusion-matrix")


@router.get("/roc-curve")
def download_roc_curve() -> FileResponse:
    """Download the ROC curve report image."""
    return _download_report("roc-curve")


@router.get("/precision-recall-curve")
def download_precision_recall_curve() -> FileResponse:
    """Download the precision-recall curve report image."""
    return _download_report("precision-recall-curve")


@router.get("/feature-importance")
def download_feature_importance() -> FileResponse:
    """Download the feature importance report image."""
    return _download_report("feature-importance")


@router.get("/metrics")
def download_metrics() -> FileResponse:
    """Download the saved metrics JSON artifact."""
    return _download_report("metrics")


def _download_report(report_key: str) -> FileResponse:
    report = REPORT_FILES[report_key]
    report_path = report["path"]
    if not report_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MISSING_REPORT_DETAIL,
        )

    return FileResponse(
        path=report_path,
        filename=report["filename"],
        media_type=report["media_type"],
    )
