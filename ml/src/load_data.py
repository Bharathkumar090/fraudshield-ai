"""Data loading utilities for the FraudShield AI ML pipeline."""

from pathlib import Path

import pandas as pd

try:
    from .validate_data import validate_credit_card_dataset
except ImportError:
    from validate_data import validate_credit_card_dataset


def load_dataset(file_path):
    """Load and validate a Kaggle-style credit card fraud CSV dataset."""
    dataset_path = Path(file_path)

    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset file not found: {dataset_path}")

    if dataset_path.suffix.lower() != ".csv":
        raise ValueError("Only CSV datasets are supported by the ML loader.")

    df = pd.read_csv(dataset_path)
    validation_result = validate_credit_card_dataset(df)

    if not validation_result.is_valid:
        missing = ", ".join(validation_result.missing_columns) or "none"
        raise ValueError(f"{validation_result.message} Missing columns: {missing}")

    return df
