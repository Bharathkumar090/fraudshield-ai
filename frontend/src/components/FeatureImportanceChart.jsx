import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function FeatureImportanceChart({ data }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-950">Feature Importance</h2>
        <p className="mt-1 text-sm text-slate-500">
          Top signals influencing fraud risk scoring.
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 24, left: 12, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              stroke="#64748b"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${Math.round(value * 100)}%`}
            />
            <YAxis
              dataKey="feature"
              type="category"
              stroke="#64748b"
              tickLine={false}
              axisLine={false}
              width={72}
            />
            <Tooltip
              formatter={(value) => `${Math.round(value * 100)}%`}
              contentStyle={{
                border: "1px solid #dbeafe",
                borderRadius: "12px",
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
              }}
            />
            <Bar dataKey="importance" fill="#2563eb" radius={[0, 10, 10, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
