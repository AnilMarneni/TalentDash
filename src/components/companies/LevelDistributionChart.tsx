"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { mapLevelToBadge, formatSalaryCompact } from "../../lib/ui-helpers";
import { LevelDistributionItem } from "../../types/company";

interface ChartProps {
  data: LevelDistributionItem[];
  currency: string;
}

export default function LevelDistributionChart({ data, currency }: ChartProps) {
  // Map level strings to UI badge names for the chart labels
  const chartData = data.map((item) => ({
    ...item,
    displayName: mapLevelToBadge(item.level),
  }));

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as LevelDistributionItem & { displayName: string };
      return (
        <div className="bg-zinc-900 text-white p-3 rounded-lg border border-zinc-800 text-xs shadow-lg">
          <p className="font-bold mb-1.5">{dataPoint.displayName}</p>
          <p className="font-mono mb-1 text-zinc-300">
            Median Comp: <span className="font-bold text-rose-400">{formatSalaryCompact(dataPoint.median_compensation, currency)}</span>
          </p>
          <p className="font-mono mb-1 text-zinc-300">
            Average Comp: <span className="font-bold">{formatSalaryCompact(dataPoint.average_compensation, currency)}</span>
          </p>
          <p className="text-zinc-400">
            Submission count: <span className="font-semibold">{dataPoint.count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
          <XAxis
            dataKey="displayName"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#71717A", fontSize: 12, fontWeight: 500 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatSalaryCompact(value, currency)}
            tick={{ fill: "#71717A", fontSize: 12, fontWeight: 500 }}
          />
          <Tooltip content={customTooltip} cursor={{ fill: "rgba(244, 63, 94, 0.04)" }} />
          <Bar
            dataKey="median_compensation"
            fill="#FF5A5F"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
