"use client";

import { formatCurrency, formatPercent } from "@/lib/calculations";
import type { DashboardStats } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats;
  currency?: string;
}

export function StatsCards({ stats, currency = "EUR" }: StatsCardsProps) {
  const isPositive = stats.profitLoss >= 0;

  const secondary = [
    { title: "Investiert", value: formatCurrency(stats.investedCapital, currency) },
    { title: "Frei", value: formatCurrency(stats.freeCapital, currency) },
    { title: "Realisiert", value: formatCurrency(stats.realizedProfit, currency), positive: stats.realizedProfit >= 0 },
    { title: "Unrealisiert", value: formatCurrency(stats.unrealizedProfit, currency), positive: stats.unrealizedProfit >= 0 },
    { title: "Assets", value: String(stats.positionCount) },
    { title: "Transaktionen", value: String(stats.transactionCount) },
  ];

  return (
    <div className="space-y-4">
      <div className="premium-card relative overflow-hidden p-6 md:p-8">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        <p className="text-sm font-medium text-muted-foreground">Gesamtwert</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight md:text-4xl">
          {formatCurrency(stats.totalValue, currency)}
        </p>
        <div
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium tabular-nums",
            isPositive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
          )}
        >
          {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {formatCurrency(stats.profitLoss, currency)} ({formatPercent(stats.profitLossPercent)})
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {secondary.map((card) => (
          <div key={card.title} className="stat-pill">
            <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
            <p
              className={cn(
                "mt-1.5 text-lg font-semibold tabular-nums tracking-tight",
                card.positive === true && "text-emerald-500",
                card.positive === false && "text-red-500"
              )}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
