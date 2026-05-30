import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ChartCard, tooltipStyle } from "./FraudTrendChart.jsx";

export default function RiskDistributionChart({ data }) {
  return (
    <ChartCard title="Risk distribution" subtitle="Share of transactions by risk level.">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={74}
            outerRadius={112}
            paddingAngle={4}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value}%`} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
