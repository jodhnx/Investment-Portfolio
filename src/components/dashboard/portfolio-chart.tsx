"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/calculations";
import type { PortfolioSnapshot } from "@/lib/types";
import { usePortfolioStore } from "@/store/portfolio-store";
import { format, subDays, subMonths, subYears } from "date-fns";
import { de } from "date-fns/locale";

type Range = "day" | "week" | "month" | "year" | "all";

interface PortfolioChartProps {
  snapshots: PortfolioSnapshot[];
  currentValue: number;
  invested: number;
  currency?: string;
}

function filterByRange(snapshots: PortfolioSnapshot[], range: Range) {
  const now = new Date();
  const cutoffs: Record<Range, Date> = {
    day: subDays(now, 1),
    week: subDays(now, 7),
    month: subMonths(now, 1),
    year: subYears(now, 1),
    all: new Date(0),
  };
  return snapshots.filter((s) => new Date(s.date) >= cutoffs[range]);
}

export function PortfolioChart({
  snapshots,
  currentValue,
  invested,
  currency = "EUR",
}: PortfolioChartProps) {
  const [range, setRange] = useState<Range>("month");
  const addSnapshot = usePortfolioStore((s) => s.addSnapshot);
  const activePortfolioId = usePortfolioStore((s) => s.activePortfolioId);

  const chartData = useMemo(() => {
    const filtered = filterByRange(snapshots, range);
    const data = filtered.map((s) => ({
      date: format(new Date(s.date), "dd.MM", { locale: de }),
      value: s.totalValue,
      invested: s.invested,
    }));

    if (data.length === 0) {
      return [
        { date: "Start", value: invested, invested },
        { date: "Heute", value: currentValue, invested },
      ];
    }

    data.push({
      date: "Heute",
      value: currentValue,
      invested,
    });

    return data;
  }, [snapshots, range, currentValue, invested]);

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Portfolioentwicklung</CardTitle>
        <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
          <TabsList className="h-8">
            <TabsTrigger value="day" className="text-xs px-2">Tag</TabsTrigger>
            <TabsTrigger value="week" className="text-xs px-2">Woche</TabsTrigger>
            <TabsTrigger value="month" className="text-xs px-2">Monat</TabsTrigger>
            <TabsTrigger value="year" className="text-xs px-2">Jahr</TabsTrigger>
            <TabsTrigger value="all" className="text-xs px-2">Gesamt</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatCurrency(v, currency).replace(/\s/g, "")}
                width={80}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value), currency)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="url(#colorValue)"
                strokeWidth={2}
                name="Wert"
              />
              <Area
                type="monotone"
                dataKey="invested"
                stroke="hsl(var(--muted-foreground))"
                fill="none"
                strokeWidth={1}
                strokeDasharray="4 4"
                name="Investiert"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <button
          type="button"
          className="mt-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => addSnapshot(activePortfolioId)}
        >
          Snapshot speichern
        </button>
      </CardContent>
    </Card>
  );
}
