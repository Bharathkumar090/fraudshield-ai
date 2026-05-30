export const modelSummary = {
  currentModel: "Random Forest",
  version: "v1.0.0",
  lastTrained: "May 24, 2026",
  datasetType: "Credit Card Fraud Dataset",
  status: "Active",
};

export const modelMetrics = [
  {
    label: "Precision",
    value: "0.92",
    helper: "Fraud alerts that were correct",
  },
  {
    label: "Recall",
    value: "0.96",
    helper: "Fraud cases captured",
    emphasized: true,
  },
  {
    label: "F1-score",
    value: "0.94",
    helper: "Balance of precision and recall",
  },
  {
    label: "ROC-AUC",
    value: "0.98",
    helper: "Class separation quality",
  },
  {
    label: "PR-AUC",
    value: "0.91",
    helper: "Performance on rare fraud cases",
    emphasized: true,
  },
];

export const confusionMatrixData = {
  trueLegitimate: 56842,
  falseFraudAlert: 318,
  missedFraud: 42,
  correctFraudDetection: 982,
};

export const featureImportanceData = [
  { feature: "Amount", importance: 0.28 },
  { feature: "V14", importance: 0.23 },
  { feature: "V12", importance: 0.18 },
  { feature: "V10", importance: 0.14 },
  { feature: "V17", importance: 0.1 },
  { feature: "Time", importance: 0.07 },
];

export const modelReportItems = [
  "Confusion Matrix",
  "ROC Curve",
  "Precision-Recall Curve",
  "Feature Importance",
  "Metrics JSON",
];
