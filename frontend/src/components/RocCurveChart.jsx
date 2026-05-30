import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  border: "1px solid #dbeafe",
  borderRadius: "12px",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
};

export default function RocCurveChart({ data }) {
  return (
    <CurveCard
      title="ROC Curve"
      subtitle="True positive rate compared with false positive rate."
      hasData={data?.length}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="fpr"
            type="number"
            domain={[0, 1]}
            stroke="#64748b"
            tickLine={false}
            axisLine={false}
            tickFormatter={formatPercent}
            label={{
              value: "False positive rate",
              position: "insideBottom",
              offset: -4,
              fill: "#64748b",
            }}
          />
          <YAxis
            dataKey="tpr"
            type="number"
            domain={[0, 1]}
            stroke="#64748b"
            tickLine={false}
            axisLine={false}
            tickFormatter={formatPercent}
            width={52}
            label={{
              value: "True positive rate",
              angle: -90,
              position: "insideLeft",
              fill: "#64748b",
            }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name) => [formatPercent(value), labelName(name)]}
            labelFormatter={() => "ROC point"}
          />
          <Line
            type="monotone"
            dataKey="tpr"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="True positive rate"
          />
        </LineChart>
      </ResponsiveContainer>
    </CurveCard>
  );
}

export function CurveCard({ title, subtitle, hasData, children }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {hasData ? (
        <div className="h-80">{children}</div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-600">
          Curve data is unavailable. Retrain the model to generate curve points.
        </div>
      )}
    </article>
  );
}

export function formatPercent(value) {
  return `${Math.round(Number(value ?? 0) * 100)}%`;
}

function labelName(name) {
  return name === "tpr" ? "True positive rate" : name;
}
