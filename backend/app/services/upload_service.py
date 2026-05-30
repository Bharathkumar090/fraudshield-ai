"""File upload processing service for transaction prediction."""

from __future__ import annotations

import io
import zipfile
from pathlib import PurePosixPath, PureWindowsPath
from typing import Any

import pandas as pd
from fastapi import HTTPException, status

from app.services.prediction_service import (
    business_prediction_artifacts_available,
    load_best_business_model_name,
    load_best_kaggle_model_name,
    load_selected_business_threshold,
    load_selected_threshold,
    predict_batch,
    predict_business_batch,
)


MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024
SUPPORTED_EXTENSIONS = {".csv", ".txt", ".zip"}
PCA_COLUMNS = [f"V{index}" for index in range(1, 29)]
REQUIRED_PREDICTION_COLUMNS = ["Time", *PCA_COLUMNS, "Amount"]
OPTIONAL_LABEL_COLUMN = "Class"
KAGGLE_PCA_SCHEMA_MESSAGE = (
    "This trained model requires V1 to V28 PCA feature columns. Please upload "
    "a Kaggle-style dataset or use a supported business-schema model when available."
)
BUSINESS_SCHEMA_MESSAGE = (
    "Business transaction schema detected. Prediction will be supported after "
    "the business transaction model is trained."
)
UNSUPPORTED_SCHEMA_MESSAGE = (
    "This file does not match a supported schema. Please upload a Kaggle-style "
    "dataset or a supported business transaction dataset."
)

KAGGLE_COLUMN_ALIASES = {
    "Time": ("time", "timestamp", "transaction_time", "txn_time", "seconds"),
    "Amount": ("amount", "transaction_amount", "txn_amount", "amount_inr", "value"),
    "Class": ("class", "label", "fraud_label", "is_fraud", "target"),
}
BUSINESS_REQUIRED_COLUMNS = [
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
BUSINESS_LABEL_COLUMN = "class"
BUSINESS_OPTIONAL_COLUMNS = [
    "transaction_id",
    "merchant",
    "location",
    "currency",
    "payment_channel",
    BUSINESS_LABEL_COLUMN,
]
BUSINESS_COLUMN_ALIASES = {
    "amount": ("amount", "transaction_amount", "txn_amount", "value", "amount_inr"),
    "merchant_category": ("merchant_category", "category", "mcc", "merchant_type"),
    "is_international": (
        "is_international",
        "international",
        "foreign_transaction",
    ),
    "hour": ("hour", "transaction_hour", "txn_hour"),
    "device_risk_score": ("device_risk_score", "device_risk", "device_score"),
    "customer_history_risk": (
        "customer_history_risk",
        "customer_risk",
        "history_risk",
    ),
    "failed_attempts": (
        "failed_attempts",
        "failed_login_attempts",
        "failed_txn_attempts",
    ),
    "class": ("class", "label", "fraud_label", "is_fraud", "target"),
}


def process_upload(
    filename: str,
    file_bytes: bytes,
    threshold: float | None = None,
) -> dict[str, Any]:
    """Validate an uploaded file and run fraud predictions when possible."""
    safe_filename = _safe_display_name(filename)
    _validate_upload_size(file_bytes)
    threshold_context = _resolve_threshold_context(threshold)

    extension = _get_extension(safe_filename)
    if extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Upload a CSV, TXT, or ZIP file.",
        )

    if extension == ".zip":
        summary = _process_zip_upload(file_bytes, threshold_context)
    else:
        summary = _empty_summary(threshold_context)
        _merge_file_result(
            summary,
            _process_table_file(
                file_bytes=file_bytes,
                source_file=safe_filename,
                extension=extension,
                threshold_context=threshold_context,
            ),
        )

    _finalize_summary(summary)
    return summary


