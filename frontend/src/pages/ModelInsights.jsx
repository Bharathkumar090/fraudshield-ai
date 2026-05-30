import { useEffect, useMemo, useState } from "react";

import ConfusionMatrix from "../components/ConfusionMatrix.jsx";
import DashboardLayout from "../components/DashboardLayout.jsx";
import FeatureImportanceChart from "../components/FeatureImportanceChart.jsx";
import ModelMetricCard from "../components/ModelMetricCard.jsx";
import ModelReportsCard from "../components/ModelReportsCard.jsx";
import PrecisionRecallCurveChart from "../components/PrecisionRecallCurveChart.jsx";
import RocCurveChart from "../components/RocCurveChart.jsx";
import ThresholdSlider from "../components/ThresholdSlider.jsx";
import {
  confusionMatrixData,
  featureImportanceData,
  modelMetrics,
  modelReportItems,
  modelSummary,
} from "../data/modelInsightsMockData.js";
import { getModelMetrics } from "../services/api.js";
import { getLatestUploadResult } from "../services/uploadResultStore.js";

export default function ModelInsights() {
  const [threshold, setThreshold] = useState(0.5);
  const [backendMetrics, setBackendMetrics] = useState(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [metricsError, setMetricsError] = useState("");
  const [latestUploadResult] = useState(() => getLatestUploadResult());

  useEffect(() => {
    let isActive = true;

    async function loadModelMetrics() {
      try {
        setIsLoadingMetrics(true);
        setMetricsError("");
        const metrics = await getModelMetrics();
        if (isActive) {
          setBackendMetrics(metrics);
        }
      } catch (error) {
        if (isActive) {
          setMetricsError(error.message);
        }
      } finally {
        if (isActive) {
          setIsLoadingMetrics(false);
        }
      }
    }

    loadModelMetrics();

    return () => {
      isActive = false;
    };
  }, []);

  const modelInsights = useMemo(
    () => buildModelInsights(backendMetrics),
    [backendMetrics],
  );
  const activeSummary = {
    ...modelSummary,
    currentModel: modelInsights?.bestModelName || modelSummary.currentModel,
  };
  const activeMetrics = modelInsights?.metrics || modelMetrics;
  const activeConfusionMatrix =
    modelInsights?.confusionMatrix || confusionMatrixData;
  const rocCurvePoints = modelInsights?.rocCurvePoints ?? [];
  const precisionRecallCurvePoints = modelInsights?.precisionRecallCurvePoints ?? [];

  return (
    <DashboardLayout eyebrow="Model Insights" title="Model Insights">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-blue-700">Model Insights</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Monitor model performance, risk thresholds, and prediction behavior.
          </h1>
        </section>

        {isLoadingMetrics ? (
          <section className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-800">
            Loading model metrics from the backend.
          </section>
        ) : null}

        {metricsError ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
            {metricsError}
          </section>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Current model</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                {activeSummary.currentModel}
              </h2>
            </div>
            <span
              className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
                metricsError
                  ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {metricsError ? "Fallback metrics" : activeSummary.status}
            </span>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryItem label="Model version" value={activeSummary.version} />
            <SummaryItem label="Last trained" value={activeSummary.lastTrained} />
            <SummaryItem label="Dataset type" value={activeSummary.datasetType} />
            <SummaryItem
              label="Selection metric"
              value={modelInsights?.selectionMetric || "PR-AUC then recall"}
            />
          </dl>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {activeMetrics.map((metric) => (
            <ModelMetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <ConfusionMatrix
            data={activeConfusionMatrix}
            title="Global Confusion Matrix"
            subtitle="Saved model test-set evaluation from the ML pipeline."
          />
          <FeatureImportanceChart data={featureImportanceData} />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <RocCurveChart data={rocCurvePoints} />
          <PrecisionRecallCurveChart data={precisionRecallCurvePoints} />
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-blue-700">
              Latest Upload Evaluation
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Compare uploaded labels against predicted results.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Global metrics come from the saved model test evaluation. Latest upload
              evaluation is calculated only for the most recently uploaded labeled file.
            </p>
          </div>

          <LatestUploadEvaluation uploadResult={latestUploadResult} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <ThresholdSlider value={threshold} onChange={setThreshold} />
          <ModelReportsCard reports={modelReportItems} />
        </section>
      </div>
    </DashboardLayout>
  );
}

function LatestUploadEvaluation({ uploadResult }) {
  if (!uploadResult) {
    return (
      <EmptyUploadEvaluationMessage>
        No uploaded file evaluation available yet. Upload a labeled CSV to compare actual vs predicted results.
      </EmptyUploadEvaluationMessage>
    );
  }

  if (!uploadResult.uploaded_file_evaluation) {
    return (
      <EmptyUploadEvaluationMessage>
        Latest upload evaluation is unavailable because the uploaded file did not include actual Class labels.
      </EmptyUploadEvaluationMessage>
    );
  }

  const evaluation = uploadResult.uploaded_file_evaluation;
  const matrix = normalizeUploadConfusionMatrix(evaluation.confusion_matrix);
  const sourceFileName = getUploadSourceFileName(uploadResult);
  const summaryItems = [
    ["Actual legitimate", evaluation.actual_legitimate_count],
    ["Actual fraud", evaluation.actual_fraud_count],
    ["Predicted legitimate", evaluation.predicted_legitimate_count],
    ["Predicted fraud", evaluation.predicted_fraud_count],
    ["Precision", formatMetric(evaluation.precision)],
    ["Recall", formatMetric(evaluation.recall)],
    ["F1-score", formatMetric(evaluation.f1_score)],
    ["Threshold used", formatThreshold(uploadResult.threshold_used)],
    ["Threshold source", formatThresholdSource(uploadResult.threshold_source)],
    ["Source file", sourceFileName],
    ["Total rows", uploadResult.total_rows ?? "N/A"],
  ];

  return (
    <div className="space-y-6">
      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map(([label, value]) => (
          <SummaryItem key={label} label={label} value={formatValue(value)} />
        ))}
      </dl>

      <ConfusionMatrix
        data={matrix}
        title="Latest Upload Confusion Matrix"
        subtitle="Actual labels compared with predictions from the most recent labeled upload."
      />
    </div>
  );
}

function EmptyUploadEvaluationMessage({ children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 text-sm font-medium leading-6 text-slate-600">
      {children}
    </div>
  );
}

function normalizeUploadConfusionMatrix(confusionMatrix) {
  return {
    trueLegitimate:
      confusionMatrix?.true_legitimate ?? confusionMatrix?.trueLegitimate ?? 0,
    falseFraudAlert:
      confusionMatrix?.false_fraud_alert ?? confusionMatrix?.falseFraudAlert ?? 0,
    missedFraud: confusionMatrix?.missed_fraud ?? confusionMatrix?.missedFraud ?? 0,
    correctFraudDetection:
      confusionMatrix?.correct_fraud_detection ??
      confusionMatrix?.correctFraudDetection ??
      0,
  };
}

function getUploadSourceFileName(uploadResult) {
  const sourceFiles = [
    ...new Set(
      (uploadResult.results ?? [])
        .map((result) => result.source_file)
        .filter(Boolean),
    ),
  ];

  if (sourceFiles.length === 0) {
    return "N/A";
  }

  if (sourceFiles.length === 1) {
    return sourceFiles[0];
  }

  return `${sourceFiles[0]} + ${sourceFiles.length - 1} more`;
}

function buildModelInsights(metricsPayload) {
  if (!metricsPayload) {
    return null;
  }

  const bestModelKey =
    metricsPayload.best_model ||
    metricsPayload.bestModel ||
    Object.keys(metricsPayload.models || {})[0];
  const bestModelMetrics =
    metricsPayload.models?.[bestModelKey] || metricsPayload.metrics || metricsPayload;

  if (!bestModelKey || !bestModelMetrics) {
    return null;
  }

  return {
    bestModelName: formatModelName(bestModelKey),
    selectionMetric: formatSelectionMetric(metricsPayload.selection_metric),
    metrics: [
      {
        label: "Precision",
        value: formatMetric(bestModelMetrics.precision),
        helper: "Fraud alerts that were correct",
      },
      {
        label: "Recall",
        value: formatMetric(bestModelMetrics.recall),
        helper: "Fraud cases captured",
        emphasized: true,
      },
      {
        label: "F1-score",
        value: formatMetric(bestModelMetrics.f1_score ?? bestModelMetrics.f1Score),
        helper: "Balance of precision and recall",
      },
      {
        label: "ROC-AUC",
        value: formatMetric(bestModelMetrics.roc_auc ?? bestModelMetrics.rocAuc),
        helper: "Class separation quality",
      },
      {
        label: "PR-AUC",
        value: formatMetric(bestModelMetrics.pr_auc ?? bestModelMetrics.prAuc),
        helper: "Performance on rare fraud cases",
        emphasized: true,
      },
    ],
    confusionMatrix: normalizeConfusionMatrix(bestModelMetrics.confusion_matrix),
    rocCurvePoints:
      metricsPayload.roc_curve_points ||
      bestModelMetrics.roc_curve_points ||
      [],
    precisionRecallCurvePoints:
      metricsPayload.precision_recall_curve_points ||
      bestModelMetrics.precision_recall_curve_points ||
      [],
  };
}

function normalizeConfusionMatrix(confusionMatrix) {
  if (!confusionMatrix) {
    return confusionMatrixData;
  }

  return {
    trueLegitimate:
      confusionMatrix.true_legitimate ?? confusionMatrix.trueLegitimate ?? 0,
    falseFraudAlert:
      confusionMatrix.false_fraud_alert ?? confusionMatrix.falseFraudAlert ?? 0,
    missedFraud: confusionMatrix.missed_fraud ?? confusionMatrix.missedFraud ?? 0,
    correctFraudDetection:
      confusionMatrix.correct_fraud_detection ??
      confusionMatrix.correctFraudDetection ??
      0,
  };
}

function formatMetric(value) {
  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return value.toFixed(2);
}

function formatThreshold(value) {
  if (!Number.isFinite(value)) {
    return "N/A";
  }

  return value.toFixed(2);
}

function formatThresholdSource(source) {
  if (source === "custom_upload_threshold") {
    return "Custom upload threshold";
  }

  if (source === "default_model_threshold") {
    return "Default model threshold";
  }

  return "N/A";
}

function formatValue(value) {
  if (typeof value === "number") {
    return value.toLocaleString();
  }

  return value;
}

function formatModelName(modelKey) {
  return String(modelKey)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSelectionMetric(selectionMetric) {
  if (!selectionMetric) {
    return "PR-AUC then recall";
  }

  return String(selectionMetric)
    .replaceAll("_", " ")
    .replace("pr auc", "PR-AUC")
    .replace("roc auc", "ROC-AUC")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace("Pr-Auc", "PR-AUC")
    .replace("Roc-Auc", "ROC-AUC");
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
