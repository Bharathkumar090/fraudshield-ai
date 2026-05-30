import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import DashboardLayout from "../components/DashboardLayout.jsx";
import TransactionDetailDrawer from "../components/TransactionDetailDrawer.jsx";
import TransactionTable from "../components/TransactionTable.jsx";
import { initialTransactions } from "../data/transactionMockData.js";
import { getLatestUploadResult } from "../services/uploadResultStore.js";

const riskOptions = ["All", "Low", "Medium", "High"];
const predictionOptions = ["All", "Legitimate", "Fraud"];

export default function Transactions() {
  const latestUploadResult = useMemo(() => getLatestUploadResult(), []);
  const usesLatestUpload = Boolean(latestUploadResult?.results?.length);
  const [transactions, setTransactions] = useState(() =>
    usesLatestUpload
      ? mapUploadResultsToTransactions(latestUploadResult.results)
      : initialTransactions,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [predictionFilter, setPredictionFilter] = useState("All");
  const [sortBy, setSortBy] = useState("fraudProbability");
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  const selectedTransaction = transactions.find(
    (transaction) => transaction.id === selectedTransactionId,
  );

  const visibleTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return transactions
      .filter((transaction) => {
        const matchesSearch =
          !normalizedSearch ||
          transaction.id.toLowerCase().includes(normalizedSearch) ||
          transaction.merchant.toLowerCase().includes(normalizedSearch) ||
          transaction.status.toLowerCase().includes(normalizedSearch);
        const matchesRisk =
          riskFilter === "All" || transaction.riskLevel === riskFilter;
        const matchesPrediction =
          predictionFilter === "All" || transaction.prediction === predictionFilter;

        return matchesSearch && matchesRisk && matchesPrediction;
      })
      .sort((a, b) => getSortableValue(b, sortBy) - getSortableValue(a, sortBy));
  }, [predictionFilter, riskFilter, searchTerm, sortBy, transactions]);

  function updateTransactionStatus(transactionId, status) {
    setTransactions((currentTransactions) =>
      currentTransactions.map((transaction) =>
        transaction.id === transactionId ? { ...transaction, status } : transaction,
      ),
    );
  }

  return (
    <DashboardLayout eyebrow="Transactions" title="Transaction Monitoring">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium text-blue-700">
                Transaction Monitoring
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">
                Review transaction predictions, fraud probability, and risk status.
              </h1>
            </div>
            {usesLatestUpload ? (
              <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                Showing latest upload results
              </span>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 xl:grid-cols-[1fr_180px_190px_230px]">
            <label className="relative block">
              <span className="sr-only">Search transactions</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by ID, merchant, or status"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </label>

            <FilterSelect
              label="Risk level"
              value={riskFilter}
              onChange={setRiskFilter}
              options={riskOptions}
            />
            <FilterSelect
              label="Prediction"
              value={predictionFilter}
              onChange={setPredictionFilter}
              options={predictionOptions}
            />
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Sort by
              </span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              >
                <option value="fraudProbability">Fraud probability</option>
                <option value="amount">Amount</option>
              </select>
            </label>
          </div>
        </section>

        <TransactionTable
          transactions={visibleTransactions}
          onView={(transaction) => setSelectedTransactionId(transaction.id)}
          sourceColumnLabel={usesLatestUpload ? "Source File" : "Merchant"}
        />
      </div>

      <TransactionDetailDrawer
        transaction={selectedTransaction}
        onClose={() => setSelectedTransactionId(null)}
        onUpdateStatus={updateTransactionStatus}
        sourceLabel={usesLatestUpload ? "Source File" : "Merchant"}
      />
    </DashboardLayout>
  );
}

function getSortableValue(transaction, key) {
  const value = transaction[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function mapUploadResultsToTransactions(results) {
  return results.map((result) => ({
    id: `ROW-${result.row_index}`,
    amount: "N/A",
    merchant: result.source_file || "N/A",
    sourceFile: result.source_file || "N/A",
    time: "N/A",
    fraudProbability: Number(result.fraud_probability ?? 0),
    riskLevel: result.risk_level || "Low",
    prediction: result.prediction || "Legitimate",
    status: "Pending Review",
    recommendedAction: result.recommended_action || "Review transaction",
  }));
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
