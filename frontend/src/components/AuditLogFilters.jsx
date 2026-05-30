import { Search } from "lucide-react";

const eventTypeOptions = [
  "All",
  "Login",
  "Upload",
  "Prediction",
  "Export",
  "Admin",
  "API Key",
];

const statusOptions = ["All", "Success", "Failed", "Warning"];

export default function AuditLogFilters({ filters, onFilterChange }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_220px_200px]">
        <label className="relative block">
          <span className="sr-only">Search audit logs</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onFilterChange("search", event.target.value)}
            placeholder="Search by user, action, or endpoint"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </label>

        <FilterSelect
          label="Event type"
          value={filters.eventType}
          options={eventTypeOptions}
          onChange={(value) => onFilterChange("eventType", value)}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          options={statusOptions}
          onChange={(value) => onFilterChange("status", value)}
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
