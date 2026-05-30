import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function FraudTrendChart({ data }) {
  return (
    <ChartCard
      title="Fraud trend over time"
      subtitle="Legitimate and fraud counts across the selected range."
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="period" stroke="#64748b" tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" tickLine={false} axisLine={false} width={62} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="legitimate"
            stroke="#2563eb"
            fill="#dbeafe"
            strokeWidth={2}
            name="Legitimate"
          />
          <Area
            type="monotone"
            dataKey="fraud"
            stroke="#7c3aed"
            fill="#ede9fe"
            strokeWidth={2}
            name="Fraud"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ChartCard({ title, subtitle, children }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="h-80">{children}</div>
    </article>
  );
}

export const tooltipStyle = {
  border: "1px solid #dbeafe",
  borderRadius: "12px",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
};
