import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CurveCard, formatPercent } from "./RocCurveChart.jsx";

const tooltipStyle = {
  border: "1px solid #dbeafe",
  borderRadius: "12px",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
};

export default function PrecisionRecallCurveChart({ data }) {
  return (
    <CurveCard
      title="Precision-Recall Curve"
      subtitle="Precision across recall levels for rare fraud detection."
      hasData={data?.length}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="recall"
            type="number"
            domain={[0, 1]}
            stroke="#64748b"
            tickLine={false}
            axisLine={false}
            tickFormatter={formatPercent}
            label={{
              value: "Recall",
              position: "insideBottom",
              offset: -4,
              fill: "#64748b",
            }}
          />
          <YAxis
            dataKey="precision"
            type="number"
            domain={[0, 1]}
            stroke="#64748b"
            tickLine={false}
            axisLine={false}
            tickFormatter={formatPercent}
            width={52}
            label={{
              value: "Precision",
              angle: -90,
              position: "insideLeft",
              fill: "#64748b",
            }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name) => [formatPercent(value), labelName(name)]}
            labelFormatter={() => "PR point"}
          />
          <Line
            type="monotone"
            dataKey="precision"
            stroke="#7c3aed"
            strokeWidth={2}
            dot={false}
            name="Precision"
          />
        </LineChart>
      </ResponsiveContainer>
    </CurveCard>
  );
}

function labelName(name) {
  return name === "precision" ? "Precision" : name;
}
