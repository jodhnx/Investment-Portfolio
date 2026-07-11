"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { calculateDCA, formatCurrency, formatNumber } from "@/lib/calculations";

interface Purchase {
  id: string;
  quantity: string;
  price: string;
  fees: string;
}

export function DCACalculator() {
  const [purchases, setPurchases] = useState<Purchase[]>([
    { id: "1", quantity: "0.02", price: "80000", fees: "5" },
    { id: "2", quantity: "0.01", price: "70000", fees: "5" },
  ]);

  const result = useMemo(() => {
    return calculateDCA(
      purchases.map((p) => ({
        quantity: parseFloat(p.quantity) || 0,
        price: parseFloat(p.price) || 0,
        fees: parseFloat(p.fees) || 0,
      }))
    );
  }, [purchases]);

  const addRow = () => {
    setPurchases((p) => [
      ...p,
      { id: String(Date.now()), quantity: "", price: "", fees: "0" },
    ]);
  };

  const removeRow = (id: string) => {
    setPurchases((p) => p.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, field: keyof Purchase, value: string) => {
    setPurchases((p) =>
      p.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>DCA-Rechner (Dollar Cost Averaging)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {purchases.map((p, i) => (
            <div key={p.id} className="flex items-end gap-2">
              <div className="w-8 text-sm text-muted-foreground">#{i + 1}</div>
              <div className="flex-1">
                <Label className="text-xs">Menge</Label>
                <Input
                  type="number"
                  step="any"
                  value={p.quantity}
                  onChange={(e) => updateRow(p.id, "quantity", e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Preis (€)</Label>
                <Input
                  type="number"
                  step="any"
                  value={p.price}
                  onChange={(e) => updateRow(p.id, "price", e.target.value)}
                />
              </div>
              <div className="w-24">
                <Label className="text-xs">Gebühren</Label>
                <Input
                  type="number"
                  step="any"
                  value={p.fees}
                  onChange={(e) => updateRow(p.id, "fees", e.target.value)}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeRow(p.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={addRow}>
          <Plus className="mr-1 h-4 w-4" /> Kauf hinzufügen
        </Button>

        <div className="grid gap-3 rounded-lg bg-muted/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Gesamtmenge</p>
            <p className="text-lg font-semibold tabular-nums">{formatNumber(result.totalQty)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gesamtkosten</p>
            <p className="text-lg font-semibold tabular-nums">{formatCurrency(result.totalCost)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gebühren gesamt</p>
            <p className="text-lg font-semibold tabular-nums">{formatCurrency(result.totalFees)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ø Kaufpreis</p>
            <p className="text-lg font-semibold tabular-nums text-primary">{formatCurrency(result.avgPrice)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
