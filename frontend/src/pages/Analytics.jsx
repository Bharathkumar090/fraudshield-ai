import { useState } from "react";

import AnalyticsFilterBar from "../components/AnalyticsFilterBar.jsx";
import AmountRangeChart from "../components/AmountRangeChart.jsx";
import DashboardLayout from "../components/DashboardLayout.jsx";
import FraudTrendChart from "../components/FraudTrendChart.jsx";
import RiskDistributionChart from "../components/RiskDistributionChart.jsx";
import {
  amountRangeData,
  confidenceDistributionData,
  fraudTrendData,
  riskDistributionData,
} from "../data/analyticsMockData.js";
import { getLatestUploadResult } from "../services/uploadResultStore.js";

export default function Analytics() {
  const latestUploadResult = getLatestUploadResult();
  const usesLatestUpload = Boolean(latestUploadResult?.results?.length);
  const uploadAnalytics = usesLatestUpload
    ? buildUploadAnalytics(latestUploadResult.results)
    : null;
  const [filters, setFilters] = useState({
    dateRange: "7 Days",
    riskLevel: "All",
    prediction: "All",
  });

  function handleFilterChange(key, value) {
    setFilters((currentFilters) => ({ ...currentFilters, [key]: value }));
  }

  return (
    <DashboardLayout eyebrow="Analytics" title="Fraud Analytics">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium text-blue-700">Fraud Analytics</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">
                Analyze fraud patterns, risk distribution, and transaction behavior.
              </h1>
            </div>
            {usesLatestUpload ? (
              <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                Analytics generated from latest upload
              </span>
            ) : null}
          </div>
        </section>

        <AnalyticsFilterBar filters={filters} onFilterChange={handleFilterChange} />

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <FraudTrendChart data={uploadAnalytics?.fraudTrendData ?? fraudTrendData} />
          <RiskDistributionChart
            data={uploadAnalytics?.riskDistributionData ?? riskDistributionData}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <AmountRangeChart data={amountRangeData} />
          <ConfidenceDistribution
            data={
              uploadAnalytics?.confidenceDistributionData ??
              confidenceDistributionData
            }
            filters={filters}
            usesLatestUpload={usesLatestUpload}
          />
        </section>
      </div>
    </DashboardLayout>
  );
}

function ConfidenceDistribution({ data, filters, usesLatestUpload }) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-950">
          Prediction confidence distribution
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Confidence bands across recent predictions.
        </p>
      </div>

      <div className="space-y-5">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{item.label}</span>
              <span className="text-slate-500">{item.count.toLocaleString()}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-700"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700">
        {usesLatestUpload
          ? "Generated from latest upload probabilities"
          : `Showing ${filters.dateRange} - ${filters.riskLevel} risk - ${filters.prediction}`}
      </div>
    </article>
  );
}

function buildUploadAnalytics(results) {
  const fraudCount = results.filter((result) => result.prediction === "Fraud").length;
  const legitimateCount = Math.max(results.length - fraudCount, 0);

  return {
    fraudTrendData: [
      {
        period: "Latest upload",
        legitimate: legitimateCount,
        fraud: fraudCount,
      },
    ],
    riskDistributionData: buildRiskDistribution(results),
    confidenceDistributionData: buildConfidenceDistribution(results),
  };
}

function buildRiskDistribution(results) {
  const colors = {
    Low: "#2563eb",
    Medium: "#7c3aed",
    High: "#ef4444",
  };
  const counts = { Low: 0, Medium: 0, High: 0 };

  results.forEach((result) => {
    if (counts[result.risk_level] !== undefined) {
      counts[result.risk_level] += 1;
    }
  });

  return Object.entries(counts).map(([name, count]) => ({
    name,
    value: calculatePercent(count, results.length),
    color: colors[name],
  }));
}

function buildConfidenceDistribution(results) {
  const buckets = [
    { label: "Low confidence", min: 0, max: 0.4, count: 0 },
    { label: "Medium confidence", min: 0.4, max: 0.7, count: 0 },
    { label: "High confidence", min: 0.7, max: 1.01, count: 0 },
  ];

  results.forEach((result) => {
    const probability = Number(result.fraud_probability ?? 0);
    const confidence = Math.max(probability, 1 - probability);
    const bucket = buckets.find(
      (item) => confidence >= item.min && confidence < item.max,
    );
    if (bucket) {
      bucket.count += 1;
    }
  });

  return buckets.map(({ label, count }) => ({ label, count }));
}

function calculatePercent(value, total) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}
