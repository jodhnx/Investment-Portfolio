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
    { title: "Gesamtwert", value: formatCurrency(stats.totalValue, currency), highlight: true },
    { title: "Gewinn / Verlust", value: formatCurrency(stats.profitLoss, currency), sub: formatPercent(stats.profitLossPercent), positive: stats.profitLoss >= 0 },
    { title: "Investiert", value: formatCurrency(stats.investedCapital, currency) },
    { title: "Freies Kapital", value: formatCurrency(stats.freeCapital, currency) },
    { title: "Einzahlungen", value: formatCurrency(stats.totalDeposits, currency) },
    { title: "Realisiert", value: formatCurrency(stats.realizedProfit, currency), positive: stats.realizedProfit >= 0 },
    { title: "Unrealisiert", value: formatCurrency(stats.unrealizedProfit, currency), positive: stats.unrealizedProfit >= 0 },
    { title: "Assets", value: String(stats.positionCount) },
    { title: "Transaktionen", value: String(stats.transactionCount) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className={cn(
            "rounded-2xl border border-border/80 bg-card px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md",
            card.highlight && "border-primary/20 bg-primary/[0.03]"
          )}
        >
          <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
          <p
            className={cn(
              "mt-1 text-lg font-semibold tabular-nums tracking-tight",
              card.positive === true && "text-emerald-500",
              card.positive === false && "text-red-500"
            )}
          >
            {card.value}
          </p>
          {card.sub && (
            <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">{card.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}