def _process_zip_upload(
    file_bytes: bytes,
    threshold_context: dict[str, Any],
) -> dict[str, Any]:
    summary = _empty_summary(threshold_context)

    try:
        archive = zipfile.ZipFile(io.BytesIO(file_bytes))
    except zipfile.BadZipFile as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ZIP file.",
        ) from exc

    with archive:
        members = [member for member in archive.infolist() if not member.is_dir()]
        encrypted_members = [member.filename for member in members if member.flag_bits & 0x1]
        if encrypted_members:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password-protected ZIP files are not supported.",
            )

        csv_members = []
        for member in members:
            try:
                _validate_zip_member_path(member.filename)
            except ValueError as exc:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=str(exc),
                ) from exc

            if _get_extension(member.filename) == ".csv":
                csv_members.append(member)

        if not csv_members:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ZIP file must contain at least one CSV file.",
            )

        for member in csv_members:
            source_file = _safe_display_name(member.filename)
            if member.file_size > MAX_UPLOAD_SIZE_BYTES:
                summary["errors"].append(
                    f"{source_file}: CSV inside ZIP exceeds the 10 MB limit."
                )
                continue

            try:
                with archive.open(member) as member_file:
                    _merge_file_result(
                        summary,
                        _process_table_file(
                            file_bytes=member_file.read(),
                            source_file=source_file,
                            extension=".csv",
                            threshold_context=threshold_context,
                        ),
                    )
            except HTTPException as exc:
                summary["errors"].append(f"{source_file}: {exc.detail}")
            except (OSError, UnicodeDecodeError, pd.errors.ParserError):
                summary["errors"].append(
                    f"{source_file}: Could not read this CSV file."
                )

    return summary


def _process_table_file(
    file_bytes: bytes,
    source_file: str,
    extension: str,
    threshold_context: dict[str, Any],
) -> dict[str, Any]:
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    frame = _read_table_file(file_bytes, extension)
    total_rows = len(frame)
    if total_rows == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Uploaded file has headers but no transaction rows.",
        )

    normalized_frame, schema_report = _normalize_schema(frame)
    if not schema_report["can_predict"]:
        return {
            "files_processed": 1,
            "total_rows": total_rows,
            "valid_rows": 0,
            "invalid_rows": total_rows,
            "results": [],
            "errors": [f"{source_file}: {schema_report['message']}"],
            "schema_report": schema_report,
            "model_selection": _build_model_selection(schema_report, None),
            "uploaded_file_evaluation": None,
            **threshold_context,
            "actual_labels": [],
            "predicted_labels": [],
        }

    threshold_context = _threshold_context_for_schema(
        schema_report["detected_schema"],
        threshold_context,
    )
    valid_features = _prepare_features_for_schema(
        normalized_frame,
        schema_report["detected_schema"],
    )
    invalid_rows = total_rows - len(valid_features)

    if valid_features.empty:
        return {
            "files_processed": 1,
            "total_rows": total_rows,
            "valid_rows": 0,
            "invalid_rows": total_rows,
            "results": [],
            "errors": [f"{source_file}: No valid transaction rows found after validation."],
            "schema_report": schema_report,
            "model_selection": _build_model_selection(schema_report, threshold_context),
            "uploaded_file_evaluation": None,
            **threshold_context,
            "actual_labels": [],
            "predicted_labels": [],
        }

    predictions = _predict_for_schema(
        schema_report["detected_schema"],
        valid_features,
        threshold_context["threshold_used"],
    )
    results = [
        {
            "row_index": int(row_index),
            "source_file": source_file,
            **prediction,
        }
        for row_index, prediction in zip(valid_features.index, predictions)
    ]
    actual_labels = _extract_actual_labels(normalized_frame, valid_features.index)
    predicted_labels = [result["prediction"] for result in results]

    return {
        "files_processed": 1,
        "total_rows": total_rows,
        "valid_rows": len(valid_features),
        "invalid_rows": invalid_rows,
        "results": results,
        "errors": [],
        "schema_report": schema_report,
        "model_selection": _build_model_selection(schema_report, threshold_context),
        "uploaded_file_evaluation": _calculate_uploaded_file_evaluation(
            actual_labels,
            predicted_labels,
        ),
        **threshold_context,
        "actual_labels": actual_labels,
        "predicted_labels": predicted_labels,
    }


