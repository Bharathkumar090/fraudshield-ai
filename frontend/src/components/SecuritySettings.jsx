import { ShieldCheck } from "lucide-react";

export default function SecuritySettings({ security }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-950">Security</h2>
        <p className="mt-1 text-sm text-slate-500">
          Review account protection and session posture.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SecurityItem label="Password last updated" value={security.passwordLastUpdated} />
        <SecurityItem label="Two-factor authentication" value={security.twoFactorStatus} />
        <SecurityItem label="Active sessions" value={String(security.activeSessions)} />
      </div>

      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Security status: {security.securityStatus}
            </p>
            <p className="mt-1 text-sm text-blue-800">
              Account controls are aligned with current security preferences.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SecurityItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
