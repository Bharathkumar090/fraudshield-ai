import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

import DashboardLayout from "../components/DashboardLayout.jsx";
import StatCard from "../components/StatCard.jsx";
import {
  dashboardStats,
  fraudMixData,
  recentHighRiskTransactions,
} from "../data/dashboardMockData.js";
import {
  clearLatestUploadResult,
  getLatestUploadResult,
} from "../services/uploadResultStore.js";

export default function DashboardOverview() {
  const [latestUploadResult, setLatestUploadResult] = useState(() =>
    getLatestUploadResult(),
  );
  const usesLatestUpload = Boolean(latestUploadResult);
  const activeStats = usesLatestUpload
    ? buildUploadDashboardStats(latestUploadResult)
    : dashboardStats;
  const activeFraudMixData = usesLatestUpload
    ? buildFraudMixData(latestUploadResult)
    : fraudMixData;
  const activeHighRiskTransactions = usesLatestUpload
    ? buildHighRiskTransactions(latestUploadResult)
    : recentHighRiskTransactions;

  function handleClearLatestUpload() {
    clearLatestUploadResult();
    setLatestUploadResult(null);
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium text-blue-700">
                Today at a glance
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">
                Monitor fraud signals across recent transaction activity.
              </h1>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {usesLatestUpload ? (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                  Showing latest upload results
                </span>
              ) : null}
              {usesLatestUpload ? (
                <button
                  type="button"
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  onClick={handleClearLatestUpload}
                >
                  Clear latest upload data
                </button>
              ) : (
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Model threshold: <span className="font-semibold text-slate-950">0.71</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {activeStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Fraud vs legitimate
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Prediction mix from the current review window.
                </p>
              </div>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
                {usesLatestUpload ? "Latest upload" : "Mock data"}
              </span>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeFraudMixData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} width={76} />
                  <Tooltip
                    cursor={{ fill: "#eff6ff" }}
                    formatter={(value, name, item) => [
                      `${value}% (${item.payload.transactions.toLocaleString()} transactions)`,
                      "Share",
                    ]}
                    contentStyle={{
                      border: "1px solid #dbeafe",
                      borderRadius: "12px",
                      boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
                    }}
                  />
                  <Bar dataKey="share" fill="#2563eb" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-950">
                Recent high-risk transactions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Items queued for analyst review.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Transaction</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeHighRiskTransactions.map((transaction) => (
                    <tr key={transaction.id} className="bg-white">
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-950">
                          {transaction.id}
                        </p>
                        <p className="mt-1 text-slate-500">
                          {transaction.merchant}
                        </p>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700">
                        {transaction.amount}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {transaction.score}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>
    </DashboardLayout>
  );
}

function buildUploadDashboardStats(uploadResult) {
  return [
    {
      label: "Total Transactions",
      value: formatNumber(uploadResult.total_rows),
      change: "Latest upload",
      helper: "Rows received",
      icon: Activity,
      tone: "blue",
    },
    {
      label: "Fraud Detected",
      value: formatNumber(uploadResult.fraud_detected),
      change: formatShare(uploadResult.fraud_detected, uploadResult.valid_rows),
      helper: "Flagged rows",
      icon: AlertTriangle,
      tone: "violet",
    },
    {
      label: "High Risk",
      value: formatNumber(uploadResult.high_risk_count),
      change: formatShare(uploadResult.high_risk_count, uploadResult.valid_rows),
      helper: "Needs review",
      icon: BarChart3,
      tone: "rose",
    },
    {
      label: "Valid Rows",
      value: formatNumber(uploadResult.valid_rows),
      change: formatShare(uploadResult.valid_rows, uploadResult.total_rows),
      helper: "Passed validation",
      icon: CheckCircle2,
      tone: "slate",
    },
  ];
}

function buildFraudMixData(uploadResult) {
  const fraudCount = uploadResult.fraud_detected ?? 0;
  const validRows = uploadResult.valid_rows || uploadResult.results?.length || 0;
  const legitimateCount = Math.max(validRows - fraudCount, 0);
  return [
    {
      name: "Legitimate",
      share: calculatePercent(legitimateCount, validRows),
      transactions: legitimateCount,
    },
    {
      name: "Fraud",
      share: calculatePercent(fraudCount, validRows),
      transactions: fraudCount,
    },
  ];
}

function buildHighRiskTransactions(uploadResult) {
  const rows = uploadResult.results ?? [];
  const highRiskRows = rows
    .filter((row) => row.risk_level === "High" || row.prediction === "Fraud")
    .slice(0, 4);

  return highRiskRows.length
    ? highRiskRows.map((row) => ({
        id: `ROW-${row.row_index}`,
        merchant: row.source_file,
        amount: "N/A",
        score: Number(row.fraud_probability ?? 0).toFixed(2),
        status: row.risk_level,
      }))
    : [
        {
          id: "No high-risk rows",
          merchant: "Latest upload",
          amount: "N/A",
          score: "0.00",
          status: "Clear",
        },
      ];
}

function calculatePercent(value, total) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function formatShare(value, total) {
  return `${calculatePercent(value, total)}%`;
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString();
}
