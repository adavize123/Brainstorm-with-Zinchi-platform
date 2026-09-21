"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface ScorePoint {
  name: string;
  percent: number;
}

export function ProgressChart({ data }: { data: ScorePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
        <Tooltip
          formatter={(value: number) => [`${value}%`, "Score"]}
          contentStyle={{ borderRadius: 8, fontSize: 13 }}
        />
        <Bar dataKey="percent" fill="hsl(230 55% 24%)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
