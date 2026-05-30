export default function ModelMetricCard({ label, value, helper, emphasized }) {
  return (
    <article
      className={`rounded-2xl border bg-white p-5 shadow-sm ${
        emphasized ? "border-blue-200 ring-4 ring-blue-50" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        {emphasized ? (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Key
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">{helper}</p>
    </article>
  );
}
