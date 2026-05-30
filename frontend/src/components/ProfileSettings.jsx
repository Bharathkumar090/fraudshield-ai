export default function ProfileSettings({ profile, onProfileChange }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-950">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage workspace identity and account details.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Name"
          value={profile.name}
          onChange={(value) => onProfileChange("name", value)}
        />
        <TextField
          label="Email"
          value={profile.email}
          onChange={(value) => onProfileChange("email", value)}
        />
        <TextField
          label="Role"
          value={profile.role}
          onChange={(value) => onProfileChange("role", value)}
        />
        <TextField
          label="Organization"
          value={profile.organization}
          onChange={(value) => onProfileChange("organization", value)}
        />
      </div>

      <button
        type="button"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-700/20 transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        Save Changes
      </button>
    </section>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}
