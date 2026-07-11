"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  computePortfolioStats,
  computeTransactionStats,
  computePosition,
  formatCurrency,
  formatPercent,
} from "@/lib/calculations";
import { usePortfolioStore } from "@/store/portfolio-store";

export default function StatisticsPage() {
  const portfolio = usePortfolioStore((s) => s.getActivePortfolio());

  const stats = useMemo(() => {
    if (!portfolio) return null;

    const portfolioStats = computePortfolioStats(portfolio);
    let realized = 0;
    let unrealized = 0;

    portfolio.positions
      .filter((p) => !p.isWatchlist)
      .forEach((p) => {
        const txStats = computeTransactionStats(p.transactions);
        const computed = computePosition(p);
        realized += txStats.realizedProfit;
        unrealized += computed.currentValue - computed.invested;
      });

    return { ...portfolioStats, realized, unrealized };
  }, [portfolio]);

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gewinnstatistik</h2>
        <p className="text-sm text-muted-foreground">
          Realisierter und unrealisierter Gewinn im Überblick
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Gesamt G/V</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(stats.profitLoss)}</p>
            <p className="text-sm text-muted-foreground">{formatPercent(stats.profitLossPercent)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Realisierter Gewinn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-green-400">
              {formatCurrency(stats.realized)}
            </p>
            <p className="text-xs text-muted-foreground">Aus Verkäufen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Unrealisierter Gewinn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(stats.unrealized)}
            </p>
            <p className="text-xs text-muted-foreground">Offene Positionen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Gesamtwert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(stats.totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Investiert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(stats.totalInvested)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Echtgeldgewinn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(stats.realMoneyProfit)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
