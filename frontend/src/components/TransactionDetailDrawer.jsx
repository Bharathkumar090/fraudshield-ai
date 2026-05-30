import { X } from "lucide-react";

import RiskBadge from "./RiskBadge.jsx";

export default function TransactionDetailDrawer({
  transaction,
  onClose,
  onUpdateStatus,
  sourceLabel = "Merchant",
}) {
  if (!transaction) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/30"
        aria-label="Close transaction details"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-700">Transaction Detail</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                {transaction.id}
              </h2>
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
              aria-label="Close drawer"
              onClick={onClose}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 px-6 py-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Amount" value={formatCurrency(transaction.amount)} />
            <DetailItem label={sourceLabel} value={transaction.merchant} />
            <DetailItem label="Time" value={transaction.time} />
            <DetailItem
              label="Fraud probability"
              value={formatProbability(transaction.fraudProbability)}
            />
            <DetailItem
              label="Risk level"
              value={<RiskBadge value={transaction.riskLevel} />}
            />
            <DetailItem
              label="Prediction"
              value={<RiskBadge value={transaction.prediction} />}
            />
            <DetailItem label="Review status" value={transaction.status} />
          </dl>

          <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">Recommended action</p>
            <p className="mt-2 text-sm leading-6 text-blue-900">
              {transaction.recommendedAction}
            </p>
          </section>
        </div>

        <div className="border-t border-slate-200 px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <ActionButton onClick={() => onUpdateStatus(transaction.id, "Reviewed")}>
              Mark Reviewed
            </ActionButton>
            <ActionButton onClick={() => onUpdateStatus(transaction.id, "Approved")}>
              Approve
            </ActionButton>
            <ActionButton tone="danger" onClick={() => onUpdateStatus(transaction.id, "Blocked")}>
              Block
            </ActionButton>
          </div>
        </div>
      </aside>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function ActionButton({ children, onClick, tone = "default" }) {
  const toneClass =
    tone === "danger"
      ? "border-rose-200 text-rose-700 hover:bg-rose-50"
      : "border-slate-200 text-slate-700 hover:border-blue-200 hover:text-blue-700";

  return (
    <button
      type="button"
      className={`inline-flex min-h-11 items-center justify-center rounded-lg border bg-white px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${toneClass}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function formatCurrency(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return value || "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatProbability(value) {
  return `${Math.round(value * 100)}%`;
}
