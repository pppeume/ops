"use client";

import {
  Area,
  AreaChart,
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

const fmt = (n: number) =>
  Math.abs(n) >= 100_000_000
    ? `${(n / 100_000_000).toFixed(1)}억`
    : `${Math.round(n / 10_000).toLocaleString("ko-KR")}만`;

const axis = { fontSize: 11, fill: "#8591a9" };

export function RevenueAreaChart({
  data,
}: {
  data: { month: string; income: number; cost: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3366ff" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#3366ff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gCost" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" vertical={false} />
        <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} />
        <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={fmt} width={48} />
        <Tooltip
          formatter={(v: number, n) => [fmt(v), n === "income" ? "입금" : "지급"]}
          contentStyle={{ borderRadius: 12, border: "1px solid #eceef2", fontSize: 12 }}
        />
        <Area type="monotone" dataKey="income" stroke="#3366ff" strokeWidth={2} fill="url(#gIncome)" />
        <Area type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2} fill="url(#gCost)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const PIE_COLORS = ["#94a3b8", "#3366ff", "#10b981", "#8b5cf6"];

export function StatusDonut({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={58}
          outerRadius={84}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number, n) => [`${v}건`, n]}
          contentStyle={{ borderRadius: 12, border: "1px solid #eceef2", fontSize: 12 }}
        />
        <text x="50%" y="46%" textAnchor="middle" className="fill-ink-900" style={{ fontSize: 22, fontWeight: 700 }}>
          {total}
        </text>
        <text x="50%" y="58%" textAnchor="middle" className="fill-ink-400" style={{ fontSize: 11 }}>
          총 발주
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RegionBarChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" horizontal={false} />
        <XAxis type="number" tick={axis} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={axis} axisLine={false} tickLine={false} width={64} />
        <Tooltip
          formatter={(v: number) => [`${v}건`, "발주"]}
          cursor={{ fill: "#f6f7f9" }}
          contentStyle={{ borderRadius: 12, border: "1px solid #eceef2", fontSize: 12 }}
        />
        <Bar dataKey="value" fill="#3366ff" radius={[0, 6, 6, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PartnerBarChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" vertical={false} />
        <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} interval={0} angle={-12} textAnchor="end" height={50} />
        <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={fmt} width={48} />
        <Tooltip
          formatter={(v: number) => [fmt(v), "지급액"]}
          cursor={{ fill: "#f6f7f9" }}
          contentStyle={{ borderRadius: 12, border: "1px solid #eceef2", fontSize: 12 }}
        />
        <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
