import { Download, ShieldAlert } from "lucide-react";

export default function UploadSummary({ result }) {
  const canPredict = result.schema_report?.can_predict ?? Boolean(result.results?.length);
  const isBusinessSchema = result.schema_report?.detected_schema === "business_transaction";
  const summaryItems = [
    ["Upload status", formatStatus(result.upload_status)],
    ["Files processed", result.files_processed],
    ["Total rows", result.total_rows],
    ["Valid rows", result.valid_rows],
    ["Invalid rows", result.invalid_rows],
    ["Fraud detected", result.fraud_detected],
    ["High-risk count", result.high_risk_count],
    ["Threshold used", formatThreshold(result.threshold_used)],
    ["Threshold source", formatThresholdSource(result.threshold_source)],
  ];
  const previewResults = result.results?.slice(0, 10) ?? [];
  const hasResults = previewResults.length > 0;
  const summaryMessage = getSummaryMessage(result, canPredict, isBusinessSchema);

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                {!canPredict
                  ? "Upload validation complete"
                  : "Fraud check complete"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {summaryMessage}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          onClick={() => downloadResultsCsv(result.results ?? [])}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download Results
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryItems.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {formatValue(value)}
            </p>
          </div>
        ))}
      </div>

      {result.errors?.length ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Some rows or files need attention</p>
          <ul className="mt-2 space-y-1">
            {result.errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <SchemaReport report={result.schema_report} />

      <ModelSelection selection={result.model_selection} />

      <UploadedFileEvaluation evaluation={result.uploaded_file_evaluation} />

      {canPredict ? (
      <div className="mt-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h3 className="text-base font-semibold text-slate-950">
              Results preview
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {hasResults
                ? "Showing the first 10 prediction results."
                : "No prediction results are available for this upload."}
            </p>
          </div>
          <span className="text-sm font-medium text-slate-500">
            {formatValue(result.results?.length ?? 0)} total results
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">row_index</th>
                  <th className="px-4 py-3">source_file</th>
                  <th className="px-4 py-3">prediction</th>
                  <th className="px-4 py-3">fraud_probability</th>
                  <th className="px-4 py-3">risk_level</th>
                  <th className="px-4 py-3">recommended_action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {hasResults ? (
                  previewResults.map((item) => (
                    <tr key={`${item.source_file}-${item.row_index}`}>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {item.row_index}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.source_file}</td>
                      <td className="px-4 py-3">
                        <PredictionBadge prediction={item.prediction} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatProbability(item.fraud_probability)}
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge riskLevel={item.risk_level} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.recommended_action}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-6 text-center text-slate-500" colSpan="6">
                      Prediction could not run because this file does not match the trained model schema.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      ) : null}
    </section>
  );
}

function ModelSelection({ selection }) {
  if (!selection) {
    return null;
  }

  const details = [
    ["Detected schema", formatSchemaName(selection.detected_schema)],
    ["Selected model", formatNullable(selection.selected_model)],
    ["Model family", formatModelFamily(selection.model_family)],
    ["Prediction mode", formatPredictionMode(selection.prediction_mode)],
    ["Threshold used", formatNullableThreshold(selection.threshold_used)],
    ["Threshold source", formatNullableThresholdSource(selection.threshold_source)],
  ];

  return (
    <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-base font-semibold text-slate-950">
            Model Selection
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {selection.message}
          </p>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
            selection.model_available
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {selection.model_available ? "Model available" : "Model unavailable"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {details.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SchemaReport({ report }) {
  if (!report) {
    return null;
  }

  const mappedEntries = Object.entries(report.mapped_columns ?? {});
  const missingColumns = report.missing_required_columns ?? [];
  const extraColumns = report.extra_columns ?? [];
  const schemaDetails = [
    ["Detected schema", formatSchemaName(report.detected_schema)],
    ["Model available", report.model_available ? "Yes" : "No"],
    ["Prediction", report.can_predict ? "Can run" : "Cannot run"],
  ];

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-base font-semibold text-slate-950">Schema Report</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{report.message}</p>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
            report.can_predict
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {report.can_predict ? "Prediction can run" : "Prediction cannot run"}
        </span>
      </div>

      {report.detected_schema === "unsupported_schema" ? (
        <div className="mt-4 rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm font-medium text-rose-700">
          Prediction could not run because this file does not match the trained model schema.
        </div>
      ) : null}

      {report.detected_schema === "business_transaction" && !report.model_available ? (
        <div className="mt-4 rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm font-medium text-blue-700">
          Business transaction schema detected, but the business model is not trained yet.
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {schemaDetails.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <SchemaList
          title="Mapped columns"
          items={
            mappedEntries.length
              ? mappedEntries.map(([source, target]) => `${source} -> ${target}`)
              : ["No alias mapping needed"]
          }
        />
        <SchemaList
          title="Missing required columns"
          items={missingColumns.length ? missingColumns : ["None"]}
        />
        <SchemaList
          title="Extra columns"
          items={extraColumns.length ? extraColumns : ["None"]}
        />
      </div>
    </div>
  );
}

function UploadedFileEvaluation({ evaluation }) {
  if (!evaluation) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
        <h3 className="text-base font-semibold text-slate-950">
          Uploaded File Evaluation
        </h3>
        <p className="mt-2">
          Evaluation metrics are unavailable because this file does not include actual Class labels.
        </p>
      </div>
    );
  }

  const items = [
    ["Actual legitimate", evaluation.actual_legitimate_count],
    ["Actual fraud", evaluation.actual_fraud_count],
    ["Predicted legitimate", evaluation.predicted_legitimate_count],
    ["Predicted fraud", evaluation.predicted_fraud_count],
    ["Precision", formatMetric(evaluation.precision)],
    ["Recall", formatMetric(evaluation.recall)],
    ["F1-score", formatMetric(evaluation.f1_score)],
  ];
  const matrix = evaluation.confusion_matrix;

  return (
    <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-5">
      <h3 className="text-base font-semibold text-slate-950">
        Uploaded File Evaluation
      </h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-950">
              {formatValue(value)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MatrixCell label="True legitimate" value={matrix.true_legitimate} tone="blue" />
        <MatrixCell label="False fraud alert" value={matrix.false_fraud_alert} tone="amber" />
        <MatrixCell label="Missed fraud" value={matrix.missed_fraud} tone="rose" />
        <MatrixCell label="Correct fraud detection" value={matrix.correct_fraud_detection} tone="violet" />
      </div>
    </div>
  );
}

function SchemaList({ title, items }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function MatrixCell({ label, value, tone }) {
  const tones = {
    blue: "border-blue-100 bg-blue-50 text-blue-900",
    amber: "border-amber-100 bg-amber-50 text-amber-900",
    rose: "border-rose-100 bg-rose-50 text-rose-900",
    violet: "border-violet-100 bg-violet-50 text-violet-900",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{formatValue(value)}</p>
    </div>
  );
}

function PredictionBadge({ prediction }) {
  const isFraud = prediction === "Fraud";
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        isFraud
          ? "bg-rose-50 text-rose-700"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {prediction}
    </span>
  );
}

function RiskBadge({ riskLevel }) {
  const classes = {
    Low: "bg-emerald-50 text-emerald-700",
    Medium: "bg-amber-50 text-amber-700",
    High: "bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        classes[riskLevel] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {riskLevel}
    </span>
  );
}

function downloadResultsCsv(results) {
  const headers = [
    "row_index",
    "source_file",
    "prediction",
    "fraud_probability",
    "risk_level",
    "recommended_action",
  ];
  const rows = results.map((item) =>
    headers.map((header) => escapeCsvValue(item[header])).join(","),
  );
  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "fraudshield_prediction_results.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getSummaryMessage(result, canPredict, isBusinessSchema) {
  if (canPredict) {
    return "Results generated for the selected file.";
  }

  if (isBusinessSchema) {
    return "Business transaction schema detected, but the business model is not trained yet.";
  }

  if (result.upload_status === "validation_failed") {
    return "Prediction could not run because this file does not match the trained model schema.";
  }

  return "Prediction results are unavailable for this upload.";
}

function escapeCsvValue(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function formatStatus(status) {
  if (!status) {
    return "Completed";
  }

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSchemaName(schema) {
  if (schema === "kaggle_credit_card") {
    return "Kaggle credit card";
  }

  if (schema === "business_transaction") {
    return "Business transaction";
  }

  return "Unsupported schema";
}

function formatModelFamily(modelFamily) {
  if (modelFamily === "kaggle_pca_model") {
    return "Kaggle PCA model";
  }

  if (modelFamily === "business_transaction_model") {
    return "Business transaction model";
  }

  return "None";
}

function formatPredictionMode(mode) {
  if (mode === "kaggle_features") {
    return "Kaggle features";
  }

  if (mode === "business_features") {
    return "Business features";
  }

  return "None";
}

function formatNullable(value) {
  return value || "None";
}

function formatNullableThreshold(value) {
  if (!Number.isFinite(value)) {
    return "None";
  }

  return value.toFixed(2);
}

function formatNullableThresholdSource(source) {
  if (!source) {
    return "None";
  }

  return formatThresholdSource(source);
}

function formatValue(value) {
  if (typeof value === "number") {
    return value.toLocaleString();
  }

  return value;
}

function formatProbability(value) {
  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return value.toFixed(4);
}

function formatMetric(value) {
  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return value.toFixed(2);
}

function formatThreshold(value) {
  if (!Number.isFinite(value)) {
    return "0.50";
  }

  return value.toFixed(2);
}

function formatThresholdSource(source) {
  if (source === "custom_upload_threshold") {
    return "Custom upload threshold";
  }

  if (source === "default_business_model_threshold") {
    return "Default business model threshold";
  }

  return "Default model threshold";
}
