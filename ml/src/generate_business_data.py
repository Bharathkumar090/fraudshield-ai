"""Generate synthetic business-style transaction fraud data."""

import json

import numpy as np
import pandas as pd

try:
    from .config import BUSINESS_DATASET_PATH, RANDOM_STATE
except ImportError:
    from config import BUSINESS_DATASET_PATH, RANDOM_STATE


MERCHANT_CATEGORIES = [
    "grocery",
    "fuel",
    "travel",
    "restaurant",
    "electronics",
    "crypto",
    "gambling",
    "subscription",
    "fashion",
    "pharmacy",
]

CATEGORY_PROBABILITIES = [
    0.18,
    0.12,
    0.10,
    0.15,
    0.10,
    0.04,
    0.03,
    0.10,
    0.10,
    0.08,
]

CATEGORY_RISK = {
    "grocery": -0.30,
    "fuel": -0.15,
    "travel": 0.35,
    "restaurant": -0.20,
    "electronics": 0.90,
    "crypto": 1.45,
    "gambling": 1.30,
    "subscription": 0.10,
    "fashion": 0.15,
    "pharmacy": -0.25,
}


def generate_business_dataset(
    rows: int = 25000,
    output_path=BUSINESS_DATASET_PATH,
    random_state: int = RANDOM_STATE,
) -> pd.DataFrame:
    """Generate labeled transaction rows with readable business features."""
    rng = np.random.default_rng(random_state)

    merchant_category = rng.choice(
        MERCHANT_CATEGORIES,
        size=rows,
        p=CATEGORY_PROBABILITIES,
    )
    amount = np.round(rng.lognormal(mean=6.0, sigma=1.15, size=rows), 2)
    amount = np.clip(amount, 5, 50000)
    is_international = rng.binomial(1, 0.16, size=rows)
    hour = rng.integers(0, 24, size=rows)
    device_risk_score = np.round(rng.beta(2.0, 5.0, size=rows), 4)
    customer_history_risk = np.round(rng.beta(1.6, 5.5, size=rows), 4)
    failed_attempts = np.clip(rng.poisson(0.35, size=rows), 0, 8)

    category_risk = np.array([CATEGORY_RISK[category] for category in merchant_category])
    late_night = ((hour <= 5) | (hour >= 22)).astype(int)
    high_amount = np.log1p(amount) / np.log1p(50000)
    score = (
        -4.25
        + 2.10 * high_amount
        + category_risk
        + 0.95 * is_international
        + 0.65 * late_night
        + 2.35 * device_risk_score
        + 2.05 * customer_history_risk
        + 0.42 * failed_attempts
    )
    fraud_probability = 1 / (1 + np.exp(-score))
    target = rng.binomial(1, fraud_probability)

    frame = pd.DataFrame(
        {
            "amount": amount,
            "merchant_category": merchant_category,
            "is_international": is_international,
            "hour": hour,
            "device_risk_score": device_risk_score,
            "customer_history_risk": customer_history_risk,
            "failed_attempts": failed_attempts,
            "class": target,
        }
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    frame.to_csv(output_path, index=False)
    return frame


def main() -> None:
    """Generate the configured business transaction dataset."""
    frame = generate_business_dataset()
    summary = {
        "path": str(BUSINESS_DATASET_PATH),
        "rows": int(len(frame)),
        "fraud_rate": float(frame["class"].mean()),
        "fraud_count": int(frame["class"].sum()),
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
