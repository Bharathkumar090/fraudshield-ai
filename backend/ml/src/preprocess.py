"""Preprocessing utilities for the FraudShield AI ML pipeline."""

from dataclasses import dataclass

try:
    from .config import FEATURE_COLUMNS, TARGET_COLUMN, TEST_SIZE, RANDOM_STATE
except ImportError:
    from config import FEATURE_COLUMNS, TARGET_COLUMN, TEST_SIZE, RANDOM_STATE

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


SCALED_COLUMNS = ["Time", "Amount"]


def split_features_and_target(df):
    """Split a validated dataframe into features and target arrays."""
    features = df[FEATURE_COLUMNS]
    target = df[TARGET_COLUMN]
    return features, target


@dataclass
class CreditCardPreprocessor:
    """Scale selected numeric columns while preserving feature order."""

    feature_columns: list[str]
    scaled_columns: list[str]
    scaler: StandardScaler

    def transform(self, features):
        """Transform feature data using the fitted scaler."""
        missing_columns = [
            column for column in self.feature_columns if column not in features.columns
        ]
        if missing_columns:
            missing = ", ".join(missing_columns)
            raise ValueError(f"Missing feature columns for preprocessing: {missing}")

        processed = features[self.feature_columns].copy()
        processed[self.scaled_columns] = self.scaler.transform(
            processed[self.scaled_columns]
        )
        return processed


def fit_preprocessor(features):
    """Fit preprocessing for the fraud dataset."""
    scaler = StandardScaler()
    scaler.fit(features[SCALED_COLUMNS])
    return CreditCardPreprocessor(
        feature_columns=list(FEATURE_COLUMNS),
        scaled_columns=list(SCALED_COLUMNS),
        scaler=scaler,
    )


def prepare_train_test_data(df, test_size=TEST_SIZE, random_state=RANDOM_STATE):
    """Split, fit preprocessing on train data, and transform train/test features."""
    features, target = split_features_and_target(df)
    x_train, x_test, y_train, y_test = train_test_split(
        features,
        target,
        test_size=test_size,
        random_state=random_state,
        stratify=target,
    )

    preprocessor = fit_preprocessor(x_train)
    x_train_processed = preprocessor.transform(x_train)
    x_test_processed = preprocessor.transform(x_test)

    return x_train_processed, x_test_processed, y_train, y_test, preprocessor


def preprocess_features(features, preprocessor):
    """Apply a fitted preprocessor to feature data."""
    return preprocessor.transform(features)
