"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/calculations";

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("10");

  const p = parseFloat(principal) || 0;
  const r = (parseFloat(rate) || 0) / 100;
  const t = parseFloat(years) || 0;
  const end = p * Math.pow(1 + r, t);
  const profit = end - p;

  return (
    <Card>
      <CardHeader><CardTitle>Zinseszins Rechner</CardTitle></CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Startkapital</Label><Input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="h-11" /></div>
        <div className="space-y-2"><Label>Rendite p.a. (%)</Label><Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="h-11" /></div>
        <div className="space-y-2"><Label>Jahre</Label><Input type="number" value={years} onChange={(e) => setYears(e.target.value)} className="h-11" /></div>
        <div className="flex flex-col justify-center rounded-xl bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">Endkapital</p>
          <p className="text-2xl font-bold tabular-nums">{formatCurrency(end)}</p>
          <p className="text-sm text-emerald-500">+{formatCurrency(profit)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
