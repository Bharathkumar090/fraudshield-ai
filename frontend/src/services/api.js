import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export const MODEL_REPORT_DOWNLOADS = {
  confusionMatrix: {
    path: "/reports/confusion-matrix",
    filename: "confusion_matrix.png",
  },
  rocCurve: {
    path: "/reports/roc-curve",
    filename: "roc_curve.png",
  },
  precisionRecallCurve: {
    path: "/reports/precision-recall-curve",
    filename: "precision_recall_curve.png",
  },
  featureImportance: {
    path: "/reports/feature-importance",
    filename: "feature_importance.png",
  },
  metricsJson: {
    path: "/reports/metrics",
    filename: "metrics.json",
  },
};

export async function uploadTransactionFile(file, threshold) {
  const formData = new FormData();
  formData.append("file", file);
  if (Number.isFinite(threshold)) {
    formData.append("threshold", String(threshold));
  }

  try {
    const response = await apiClient.post("/upload/file", formData);

    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function checkBackendHealth() {
  try {
    const response = await apiClient.get("/health");
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, {
        offline: "Backend is unavailable. Please start the FastAPI server and try again.",
        fallback: "Unable to check backend health. Please try again.",
      }),
    );
  }
}

export async function getModelMetrics() {
  try {
    const response = await apiClient.get("/model/metrics");
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, {
        offline:
          "Backend is unavailable. Please start the FastAPI server to load model metrics.",
        fallback: "Unable to load model metrics. Please try again.",
      }),
    );
  }
}

export async function downloadModelReport(reportKey) {
  const report = MODEL_REPORT_DOWNLOADS[reportKey];
  if (!report) {
    throw new Error("Report download is not configured.");
  }

  try {
    const response = await apiClient.get(report.path, {
      responseType: "blob",
    });
    downloadBlob(response.data, report.filename);
  } catch (error) {
    throw new Error(await getDownloadErrorMessage(error));
  }
}

function getApiErrorMessage(error, messages = {}) {
  if (!error.response) {
    logBackendUnavailable(error);
    return (
      messages.offline ||
      "Backend is unavailable. Please start the FastAPI server and try again."
    );
  }

  const detail = error.response.data?.detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg || item.message || JSON.stringify(item))
      .join(" ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  return messages.fallback || "Upload failed. Please review the file and try again.";
}

async function getDownloadErrorMessage(error) {
  if (!error.response) {
    logBackendUnavailable(error);
    return "Backend is unavailable. Please start the FastAPI server and try again.";
  }

  if (error.response.status === 404) {
    return "Report file is unavailable. Train the model first.";
  }

  const detail = await readBlobErrorDetail(error.response.data);
  return detail || "Report download failed. Please try again.";
}

async function readBlobErrorDetail(data) {
  if (!(data instanceof Blob)) {
    return "";
  }

  try {
    const text = await data.text();
    const parsed = JSON.parse(text);
    return typeof parsed.detail === "string" ? parsed.detail : "";
  } catch {
    return "";
  }
}

function logBackendUnavailable(error) {
  console.error("FraudShield AI backend request failed", {
    apiBaseUrl: getApiBaseUrl(),
    message: error.message,
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