def _threshold_context_for_schema(
    detected_schema: str,
    threshold_context: dict[str, Any],
) -> dict[str, Any]:
    if (
        detected_schema == "business_transaction"
        and threshold_context["threshold_source"] == "default_model_threshold"
    ):
        return {
            "threshold_used": load_selected_business_threshold(),
            "threshold_source": "default_business_model_threshold",
        }

    return threshold_context


def _prepare_features_for_schema(
    frame: pd.DataFrame,
    detected_schema: str,
) -> pd.DataFrame:
    if detected_schema == "business_transaction":
        features = frame[BUSINESS_REQUIRED_COLUMNS].copy()
        numeric_features = features[BUSINESS_NUMERIC_COLUMNS].apply(
            pd.to_numeric,
            errors="coerce",
        )
        merchant_category = (
            features["merchant_category"]
            .fillna("")
            .astype(str)
            .str.strip()
        )
        valid_mask = numeric_features.notna().all(axis=1) & merchant_category.ne("")
        valid_features = features.loc[valid_mask].copy()
        valid_features[BUSINESS_NUMERIC_COLUMNS] = numeric_features.loc[valid_mask]
        valid_features["merchant_category"] = merchant_category.loc[valid_mask]
        return valid_features

    features = frame[REQUIRED_PREDICTION_COLUMNS].copy()
    numeric_features = features.apply(pd.to_numeric, errors="coerce")
    valid_mask = numeric_features.notna().all(axis=1)
    return numeric_features.loc[valid_mask]


def _predict_for_schema(
    detected_schema: str,
    valid_features: pd.DataFrame,
    threshold: float,
) -> list[dict[str, Any]]:
    if detected_schema == "business_transaction":
        return predict_business_batch(
            valid_features.to_dict(orient="records"),
            threshold=threshold,
        )

    return predict_batch(
        valid_features.to_dict(orient="records"),
        threshold=threshold,
    )


def _build_model_selection(
    schema_report: dict[str, Any],
    threshold_context: dict[str, Any] | None,
) -> dict[str, Any]:
    detected_schema = schema_report["detected_schema"]
    can_predict = schema_report["can_predict"]
    model_available = schema_report["model_available"]
    threshold_used = threshold_context["threshold_used"] if can_predict and threshold_context else None
    threshold_source = _model_selection_threshold_source(
        threshold_context["threshold_source"] if can_predict and threshold_context else None
    )

    if detected_schema == "kaggle_credit_card":
        selected_model = load_best_kaggle_model_name() if model_available else None
        return {
            "detected_schema": detected_schema,
            "selected_model": selected_model,
            "model_family": "kaggle_pca_model" if model_available else None,
            "model_available": model_available,
            "prediction_mode": "kaggle_features" if can_predict else "none",
            "threshold_used": threshold_used,
            "threshold_source": threshold_source,
            "message": (
                "Kaggle-style schema selected the PCA feature model because Time, "
                "V1 to V28, and Amount columns are available."
            ),
        }

    if detected_schema == "business_transaction":
        selected_model = load_best_business_model_name() if model_available else None
        return {
            "detected_schema": detected_schema,
            "selected_model": selected_model,
            "model_family": "business_transaction_model" if model_available else None,
            "model_available": model_available,
            "prediction_mode": "business_features" if can_predict else "none",
            "threshold_used": threshold_used,
            "threshold_source": threshold_source,
            "message": (
                "Business transaction schema selected the readable-fields model."
                if model_available
                else BUSINESS_SCHEMA_MESSAGE
            ),
        }

    return {
        "detected_schema": "unsupported_schema",
        "selected_model": None,
        "model_family": None,
        "model_available": False,
        "prediction_mode": "none",
        "threshold_used": None,
        "threshold_source": None,
        "message": UNSUPPORTED_SCHEMA_MESSAGE,
    }


def _model_selection_threshold_source(source: str | None) -> str | None:
    if source == "default_business_model_threshold":
        return "default_model_threshold"

    return source


