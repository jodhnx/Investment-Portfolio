"use client";

import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateSavingsPlan, formatCurrency } from "@/lib/calculations";

export function SparplanCalculator() {
  const [monthlyRate, setMonthlyRate] = useState("500");
  const [annualReturn, setAnnualReturn] = useState("7");
  const [years, setYears] = useState("20");
  const [inflation, setInflation] = useState("2");

  const result = useMemo(
    () =>
      calculateSavingsPlan({
        monthlyRate: parseFloat(monthlyRate) || 0,
        annualReturn: parseFloat(annualReturn) || 0,
        years: parseInt(years) || 0,
        inflation: parseFloat(inflation) || 0,
      }),
    [monthlyRate, annualReturn, years, inflation]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sparplan-Rechner</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Monatliche Sparrate (€)</Label>
            <Input type="number" value={monthlyRate} onChange={(e) => setMonthlyRate(e.target.value)} />
          </div>
          <div>
            <Label>Rendite p.a. (%)</Label>
            <Input type="number" value={annualReturn} onChange={(e) => setAnnualReturn(e.target.value)} />
          </div>
          <div>
            <Label>Laufzeit (Jahre)</Label>
            <Input type="number" value={years} onChange={(e) => setYears(e.target.value)} />
          </div>
          <div>
            <Label>Inflation (%)</Label>
            <Input type="number" value={inflation} onChange={(e) => setInflation(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-3 rounded-lg bg-muted/50 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Endkapital</p>
            <p className="text-lg font-semibold tabular-nums">{formatCurrency(result.endCapital)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Eingezahlt</p>
            <p className="text-lg font-semibold tabular-nums">{formatCurrency(result.totalInvested)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gewinn (Zinseszins)</p>
            <p className="text-lg font-semibold tabular-nums text-green-400">{formatCurrency(result.profit)}</p>
          </div>
        </div>

        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result.chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="month" tickFormatter={(m) => `${Math.round(m / 12)}J`} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} name="Kapital" />
              <Area type="monotone" dataKey="invested" stroke="#94a3b8" fill="none" strokeDasharray="4 4" name="Eingezahlt" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
