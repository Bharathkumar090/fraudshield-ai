export default function NotificationSettings({ preferences, onToggle }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-950">Notifications</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose which operational events should trigger alerts.
        </p>
      </div>

      <div className="space-y-3">
        {preferences.map((preference) => (
          <label
            key={preference.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <span className="text-sm font-semibold text-slate-800">
              {preference.label}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={preference.enabled}
              className={`relative h-7 w-12 rounded-full transition ${
                preference.enabled ? "bg-blue-700" : "bg-slate-300"
              }`}
              onClick={() => onToggle(preference.id)}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  preference.enabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          </label>
        ))}
      </div>
    </section>
  );
}
