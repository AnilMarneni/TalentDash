"use client";

import { useState, useEffect } from "react";
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = data.map((item) => ({
    ...item,
    displayName: mapLevelToBadge(item.level),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as LevelDistributionItem & { displayName: string };
      return (
        <div className="bg-white border border-zinc-200/80 p-3 rounded-lg text-xs shadow-sm">
          <p className="font-bold text-zinc-950 mb-1">{dataPoint.displayName}</p>
          <p className="font-mono text-zinc-600 mb-0.5">
            Median: <span className="font-bold text-rose-600">{formatSalaryCompact(dataPoint.median_compensation, currency)}</span>
          </p>
          <p className="font-mono text-zinc-600 mb-0.5">
            Average: <span className="font-semibold text-zinc-800">{formatSalaryCompact(dataPoint.average_compensation, currency)}</span>
          </p>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1.5">
            {dataPoint.count} verified postings
          </p>
        </div>
      );
    }
    return null;
  };

  if (!isMounted) {
    // Professional Chart Skeleton Loader during SSR/Hydration
    return (
      <div className="w-full h-80 bg-zinc-50/50 border border-zinc-200/60 rounded-xl animate-pulse flex items-end justify-between p-8 gap-4">
        <div className="w-full bg-zinc-200 rounded-sm h-[20%]"></div>
        <div className="w-full bg-zinc-200 rounded-sm h-[45%]"></div>
        <div className="w-full bg-zinc-200 rounded-sm h-[75%]"></div>
        <div className="w-full bg-zinc-200 rounded-sm h-[30%]"></div>
        <div className="w-full bg-zinc-200 rounded-sm h-[60%]"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F4" />
          <XAxis
            dataKey="displayName"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#A1A1AA", fontSize: 10, fontWeight: 600 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatSalaryCompact(value, currency)}
            tick={{ fill: "#A1A1AA", fontSize: 10, fontWeight: 600 }}
          />
          <Tooltip content={customTooltip} cursor={{ fill: "rgba(244, 63, 94, 0.02)" }} />
          <Bar
            dataKey="median_compensation"
            fill="#F43F5E"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
