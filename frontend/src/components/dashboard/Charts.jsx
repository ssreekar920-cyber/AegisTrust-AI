import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Card from "../ui/Card.jsx";

const CATEGORY_COLORS = {
  "Prompt Injection": "#06b6d4", // Cyan
  "Sensitive Data Leak": "#a855f7", // Purple
  "System Prompt Leakage": "#ef4444", // Red
  "Excessive Agency": "#f59e0b", // Amber
  "Improper Output": "#3b82f6", // Blue
};

export function Charts({ timeseries = [], categories = [] }) {
  // Format timeseries timestamp to 'HH:00'
  const formattedTimeseries = (timeseries || []).map((t) => ({
    ...t,
    displayTime: t.ts ? t.ts.slice(11, 16) : "",
  }));

  const totalThreats = (categories || []).reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* 24-Hour Telemetry Area Chart */}
      <Card className="lg:col-span-2 p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              24-Hour Gateway Traffic & Attack Telemetry
            </h3>
            <p className="text-xs text-slate-400">
              Hourly volume comparing legitimate requests (cyan) vs. quarantined attacks (red)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Requests
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Attacks Blocked
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedTimeseries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="attackGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="displayTime" stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#f8fafc",
                }}
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#reqGradient)"
                name="Requests"
              />
              <Area
                type="monotone"
                dataKey="attacks"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#attackGradient)"
                name="Attacks Blocked"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Threats by OWASP Category Donut Chart */}
      <Card className="p-5 flex flex-col justify-between">
        <div className="mb-2">
          <h3 className="text-sm font-bold text-slate-100">
            Threats by OWASP LLM Category
          </h3>
          <p className="text-xs text-slate-400">Distribution across top vulnerabilities</p>
        </div>

        <div className="h-64 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
              >
                {categories.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[entry.label] || "#64748b"}
                    stroke="#0f172a"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#f8fafc",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-[11px] text-slate-300">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Total Count */}
          <div className="absolute top-[37%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <span className="text-xl font-bold font-mono text-slate-100">{totalThreats}</span>
            <span className="block text-[10px] text-slate-500 font-mono uppercase">Threats</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Charts;
