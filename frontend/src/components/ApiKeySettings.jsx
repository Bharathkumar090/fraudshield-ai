import { KeyRound, Plus } from "lucide-react";

export default function ApiKeySettings({ apiKeys, onCreateKey, onRevokeKey }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">API Keys</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage service access for prediction clients.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-700/20 transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          onClick={onCreateKey}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create API Key
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <HeaderCell>Key name</HeaderCell>
                <HeaderCell>Masked key</HeaderCell>
                <HeaderCell>Created date</HeaderCell>
                <HeaderCell>Last used</HeaderCell>
                <HeaderCell>Status</HeaderCell>
                <HeaderCell>Action</HeaderCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.id} className="bg-white">
                  <TableCell className="font-semibold text-slate-950">
                    <span className="inline-flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-blue-700" aria-hidden="true" />
                      {apiKey.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <code className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {apiKey.maskedKey}
                    </code>
                  </TableCell>
                  <TableCell>{apiKey.createdDate}</TableCell>
                  <TableCell>{apiKey.lastUsed}</TableCell>
                  <TableCell>
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {apiKey.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className="inline-flex min-h-9 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                      onClick={() => onRevokeKey(apiKey.id)}
                    >
                      Revoke
                    </button>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700">
        New keys are shown as masked placeholders only. Real secrets will be handled by backend services later.
      </p>
    </section>
  );
}

function HeaderCell({ children }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

function TableCell({ children, className = "" }) {
  return <td className={`px-4 py-4 text-slate-700 ${className}`}>{children}</td>;
}
