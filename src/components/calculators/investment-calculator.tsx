"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateTrade, formatCurrency, formatPercent } from "@/lib/calculations";

export function InvestmentCalculator() {
  const [buyPrice, setBuyPrice] = useState("100");
  const [sellPrice, setSellPrice] = useState("150");
  const [quantity, setQuantity] = useState("10");
  const [fees, setFees] = useState("5");
  const [taxes, setTaxes] = useState("0");

  const result = useMemo(
    () =>
      calculateTrade({
        buyPrice: parseFloat(buyPrice) || 0,
        sellPrice: parseFloat(sellPrice) || 0,
        quantity: parseFloat(quantity) || 0,
        fees: parseFloat(fees) || 0,
        taxes: parseFloat(taxes) || 0,
      }),
    [buyPrice, sellPrice, quantity, fees, taxes]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment-Rechner</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Kaufpreis (€)</Label>
            <Input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
          </div>
          <div>
            <Label>Verkaufspreis (€)</Label>
            <Input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
          </div>
          <div>
            <Label>Anzahl</Label>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div>
            <Label>Gebühren (€)</Label>
            <Input type="number" value={fees} onChange={(e) => setFees(e.target.value)} />
          </div>
          <div>
            <Label>Steuern (€)</Label>
            <Input type="number" value={taxes} onChange={(e) => setTaxes(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-3 rounded-lg bg-muted/50 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Bruttogewinn</p>
            <p className="text-lg font-semibold tabular-nums">{formatCurrency(result.gross)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nach Gebühren</p>
            <p className="text-lg font-semibold tabular-nums">{formatCurrency(result.afterFees)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nach Steuern</p>
            <p className="text-lg font-semibold tabular-nums">{formatCurrency(result.afterTaxes)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rendite</p>
            <p className="text-lg font-semibold tabular-nums">{formatPercent(result.percent)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Break-Even Preis</p>
            <p className="text-lg font-semibold tabular-nums">{formatCurrency(result.breakEven)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
