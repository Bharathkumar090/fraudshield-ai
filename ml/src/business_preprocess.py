"""Preprocessing for business-style transaction fraud features."""

from dataclasses import dataclass

import pandas as pd
from sklearn.preprocessing import OneHotEncoder, StandardScaler

try:
    from .config import (
        BUSINESS_CATEGORICAL_COLUMNS,
        BUSINESS_FEATURE_COLUMNS,
        BUSINESS_NUMERIC_COLUMNS,
    )
except ImportError:
    from config import (
        BUSINESS_CATEGORICAL_COLUMNS,
        BUSINESS_FEATURE_COLUMNS,
        BUSINESS_NUMERIC_COLUMNS,
    )


@dataclass
class BusinessTransactionPreprocessor:
    """Scale numeric business fields and one-hot encode merchant category."""

    feature_columns: list[str]
    numeric_columns: list[str]
    categorical_columns: list[str]
    scaler: StandardScaler
    encoder: OneHotEncoder
    output_feature_columns: list[str]

    def transform(self, features: pd.DataFrame) -> pd.DataFrame:
        """Transform raw business transaction fields into model features."""
        missing_columns = [
            column for column in self.feature_columns if column not in features.columns
        ]
        if missing_columns:
            missing = ", ".join(missing_columns)
            raise ValueError(f"Missing business feature columns: {missing}")

        normalized = features[self.feature_columns].copy()
        numeric_frame = normalized[self.numeric_columns].apply(
            pd.to_numeric,
            errors="coerce",
        )
        categorical_frame = normalized[self.categorical_columns].fillna("unknown")
        categorical_frame = categorical_frame.astype(str).apply(
            lambda column: column.str.strip().str.lower().replace("", "unknown")
        )

        scaled_numeric = pd.DataFrame(
            self.scaler.transform(numeric_frame),
            columns=self.numeric_columns,
            index=features.index,
        )
        encoded = pd.DataFrame(
            self.encoder.transform(categorical_frame),
            columns=list(self.encoder.get_feature_names_out(self.categorical_columns)),
            index=features.index,
        )

        return pd.concat([scaled_numeric, encoded], axis=1)[self.output_feature_columns]


def build_one_hot_encoder() -> OneHotEncoder:
    """Create a OneHotEncoder that works across common scikit-learn versions."""
    try:
        return OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    except TypeError:
        return OneHotEncoder(handle_unknown="ignore", sparse=False)


def fit_business_preprocessor(features: pd.DataFrame) -> BusinessTransactionPreprocessor:
    """Fit preprocessing for business-style transaction data."""
    numeric_columns = list(BUSINESS_NUMERIC_COLUMNS)
    categorical_columns = list(BUSINESS_CATEGORICAL_COLUMNS)
    feature_columns = list(BUSINESS_FEATURE_COLUMNS)

    numeric_frame = features[numeric_columns].apply(pd.to_numeric, errors="coerce")
    categorical_frame = features[categorical_columns].fillna("unknown")
    categorical_frame = categorical_frame.astype(str).apply(
        lambda column: column.str.strip().str.lower().replace("", "unknown")
    )

    scaler = StandardScaler()
    scaler.fit(numeric_frame)

    encoder = build_one_hot_encoder()
    encoder.fit(categorical_frame)

    output_feature_columns = [
        *numeric_columns,
        *encoder.get_feature_names_out(categorical_columns).tolist(),
    ]
    return BusinessTransactionPreprocessor(
        feature_columns=feature_columns,
        numeric_columns=numeric_columns,
        categorical_columns=categorical_columns,
        scaler=scaler,
        encoder=encoder,
        output_feature_columns=output_feature_columns,
    )
