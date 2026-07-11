"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortfolioStore } from "@/store/portfolio-store";
import {
  selectActivePortfolio,
  selectSnapshotsForActivePortfolio,
} from "@/lib/store-selectors";
import {
  computePortfolioStats,
  computePosition,
  formatCurrency,
  formatPercent,
} from "@/lib/calculations";
import Link from "next/link";
import { format, subMonths } from "date-fns";
import { de } from "date-fns/locale";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function PerformancePage() {
  const portfolio = usePortfolioStore(selectActivePortfolio);
  const snapshots = usePortfolioStore(selectSnapshotsForActivePortfolio);
  const [range, setRange] = useState<"month" | "year" | "all">("year");

  const stats = portfolio ? computePortfolioStats(portfolio) : null;

  const valueHistory = useMemo(() => {
    const data = snapshots.map((s) => ({
      date: format(new Date(s.date), "dd.MM.yy", { locale: de }),
      value: s.totalValue,
      invested: s.invested,
      profit: s.totalValue - s.invested,
    }));
    if (stats) {
      data.push({
        date: "Heute",
        value: stats.totalValue,
        invested: stats.totalInvested,
        profit: stats.profitLoss,
      });
    }
    return data;
  }, [snapshots, stats]);

  const assetPerformance = useMemo(() => {
    if (!portfolio) return [];
    return portfolio.positions
      .filter((p) => !p.isWatchlist)
      .map((p) => {
        const c = computePosition(p);
        return { name: p.symbol, profit: c.profitLoss, percent: c.profitLossPercent };
      })
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);
  }, [portfolio]);

  const monthlyCompare = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(now, i);
      const key = format(d, "yyyy-MM");
      const label = format(d, "MMM", { locale: de });
      const snap = snapshots.filter((s) => format(new Date(s.date), "yyyy-MM") === key).pop();
      months.push({
        month: label,
        value: snap?.totalValue ?? 0,
        invested: snap?.invested ?? 0,
      });
    }
    return months;
  }, [snapshots]);

  const categoryBreakdown = useMemo(() => {
    if (!portfolio) return [];
    const map = new Map<string, number>();
    portfolio.positions
      .filter((p) => !p.isWatchlist)
      .forEach((p) => {
        const c = computePosition(p);
        const cat = portfolio.categories.find((x) => x.id === p.categoryId)?.name ?? p.type;
        map.set(cat, (map.get(cat) ?? 0) + c.currentValue);
      });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [portfolio]);

  if (!portfolio || !stats) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <Link href="/onboarding" className="text-primary hover:underline">Onboarding starten</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Performance</h2>
        <p className="text-sm text-muted-foreground">
          Portfolioentwicklung, Gewinnentwicklung und Vergleiche
        </p>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Gesamtwert", value: formatCurrency(stats.totalValue, portfolio.currency) },
          { label: "Gewinn", value: formatCurrency(stats.profitLoss, portfolio.currency) },
          { label: "ROI", value: formatPercent(stats.profitLossPercent) },
          { label: "Netto", value: formatCurrency(stats.netProfit, portfolio.currency) },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border/60 bg-card/80">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-lg font-bold tabular-nums">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={range} onValueChange={(v) => setRange(v as typeof range)}>
        <TabsList className="h-10">
          <TabsTrigger value="month">Monat</TabsTrigger>
          <TabsTrigger value="year">Jahr</TabsTrigger>
          <TabsTrigger value="all">Gesamt</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Portfolioentwicklung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={valueHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={70} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v), portfolio.currency)} />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Gewinnentwicklung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={valueHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={70} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v), portfolio.currency)} />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Monatsvergleich</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyCompare}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={70} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v), portfolio.currency)} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Gewinn nach Kategorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(Number(v), portfolio.currency)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Asset-Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v), portfolio.currency)} />
                <Bar dataKey="profit" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
