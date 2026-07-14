"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Legend,
} from "recharts";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import type { AssetChartPoint } from "@/lib/asset-calculations";

interface AssetChartsPanelProps {
  data: AssetChartPoint[];
  currency?: string;
}

export function AssetChartsPanel({ data, currency = "EUR" }: AssetChartsPanelProps) {
  if (data.length < 2) {
    return (
      <div className="premium-card p-8 text-center text-sm text-muted-foreground">
        Mehr Transaktionen nötig für Diagramme.
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "12px",
    fontSize: "12px",
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Diagramme</h3>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="premium-card p-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Kurs & Ø Kaufpreis</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={64} tickFormatter={(v) => `${v}`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="price" name="Kurs" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="avgBuyPrice" name="Ø Kauf" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card p-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Bestand im Zeitverlauf</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={48} tickFormatter={(v) => formatNumber(Number(v))} />
                <Tooltip formatter={(v) => formatNumber(Number(v))} contentStyle={tooltipStyle} />
                <Line type="stepAfter" dataKey="holdings" name="Bestand" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card p-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Kauf- & Verkaufsvolumen</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={48} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="buyVolume" name="Kauf" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sellVolume" name="Verkauf" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card p-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Gewinnentwicklung</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={64} tickFormatter={(v) => `${v}`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="cumulativeProfit" name="Gewinn" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
