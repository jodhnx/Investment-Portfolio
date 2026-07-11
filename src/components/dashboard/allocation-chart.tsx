"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { computePosition } from "@/lib/calculations";
import type { Portfolio } from "@/lib/types";
import { assetTypeLabel } from "@/hooks/use-price-updater";

const COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6",
  "#3b82f6", "#ec4899", "#14b8a6", "#f97316", "#64748b",
];

interface AllocationChartProps {
  portfolio: Portfolio;
}

export function AllocationChart({ portfolio }: AllocationChartProps) {
  const data = useMemo(() => {
    const byType = new Map<string, number>();
    portfolio.positions
      .filter((p) => !p.isWatchlist)
      .forEach((p) => {
        const computed = computePosition(p);
        if (computed.currentValue <= 0) return;
        const label = assetTypeLabel(p.type);
        byType.set(label, (byType.get(label) ?? 0) + computed.currentValue);
      });
    return Array.from(byType.entries()).map(([name, value]) => ({ name, value }));
  }, [portfolio]);

  if (data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Assetverteilung</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
          Noch keine Positionen
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base">Assetverteilung</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value), portfolio.currency)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
