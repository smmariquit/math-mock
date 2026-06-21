"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BarChartVizProps {
  values?: number[];
  segments?: number[];
}

const COLORS = ["#3b82f6", "#a855f7", "#22c55e", "#f97316", "#eab308"];

const tooltipStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 8,
  fontSize: 12,
};

export function BarChartViz({ values, segments }: BarChartVizProps) {
  const pieData = useMemo(() => {
    if (!segments || segments.length !== 2) return null;
    return [
      { name: "Boys", value: segments[0]! },
      { name: "Girls", value: segments[1]! },
    ];
  }, [segments]);

  const barData = useMemo(() => {
    const data = values ?? [10, 20, 15, 25, 18];
    return data.map((value, i) => ({ label: `${i + 1}`, value }));
  }, [values]);

  if (pieData) {
    return (
      <div className="mx-auto h-52 w-full max-w-md">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={72}
              label={({ name, value }) => `${name}: ${value}`}
              labelLine={{ stroke: "#64748b" }}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="mx-auto h-52 w-full max-w-md">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={barData} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "#64748b" }}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "#64748b" }}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {barData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
