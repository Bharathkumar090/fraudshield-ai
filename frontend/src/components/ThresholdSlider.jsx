export default function ThresholdSlider({ value, onChange }) {
  const guidance =
    value < 0.5
      ? "Lower threshold catches more fraud but may increase false alerts."
      : "Higher threshold reduces alerts but may miss fraud.";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Fraud Threshold
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tune when a prediction is treated as fraud.
          </p>
        </div>
        <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          Current threshold: {value.toFixed(2)}
        </div>
      </div>

      <div className="mt-7">
        <input
          type="range"
          min="0.1"
          max="0.9"
          step="0.01"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-700"
          aria-label="Fraud threshold"
        />
        <div className="mt-3 flex justify-between text-xs font-medium text-slate-400">
          <span>0.10</span>
          <span>0.50</span>
          <span>0.90</span>
        </div>
      </div>

      <p className="mt-6 rounded-xl bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700">
        {guidance}
      </p>
    </article>
  );
}