def _read_table_file(file_bytes: bytes, extension: str) -> pd.DataFrame:
    try:
        return pd.read_csv(io.BytesIO(file_bytes))
    except pd.errors.EmptyDataError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file does not contain readable transaction data.",
        ) from exc
    except (UnicodeDecodeError, pd.errors.ParserError) as exc:
        label = "TXT" if extension == ".txt" else "CSV"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not parse {label} file with comma-separated headers.",
        ) from exc


def _normalize_schema(frame: pd.DataFrame) -> tuple[pd.DataFrame, dict[str, Any]]:
    kaggle_mapping = _build_kaggle_column_mapping(frame.columns)
    kaggle_frame = _rename_columns(frame, kaggle_mapping)
    kaggle_columns = list(kaggle_frame.columns)
    missing_kaggle_columns = [
        column
        for column in REQUIRED_PREDICTION_COLUMNS
        if column not in kaggle_columns
    ]
    if not missing_kaggle_columns:
        expected_columns = set(REQUIRED_PREDICTION_COLUMNS + [OPTIONAL_LABEL_COLUMN])
        extra_columns = [
            column for column in kaggle_columns if column not in expected_columns
        ]
        return kaggle_frame, {
            "detected_schema": "kaggle_credit_card",
            "model_available": True,
            "mapped_columns": kaggle_mapping,
            "missing_required_columns": [],
            "extra_columns": extra_columns,
            "can_predict": True,
            "message": "Kaggle-style credit card schema detected. Prediction can run.",
        }

    business_mapping = _build_business_column_mapping(frame.columns)
    business_frame = _rename_columns(frame, business_mapping)
    business_columns = list(business_frame.columns)
    missing_business_columns = [
        column for column in BUSINESS_REQUIRED_COLUMNS if column not in business_columns
    ]
    if not missing_business_columns:
        model_available = business_prediction_artifacts_available()
        expected_columns = set(BUSINESS_REQUIRED_COLUMNS + BUSINESS_OPTIONAL_COLUMNS)
        extra_columns = [
            column for column in business_columns if column not in expected_columns
        ]
        return business_frame, {
            "detected_schema": "business_transaction",
            "model_available": model_available,
            "mapped_columns": business_mapping,
            "missing_required_columns": [],
            "extra_columns": extra_columns,
            "can_predict": model_available,
            "message": (
                "Business transaction schema detected. Prediction can run."
                if model_available
                else BUSINESS_SCHEMA_MESSAGE
            ),
        }

    kaggle_score = _schema_match_score(kaggle_columns, REQUIRED_PREDICTION_COLUMNS)
    business_score = _schema_match_score(business_columns, BUSINESS_REQUIRED_COLUMNS)
    if business_score > kaggle_score:
        normalized_frame = business_frame
        mapped_columns = business_mapping
        missing_required_columns = missing_business_columns
        expected_columns = set(BUSINESS_REQUIRED_COLUMNS + BUSINESS_OPTIONAL_COLUMNS)
        normalized_columns = business_columns
        message = UNSUPPORTED_SCHEMA_MESSAGE
    else:
        normalized_frame = kaggle_frame
        mapped_columns = kaggle_mapping
        missing_required_columns = missing_kaggle_columns
        expected_columns = set(REQUIRED_PREDICTION_COLUMNS + [OPTIONAL_LABEL_COLUMN])
        normalized_columns = kaggle_columns
        missing_pca_columns = [
            column for column in PCA_COLUMNS if column in missing_required_columns
        ]
        has_kaggle_signal = (
            "Time" in kaggle_columns
            and "Amount" in kaggle_columns
            and any(column in kaggle_columns for column in PCA_COLUMNS)
        )
        message = (
            KAGGLE_PCA_SCHEMA_MESSAGE
            if missing_pca_columns and has_kaggle_signal
            else UNSUPPORTED_SCHEMA_MESSAGE
        )

    extra_columns = [
        column for column in normalized_columns if column not in expected_columns
    ]
    return normalized_frame, {
        "detected_schema": "unsupported_schema",
        "model_available": False,
        "mapped_columns": mapped_columns,
        "missing_required_columns": missing_required_columns,
        "extra_columns": extra_columns,
        "can_predict": False,
        "message": message,
    }


