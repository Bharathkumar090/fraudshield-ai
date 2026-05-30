import { useEffect, useState } from "react";

import DashboardLayout from "../components/DashboardLayout.jsx";
import UploadBox from "../components/UploadBox.jsx";
import UploadProgress from "../components/UploadProgress.jsx";
import UploadSummary from "../components/UploadSummary.jsx";
import { getModelMetrics, uploadTransactionFile } from "../services/api.js";
import { saveLatestUploadResult } from "../services/uploadResultStore.js";

const unsupportedMessage =
  "Please choose a CSV, TXT, or ZIP file. ZIP uploads should contain CSV files.";

export default function UploadTransactions() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [fileError, setFileError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadResult, setUploadResult] = useState(null);
  const [threshold, setThreshold] = useState(0.5);

  useEffect(() => {
    let isActive = true;

    async function loadDefaultThreshold() {
      try {
        const metrics = await getModelMetrics();
        const selectedThreshold = Number(metrics.selected_threshold);
        if (isActive && Number.isFinite(selectedThreshold)) {
          setThreshold(clampThreshold(selectedThreshold));
        }
      } catch {
        // Keep the local default when backend metrics are unavailable.
      }
    }

    loadDefaultThreshold();

    return () => {
      isActive = false;
    };
  }, []);

  function handleFileSelect(file, isSupported) {
    setSelectedFile(file);
    setUploadResult(null);
    setUploadError("");
    setProgress(0);

    if (!isSupported) {
      setStatus("");
      setFileError(unsupportedMessage);
      return;
    }

    setFileError("");
    setStatus("Selected");
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    setStatus("");
    setProgress(0);
    setFileError("");
    setUploadError("");
    setUploadResult(null);
  }

  async function runFraudCheck() {
    if (!selectedFile || fileError) {
      return;
    }

    setUploadError("");
    setUploadResult(null);
    setStatus("Uploading");
    setProgress(24);

    try {
      await wait(250);
      setStatus("Validating");
      setProgress(44);
      await wait(250);
      setStatus("Processing");
      setProgress(78);
      const result = await uploadTransactionFile(selectedFile, threshold);
      saveLatestUploadResult(result);
      setUploadResult(result);
      setStatus("Completed");
      setProgress(100);
    } catch (uploadError) {
      setStatus("Failed");
      setProgress(100);
      setUploadError(uploadError.message);
    }
  }

  const isLoading =
    status === "Uploading" || status === "Validating" || status === "Processing";
  const canRunCheck = selectedFile && !fileError && !isLoading;

  return (
    <DashboardLayout
      eyebrow="Upload"
      title="Upload Transactions"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-blue-700">Upload Transactions</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              Upload CSV, TXT, or ZIP files containing transaction data.
            </h1>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <UploadBox
              selectedFile={selectedFile}
              error={fileError}
              onFileSelect={handleFileSelect}
              onRemoveFile={handleRemoveFile}
            />

            <ThresholdControl value={threshold} onChange={setThreshold} />

            <button
              type="button"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-700/20 transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:w-auto"
              disabled={!canRunCheck}
              onClick={runFraudCheck}
            >
              Run Fraud Check
            </button>
          </div>

          <UploadProgress status={status} progress={progress} />
        </section>

        {uploadError ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-800 shadow-sm">
            {uploadError}
          </section>
        ) : null}

        {uploadResult ? <UploadSummary result={uploadResult} /> : null}
      </div>
    </DashboardLayout>
  );
}

function ThresholdControl({ value, onChange }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Fraud threshold
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Lower threshold catches more fraud but may increase false alerts.
          </p>
        </div>
        <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
          {value.toFixed(2)}
        </span>
      </div>

      <input
        type="range"
        min="0.01"
        max="0.99"
        step="0.01"
        value={value}
        className="mt-5 w-full accent-blue-700"
        onChange={(event) => onChange(clampThreshold(Number(event.target.value)))}
      />

      <div className="mt-2 flex justify-between text-xs font-medium text-slate-400">
        <span>0.01</span>
        <span>0.99</span>
      </div>
    </section>
  );
}

function clampThreshold(value) {
  if (!Number.isFinite(value)) {
    return 0.5;
  }

  return Math.min(0.99, Math.max(0.01, value));
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}
