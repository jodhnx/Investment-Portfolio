"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateTrade, formatCurrency } from "@/lib/calculations";

export function BreakEvenCalculator() {
  const [buyPrice, setBuyPrice] = useState("100");
  const [quantity, setQuantity] = useState("10");
  const [fees, setFees] = useState("5");
  const [taxes, setTaxes] = useState("0");

  const result = calculateTrade({
    buyPrice: parseFloat(buyPrice) || 0,
    sellPrice: parseFloat(buyPrice) || 0,
    quantity: parseFloat(quantity) || 0,
    fees: parseFloat(fees) || 0,
    taxes: parseFloat(taxes) || 0,
  });

  return (
    <Card>
      <CardHeader><CardTitle>Break-Even Rechner</CardTitle></CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Kaufpreis</Label><Input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} className="h-11" /></div>
        <div className="space-y-2"><Label>Menge</Label><Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="h-11" /></div>
        <div className="space-y-2"><Label>Gebühren</Label><Input type="number" value={fees} onChange={(e) => setFees(e.target.value)} className="h-11" /></div>
        <div className="space-y-2"><Label>Steuern</Label><Input type="number" value={taxes} onChange={(e) => setTaxes(e.target.value)} className="h-11" /></div>
        <div className="col-span-full rounded-xl bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">Break-Even Preis</p>
          <p className="text-2xl font-bold tabular-nums">{formatCurrency(result.breakEven)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