def _rename_columns(frame: pd.DataFrame, mapped_columns: dict[str, str]) -> pd.DataFrame:
    rename_map = {
        source_column: target_column
        for source_column, target_column in mapped_columns.items()
        if source_column != target_column
    }
    return frame.rename(columns=rename_map)


def _build_kaggle_column_mapping(columns: pd.Index) -> dict[str, str]:
    return _build_column_mapping(columns, KAGGLE_COLUMN_ALIASES, include_pca=True)


def _build_business_column_mapping(columns: pd.Index) -> dict[str, str]:
    return _build_column_mapping(columns, BUSINESS_COLUMN_ALIASES, include_pca=False)


def _build_column_mapping(
    columns: pd.Index,
    column_aliases: dict[str, tuple[str, ...]],
    include_pca: bool,
) -> dict[str, str]:
    alias_lookup = {
        _canonical_column_name(alias): target_column
        for target_column, aliases in column_aliases.items()
        for alias in aliases
    }
    mapping = {}
    mapped_targets = set()
    exact_columns = {str(column).strip() for column in columns}

    for column in columns:
        column_name = str(column).strip()
        canonical_name = _canonical_column_name(column_name)
        target_column = alias_lookup.get(canonical_name)

        if include_pca and not target_column and _is_pca_column(canonical_name):
            target_column = canonical_name.upper()

        if (
            target_column
            and column_name != target_column
            and target_column not in exact_columns
            and target_column not in mapped_targets
        ):
            mapping[column] = target_column
            mapped_targets.add(target_column)

    return mapping


def _schema_match_score(columns: list[str], required_columns: list[str]) -> int:
    return len(set(columns) & set(required_columns))


def _is_pca_column(canonical_name: str) -> bool:
    if not canonical_name.startswith("v"):
        return False

    suffix = canonical_name[1:]
    return suffix.isdigit() and 1 <= int(suffix) <= 28


def _canonical_column_name(column: str) -> str:
    return column.strip().lower().replace("-", "_").replace(" ", "_")


def _extract_actual_labels(frame: pd.DataFrame, valid_index: pd.Index) -> list[str]:
    label_column = None
    for candidate_column in (OPTIONAL_LABEL_COLUMN, BUSINESS_LABEL_COLUMN):
        if candidate_column in frame.columns:
            label_column = candidate_column
            break

    if label_column is None:
        return []

    labels = frame.loc[valid_index, label_column].map(_normalize_label)
    return [label for label in labels.tolist() if label in {"Legitimate", "Fraud"}]


def _normalize_label(value: Any) -> str | None:
    if pd.isna(value):
        return None

    label = str(value).strip().lower()
    fraud_values = {"1", "1.0", "true", "fraud", "fraudulent", "yes"}
    legitimate_values = {"0", "0.0", "false", "legitimate", "normal", "no"}

    if label in fraud_values:
        return "Fraud"
    if label in legitimate_values:
        return "Legitimate"
    return None


