import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard, tooltipStyle } from "./FraudTrendChart.jsx";

export default function AmountRangeChart({ data }) {
  return (
    <ChartCard title="Fraud by amount range" subtitle="Flagged transactions grouped by amount.">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="range" stroke="#64748b" tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" tickLine={false} axisLine={false} width={48} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="fraud" name="Fraud" fill="#2563eb" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
