const cells = [
  {
    key: "trueLegitimate",
    label: "True Legitimate",
    tone: "bg-blue-50 text-blue-900 border-blue-100",
  },
  {
    key: "falseFraudAlert",
    label: "False Fraud Alert",
    tone: "bg-amber-50 text-amber-900 border-amber-100",
  },
  {
    key: "missedFraud",
    label: "Missed Fraud",
    tone: "bg-rose-50 text-rose-900 border-rose-100",
  },
  {
    key: "correctFraudDetection",
    label: "Correct Fraud Detection",
    tone: "bg-violet-50 text-violet-900 border-violet-100",
  },
];

export default function ConfusionMatrix({
  data,
  title = "Confusion Matrix",
  subtitle = "Prediction outcomes from the current evaluation window.",
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {cells.map((cell) => (
          <div key={cell.key} className={`rounded-2xl border p-5 ${cell.tone}`}>
            <p className="text-sm font-semibold">{cell.label}</p>
            <p className="mt-3 text-3xl font-semibold">
              {data[cell.key].toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