def _calculate_uploaded_file_evaluation(
    actual_labels: list[str],
    predicted_labels: list[str],
) -> dict[str, Any] | None:
    if not actual_labels or len(actual_labels) != len(predicted_labels):
        return None

    true_legitimate = false_fraud_alert = missed_fraud = correct_fraud_detection = 0
    for actual_label, predicted_label in zip(actual_labels, predicted_labels):
        if actual_label == "Legitimate" and predicted_label == "Legitimate":
            true_legitimate += 1
        elif actual_label == "Legitimate" and predicted_label == "Fraud":
            false_fraud_alert += 1
        elif actual_label == "Fraud" and predicted_label == "Legitimate":
            missed_fraud += 1
        elif actual_label == "Fraud" and predicted_label == "Fraud":
            correct_fraud_detection += 1

    precision_denominator = correct_fraud_detection + false_fraud_alert
    recall_denominator = correct_fraud_detection + missed_fraud
    precision = (
        correct_fraud_detection / precision_denominator
        if precision_denominator
        else 0.0
    )
    recall = (
        correct_fraud_detection / recall_denominator if recall_denominator else 0.0
    )
    f1_denominator = precision + recall
    f1_score = 2 * precision * recall / f1_denominator if f1_denominator else 0.0

    return {
        "actual_legitimate_count": true_legitimate + false_fraud_alert,
        "actual_fraud_count": missed_fraud + correct_fraud_detection,
        "predicted_legitimate_count": true_legitimate + missed_fraud,
        "predicted_fraud_count": false_fraud_alert + correct_fraud_detection,
        "precision": precision,
        "recall": recall,
        "f1_score": f1_score,
        "confusion_matrix": {
            "true_legitimate": true_legitimate,
            "false_fraud_alert": false_fraud_alert,
            "missed_fraud": missed_fraud,
            "correct_fraud_detection": correct_fraud_detection,
        },
    }


def _validate_upload_size(file_bytes: bytes) -> None:
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )
    if len(file_bytes) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Uploaded file exceeds the 10 MB size limit.",
        )


def _resolve_threshold_context(threshold: float | None) -> dict[str, Any]:
    if threshold is None:
        return {
            "threshold_used": load_selected_threshold(),
            "threshold_source": "default_model_threshold",
        }

    if threshold < 0.01 or threshold > 0.99:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Threshold must be between 0.01 and 0.99.",
        )

    return {
        "threshold_used": float(threshold),
        "threshold_source": "custom_upload_threshold",
    }


def _validate_zip_member_path(filename: str) -> None:
    normalized = filename.replace("\\", "/")
    posix_path = PurePosixPath(normalized)
    windows_path = PureWindowsPath(filename)

    if windows_path.drive or posix_path.is_absolute() or ".." in posix_path.parts:
        raise ValueError("ZIP file contains an unsafe file path.")


def _empty_schema_report() -> dict[str, Any]:
    return {
        "detected_schema": "unsupported_schema",
        "model_available": False,
        "mapped_columns": {},
        "missing_required_columns": [],
        "extra_columns": [],
        "can_predict": False,
        "message": "",
    }


def _empty_summary(threshold_context: dict[str, Any]) -> dict[str, Any]:
    return {
        "upload_status": "processing",
        "files_processed": 0,
        "total_rows": 0,
        "valid_rows": 0,
        "invalid_rows": 0,
        "fraud_detected": 0,
        "high_risk_count": 0,
        **threshold_context,
        "schema_report": _empty_schema_report(),
        "model_selection": _build_model_selection(_empty_schema_report(), None),
        "uploaded_file_evaluation": None,
        "results": [],
        "errors": [],
        "actual_labels": [],
        "predicted_labels": [],
    }


def _merge_file_result(summary: dict[str, Any], file_result: dict[str, Any]) -> None:
    summary["files_processed"] += file_result["files_processed"]
    summary["total_rows"] += file_result["total_rows"]
    summary["valid_rows"] += file_result["valid_rows"]
    summary["invalid_rows"] += file_result["invalid_rows"]
    summary["results"].extend(file_result["results"])
    summary["errors"].extend(file_result["errors"])
    summary["actual_labels"].extend(file_result["actual_labels"])
    summary["predicted_labels"].extend(file_result["predicted_labels"])
    summary["threshold_used"] = file_result["threshold_used"]
    summary["threshold_source"] = file_result["threshold_source"]
    summary["schema_report"] = _merge_schema_reports(
        summary["schema_report"],
        file_result["schema_report"],
    )
    summary["model_selection"] = _merge_model_selections(
        summary["model_selection"],
        file_result["model_selection"],
        summary["schema_report"],
    )


