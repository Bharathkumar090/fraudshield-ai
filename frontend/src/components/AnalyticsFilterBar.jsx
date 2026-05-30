const dateRangeOptions = ["Today", "7 Days", "30 Days", "90 Days"];
const riskOptions = ["All", "Low", "Medium", "High"];
const predictionOptions = ["All", "Legitimate", "Fraud"];

export default function AnalyticsFilterBar({ filters, onFilterChange }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        <FilterSelect
          label="Date range"
          value={filters.dateRange}
          options={dateRangeOptions}
          onChange={(value) => onFilterChange("dateRange", value)}
        />
        <FilterSelect
          label="Risk level"
          value={filters.riskLevel}
          options={riskOptions}
          onChange={(value) => onFilterChange("riskLevel", value)}
        />
        <FilterSelect
          label="Prediction"
          value={filters.prediction}
          options={predictionOptions}
          onChange={(value) => onFilterChange("prediction", value)}
        />
      </div>
    </section>
  );
}

function FilterSelect({ label, value, options, onChange }) {
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
