# Machine Learning

FraudShield AI machine learning pipeline skeleton.

## Dataset Format

The pipeline is prepared for Kaggle-style credit card fraud CSV data.

Required columns:
- `Time`
- `V1` through `V28`
- `Amount`
- `Class`

`Class` is the target column, where fraud labels are expected to be provided by
the dataset.

## Structure

- `src` contains ML pipeline modules.
- `data` is for local datasets.
- `artifacts` is for saved model outputs.
- `reports` is for evaluation outputs.
- `notebooks` is for exploratory work.

## Future Artifacts

Future training steps should produce:
- `model.pkl`
- `preprocessor.pkl`
- `feature_columns.json`
- `metrics.json`

No model has been trained yet.
