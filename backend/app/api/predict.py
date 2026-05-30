"""Prediction API routes."""

from fastapi import APIRouter

from app.schemas.prediction import (
    BatchPredictionResponse,
    PredictionResponse,
    TransactionInput,
)
from app.services.prediction_service import predict_batch, predict_single


router = APIRouter(prefix="/predict", tags=["Predictions"])


@router.post("/single", response_model=PredictionResponse)
def predict_single_transaction(transaction: TransactionInput) -> PredictionResponse:
    """Predict fraud risk for one transaction."""
    result = predict_single(_model_to_dict(transaction))
    return PredictionResponse(**result)


@router.post("/batch", response_model=BatchPredictionResponse)
def predict_batch_transactions(
    transactions: list[TransactionInput],
) -> BatchPredictionResponse:
    """Predict fraud risk for a list of transactions."""
    results = predict_batch([_model_to_dict(transaction) for transaction in transactions])
    return BatchPredictionResponse(
        total_count=len(results),
        fraud_count=sum(result["prediction"] == "Fraud" for result in results),
        high_risk_count=sum(result["risk_level"] == "High" for result in results),
        results=[PredictionResponse(**result) for result in results],
    )


def _model_to_dict(model):
    if hasattr(model, "model_dump"):
        return model.model_dump()
    return model.dict()
