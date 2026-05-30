import { Eye } from "lucide-react";

import RiskBadge from "./RiskBadge.jsx";

export default function TransactionTable({
  transactions,
  onView,
  sourceColumnLabel = "Merchant",
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <HeaderCell>Transaction ID</HeaderCell>
              <HeaderCell>Amount</HeaderCell>
              <HeaderCell>{sourceColumnLabel}</HeaderCell>
              <HeaderCell>Time</HeaderCell>
              <HeaderCell>Fraud Probability</HeaderCell>
              <HeaderCell>Risk Level</HeaderCell>
              <HeaderCell>Prediction</HeaderCell>
              <HeaderCell>Status</HeaderCell>
              <HeaderCell>Action</HeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="bg-white transition hover:bg-blue-50/40">
                <TableCell className="font-semibold text-slate-950">
                  {transaction.id}
                </TableCell>
                <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                <TableCell>{transaction.merchant}</TableCell>
                <TableCell>{transaction.time}</TableCell>
                <TableCell>{formatProbability(transaction.fraudProbability)}</TableCell>
                <TableCell>
                  <RiskBadge value={transaction.riskLevel} />
                </TableCell>
                <TableCell>
                  <RiskBadge value={transaction.prediction} />
                </TableCell>
                <TableCell>{transaction.status}</TableCell>
                <TableCell>
                  <button
                    type="button"
                    className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                    onClick={() => onView(transaction)}
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    View
                  </button>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-semibold text-slate-950">No transactions found</p>
          <p className="mt-2 text-sm text-slate-500">
            Adjust search or filters to broaden the result set.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function HeaderCell({ children }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

function TableCell({ children, className = "" }) {
  return <td className={`px-4 py-4 text-slate-700 ${className}`}>{children}</td>;
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
