"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatPercent } from "@/lib/calculations";

export function ROICalculator() {
  const [invested, setInvested] = useState("10000");
  const [current, setCurrent] = useState("12500");
  const [fees, setFees] = useState("50");

  const inv = parseFloat(invested) || 0;
  const cur = parseFloat(current) || 0;
  const f = parseFloat(fees) || 0;
  const profit = cur - inv - f;
  const roi = inv > 0 ? (profit / inv) * 100 : 0;

  return (
    <Card>
      <CardHeader><CardTitle>ROI Rechner</CardTitle></CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Investiert</Label><Input type="number" value={invested} onChange={(e) => setInvested(e.target.value)} className="h-11" /></div>
        <div className="space-y-2"><Label>Aktueller Wert</Label><Input type="number" value={current} onChange={(e) => setCurrent(e.target.value)} className="h-11" /></div>
        <div className="space-y-2"><Label>Gebühren</Label><Input type="number" value={fees} onChange={(e) => setFees(e.target.value)} className="h-11" /></div>
        <div className="flex flex-col justify-center rounded-xl bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">ROI</p>
          <p className="text-2xl font-bold text-emerald-500">{formatPercent(roi)}</p>
          <p className="text-sm tabular-nums">{formatCurrency(profit)} Gewinn</p>
        </div>
      </CardContent>
    </Card>
  );
}
