"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateDividendStats,
  computePosition,
  formatCurrency,
} from "@/lib/calculations";
import { usePortfolioStore } from "@/store/portfolio-store";
import { selectActivePortfolio } from "@/lib/store-selectors";

export default function DividendsPage() {
  const portfolio = usePortfolioStore(selectActivePortfolio);
  const addDividend = usePortfolioStore((s) => s.addDividend);
  const [positionId, setPositionId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const stockPositions = useMemo(
    () =>
      portfolio?.positions.filter(
        (p) => ["STOCK", "ETF"].includes(p.type) && !p.isWatchlist
      ) ?? [],
    [portfolio]
  );

  const allDividends = useMemo(
    () => stockPositions.flatMap((p) =>
      p.dividends.map((d) => ({ ...d, positionName: p.name, symbol: p.symbol }))
    ),
    [stockPositions]
  );

  const stats = calculateDividendStats(allDividends);

  const handleAdd = () => {
    if (!positionId || !amount) return;
    addDividend(positionId, {
      amount: parseFloat(amount),
      date: new Date(date).toISOString(),
    });
    setAmount("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dividenden</h2>
        <p className="text-sm text-muted-foreground">
          Dividenden erfassen und Auswertung anzeigen
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Jährlich</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(stats.annual)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Monatlich (Ø)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(stats.monthly)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Dividend Yield</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {portfolio
                ? (
                    (stats.annual /
                      stockPositions.reduce(
                        (s, p) => s + computePosition(p).currentValue,
                        0
                      )) *
                      100 || 0
                  ).toFixed(2)
                : "0.00"}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dividende hinzufügen</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <div className="min-w-[200px] flex-1">
            <Label>Position</Label>
            <Select value={positionId} onValueChange={(v) => v && setPositionId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Aktie wählen" />
              </SelectTrigger>
              <SelectContent>
                {stockPositions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Betrag (€)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label>Datum</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAdd}>Speichern</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historie</CardTitle>
        </CardHeader>
        <CardContent>
          {allDividends.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Dividenden erfasst.</p>
          ) : (
            <div className="space-y-2">
              {allDividends
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="font-medium">{d.positionName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(d.date).toLocaleDateString("de-DE")} · {d.symbol}
                      </p>
                    </div>
                    <p className="font-semibold tabular-nums text-green-400">
                      +{formatCurrency(d.amount)}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
