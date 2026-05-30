const eventTypeStyles = {
  Login: "border-blue-100 bg-blue-50 text-blue-700",
  Upload: "border-violet-100 bg-violet-50 text-violet-700",
  Prediction: "border-indigo-100 bg-indigo-50 text-indigo-700",
  Export: "border-slate-200 bg-slate-50 text-slate-700",
  Admin: "border-amber-100 bg-amber-50 text-amber-700",
  "API Key": "border-cyan-100 bg-cyan-50 text-cyan-700",
};

const statusStyles = {
  Success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  Failed: "border-rose-100 bg-rose-50 text-rose-700",
  Warning: "border-amber-100 bg-amber-50 text-amber-700",
};

export default function AuditLogTable({ events }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <HeaderCell>Timestamp</HeaderCell>
              <HeaderCell>User</HeaderCell>
              <HeaderCell>Role</HeaderCell>
              <HeaderCell>Event Type</HeaderCell>
              <HeaderCell>Action</HeaderCell>
              <HeaderCell>Endpoint</HeaderCell>
              <HeaderCell>IP Address</HeaderCell>
              <HeaderCell>Status</HeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((event) => (
              <tr key={event.id} className="bg-white transition hover:bg-blue-50/40">
                <TableCell>{event.timestamp}</TableCell>
                <TableCell className="font-semibold text-slate-950">
                  {event.user}
                </TableCell>
                <TableCell>{event.role}</TableCell>
                <TableCell>
                  <Badge value={event.eventType} styles={eventTypeStyles} />
                </TableCell>
                <TableCell>{event.action}</TableCell>
                <TableCell>
                  <code className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                    {event.endpoint}
                  </code>
                </TableCell>
                <TableCell>{event.ipAddress}</TableCell>
                <TableCell>
                  <Badge value={event.status} styles={statusStyles} />
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {events.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-semibold text-slate-950">No audit events found</p>
          <p className="mt-2 text-sm text-slate-500">
            Adjust search or filters to broaden the result set.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function HeaderCell({ children }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

function TableCell({ children, className = "" }) {
  return <td className={`px-4 py-4 text-slate-700 ${className}`}>{children}</td>;
}

function Badge({ value, styles }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[value] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {value}
    </span>
  );
}
