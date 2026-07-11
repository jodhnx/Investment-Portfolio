"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import type { PortfolioSnapshot } from "@/lib/types";
import { format, subMonths, startOfMonth } from "date-fns";
import { de } from "date-fns/locale";

interface MonthlyPerformanceProps {
  snapshots: PortfolioSnapshot[];
  currency?: string;
}

export function MonthlyPerformance({ snapshots, currency = "EUR" }: MonthlyPerformanceProps) {
  const data = useMemo(() => {
    const months: { key: string; label: string; value: number; invested: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const key = format(monthStart, "yyyy-MM");
      const label = format(monthStart, "MMM yy", { locale: de });
      const inMonth = snapshots.filter(
        (s) => format(new Date(s.date), "yyyy-MM") === key
      );
      const last = inMonth[inMonth.length - 1];
      months.push({
        key,
        label,
        value: last?.totalValue ?? 0,
        invested: last?.invested ?? 0,
      });
    }

    return months.map((m, i, arr) => ({
      ...m,
      change: i > 0 && arr[i - 1].value > 0 ? m.value - arr[i - 1].value : 0,
    }));
  }, [snapshots]);

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Performance nach Monat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                width={70}
                tickFormatter={(v) => formatCurrency(v, currency).replace(/\s/g, "")}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value), currency)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="change" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Monatsänderung" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