def _merge_schema_reports(
    current_report: dict[str, Any],
    next_report: dict[str, Any],
) -> dict[str, Any]:
    mapped_columns = {
        **current_report.get("mapped_columns", {}),
        **next_report.get("mapped_columns", {}),
    }
    missing_required_columns = sorted(
        set(current_report.get("missing_required_columns", []))
        | set(next_report.get("missing_required_columns", []))
    )
    extra_columns = sorted(
        set(current_report.get("extra_columns", []))
        | set(next_report.get("extra_columns", []))
    )
    can_predict = current_report.get("can_predict", False) or next_report["can_predict"]
    model_available = (
        current_report.get("model_available", False)
        or next_report.get("model_available", False)
    )
    has_schema_failures = bool(missing_required_columns)
    schema_types = {
        current_report.get("detected_schema", "unsupported_schema"),
        next_report.get("detected_schema", "unsupported_schema"),
    }

    has_kaggle_schema = "kaggle_credit_card" in schema_types
    has_business_schema = "business_transaction" in schema_types

    if can_predict and has_schema_failures:
        message = "Some files can be predicted, but at least one file has schema issues."
    elif can_predict and has_business_schema and not has_kaggle_schema:
        message = "Business transaction schema detected. Prediction can run."
    elif can_predict:
        message = "Kaggle-style credit card schema detected. Prediction can run."
    elif has_business_schema:
        message = BUSINESS_SCHEMA_MESSAGE
    else:
        message = next_report["message"] or current_report.get(
            "message",
            UNSUPPORTED_SCHEMA_MESSAGE,
        )

    if can_predict and has_business_schema and not has_kaggle_schema:
        detected_schema = "business_transaction"
    elif can_predict:
        detected_schema = "kaggle_credit_card"
    elif has_business_schema:
        detected_schema = "business_transaction"
    else:
        detected_schema = "unsupported_schema"

    return {
        "detected_schema": detected_schema,
        "model_available": model_available,
        "mapped_columns": mapped_columns,
        "missing_required_columns": missing_required_columns,
        "extra_columns": extra_columns,
        "can_predict": can_predict,
        "message": message,
    }


def _merge_model_selections(
    current_selection: dict[str, Any],
    next_selection: dict[str, Any],
    merged_schema_report: dict[str, Any],
) -> dict[str, Any]:
    detected_schema = merged_schema_report["detected_schema"]
    for selection in (next_selection, current_selection):
        if selection.get("detected_schema") == detected_schema:
            return selection

    threshold_context = None
    threshold_used = next_selection.get("threshold_used") or current_selection.get(
        "threshold_used"
    )
    threshold_source = next_selection.get("threshold_source") or current_selection.get(
        "threshold_source"
    )
    if threshold_used is not None and threshold_source is not None:
        threshold_context = {
            "threshold_used": threshold_used,
            "threshold_source": threshold_source,
        }

    return _build_model_selection(merged_schema_report, threshold_context)


def _finalize_summary(summary: dict[str, Any]) -> None:
    if summary["valid_rows"] == 0:
        summary["fraud_detected"] = 0
        summary["high_risk_count"] = 0
        summary["upload_status"] = "validation_failed"
        summary["uploaded_file_evaluation"] = None
        summary.pop("actual_labels", None)
        summary.pop("predicted_labels", None)
        return

    summary["fraud_detected"] = sum(
        result["prediction"] == "Fraud" for result in summary["results"]
    )
    summary["high_risk_count"] = sum(
        result["risk_level"] == "High" for result in summary["results"]
    )
    summary["uploaded_file_evaluation"] = _calculate_uploaded_file_evaluation(
        summary["actual_labels"],
        summary["predicted_labels"],
    )
    summary["upload_status"] = (
        "partial_success"
        if summary["errors"] or summary["invalid_rows"] > 0
        else "completed"
    )
    summary.pop("actual_labels", None)
    summary.pop("predicted_labels", None)


def _safe_display_name(filename: str) -> str:
    return (filename or "uploaded_file").replace("\\", "/").split("/")[-1]


def _get_extension(filename: str) -> str:
    return PurePosixPath(filename.lower()).suffix
