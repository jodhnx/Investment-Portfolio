"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/calculations";

export function InflationCalculator() {
  const [amount, setAmount] = useState("10000");
  const [inflation, setInflation] = useState("2.5");
  const [years, setYears] = useState("10");

  const a = parseFloat(amount) || 0;
  const i = (parseFloat(inflation) || 0) / 100;
  const y = parseFloat(years) || 0;
  const futureValue = a / Math.pow(1 + i, y);
  const loss = a - futureValue;

  return (
    <Card>
      <CardHeader><CardTitle>Inflationsrechner</CardTitle></CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Heutiger Betrag</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-11" /></div>
        <div className="space-y-2"><Label>Inflation p.a. (%)</Label><Input type="number" value={inflation} onChange={(e) => setInflation(e.target.value)} className="h-11" /></div>
        <div className="space-y-2"><Label>Jahre</Label><Input type="number" value={years} onChange={(e) => setYears(e.target.value)} className="h-11" /></div>
        <div className="flex flex-col justify-center rounded-xl bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">Reale Kaufkraft</p>
          <p className="text-2xl font-bold tabular-nums">{formatCurrency(futureValue)}</p>
          <p className="text-sm text-red-500">−{formatCurrency(loss)} Kaufkraftverlust</p>
        </div>
      </CardContent>
    </Card>
  );
}
