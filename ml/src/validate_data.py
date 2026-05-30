"""Dataset validation helpers for credit card fraud data."""

from dataclasses import dataclass

try:
    from .config import REQUIRED_COLUMNS, TARGET_COLUMN
except ImportError:
    from config import REQUIRED_COLUMNS, TARGET_COLUMN


@dataclass(frozen=True)
class ValidationResult:
    """Structured result for dataset validation."""

    is_valid: bool
    missing_columns: list[str]
    message: str


def validate_credit_card_dataset(df) -> ValidationResult:
    """Validate that a dataframe matches the expected fraud dataset schema."""
    missing_columns = [column for column in REQUIRED_COLUMNS if column not in df.columns]

    if TARGET_COLUMN not in df.columns:
        return ValidationResult(
            is_valid=False,
            missing_columns=missing_columns,
            message=f"Target column '{TARGET_COLUMN}' is missing.",
        )

    if missing_columns:
        return ValidationResult(
            is_valid=False,
            missing_columns=missing_columns,
            message="Dataset is missing required columns.",
        )

    return ValidationResult(
        is_valid=True,
        missing_columns=[],
        message="Dataset schema is valid.",
    )
