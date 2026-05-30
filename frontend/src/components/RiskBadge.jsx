const riskStyles = {
  Low: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Medium: "bg-amber-50 text-amber-700 border-amber-100",
  High: "bg-rose-50 text-rose-700 border-rose-100",
  Fraud: "bg-violet-50 text-violet-700 border-violet-100",
  Legitimate: "bg-blue-50 text-blue-700 border-blue-100",
};

export default function RiskBadge({ value }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        riskStyles[value] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {value}
    </span>
  );
}
