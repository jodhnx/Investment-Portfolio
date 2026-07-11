"use client";

import { formatCurrency, formatPercent } from "@/lib/calculations";
import type { DashboardStats } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: DashboardStats;
  currency?: string;
}

export function StatsCards({ stats, currency = "EUR" }: StatsCardsProps) {
  const cards = [
    { title: "Vermögen", value: formatCurrency(stats.totalValue, currency) },
    { title: "Frei", value: formatCurrency(stats.freeCapital, currency) },
    { title: "Investiert", value: formatCurrency(stats.investedCapital, currency) },
    { title: "Einzahlungen", value: formatCurrency(stats.totalDeposits, currency) },
    {
      title: "Gewinn",
      value: formatCurrency(stats.profitLoss, currency),
      sub: formatPercent(stats.profitLossPercent),
      positive: stats.profitLoss >= 0,
    },
    {
      title: "Realisiert",
      value: formatCurrency(stats.realizedProfit, currency),
      positive: stats.realizedProfit >= 0,
    },
    {
      title: "Unrealisiert",
      value: formatCurrency(stats.unrealizedProfit, currency),
      positive: stats.unrealizedProfit >= 0,
    },
    { title: "Assets", value: String(stats.positionCount) },
    { title: "Transaktionen", value: String(stats.transactionCount) },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-lg border border-border bg-card px-3 py-3"
        >
          <p className="text-xs text-muted-foreground">{card.title}</p>
          <p
            className={cn(
              "mt-0.5 text-base font-semibold tabular-nums sm:text-lg",
              card.positive === true && "text-emerald-500",
              card.positive === false && "text-red-500"
            )}
          >
            {card.value}
          </p>
          {card.sub && (
            <p className="text-xs tabular-nums text-muted-foreground">{card.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}
