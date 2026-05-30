"""Upload response schemas."""

from pydantic import BaseModel, Field


class UploadPredictionResult(BaseModel):
    """Prediction result for one uploaded row."""

    row_index: int
    source_file: str
    prediction: str
    fraud_probability: float
    risk_level: str
    recommended_action: str


class UploadSchemaReport(BaseModel):
    """Detected upload schema details."""

    detected_schema: str
    model_available: bool
    mapped_columns: dict[str, str] = Field(default_factory=dict)
    missing_required_columns: list[str] = Field(default_factory=list)
    extra_columns: list[str] = Field(default_factory=list)
    can_predict: bool
    message: str


class UploadModelSelection(BaseModel):
    """Selected model details for an upload."""

    detected_schema: str
    selected_model: str | None = None
    model_family: str | None = None
    model_available: bool
    prediction_mode: str
    threshold_used: float | None = None
    threshold_source: str | None = None
    message: str


class UploadConfusionMatrix(BaseModel):
    """Evaluation confusion matrix for labeled uploads."""

    true_legitimate: int
    false_fraud_alert: int
    missed_fraud: int
    correct_fraud_detection: int


class UploadedFileEvaluation(BaseModel):
    """Evaluation metrics calculated from uploaded labels."""

    actual_legitimate_count: int
    actual_fraud_count: int
    predicted_legitimate_count: int
    predicted_fraud_count: int
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: UploadConfusionMatrix


class UploadResponse(BaseModel):
    """Upload processing summary."""

    upload_status: str
    files_processed: int
    total_rows: int
    valid_rows: int
    invalid_rows: int
    fraud_detected: int
    high_risk_count: int
    threshold_used: float
    threshold_source: str
    schema_report: UploadSchemaReport
    model_selection: UploadModelSelection
    uploaded_file_evaluation: UploadedFileEvaluation | None = None
    results: list[UploadPredictionResult]
    errors: list[str] = Field(default_factory=list)
