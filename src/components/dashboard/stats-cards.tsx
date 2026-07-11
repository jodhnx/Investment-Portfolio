"use client";

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  BarChart3,
  Hash,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import type { DashboardStats } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: DashboardStats;
  currency?: string;
}

export function StatsCards({ stats, currency = "EUR" }: StatsCardsProps) {
  const cards = [
    {
      title: "Gesamtwert",
      value: formatCurrency(stats.totalValue, currency),
      icon: Wallet,
      color: "text-blue-400",
    },
    {
      title: "Gesamtinvestition",
      value: formatCurrency(stats.totalInvested, currency),
      icon: PiggyBank,
      color: "text-purple-400",
    },
    {
      title: "Gewinn / Verlust",
      value: formatCurrency(stats.profitLoss, currency),
      sub: formatPercent(stats.profitLossPercent),
      icon: stats.profitLoss >= 0 ? TrendingUp : TrendingDown,
      color: stats.profitLoss >= 0 ? "text-green-400" : "text-red-400",
      valueColor: stats.profitLoss >= 0 ? "text-green-400" : "text-red-400",
    },
    {
      title: "Tagesänderung",
      value: formatCurrency(stats.dayChange, currency),
      sub: formatPercent(stats.dayChangePercent),
      icon: BarChart3,
      color: stats.dayChange >= 0 ? "text-green-400" : "text-red-400",
      valueColor: stats.dayChange >= 0 ? "text-green-400" : "text-red-400",
    },
    {
      title: "Echtgeldgewinn",
      value: formatCurrency(stats.realMoneyProfit, currency),
      icon: TrendingUp,
      color: "text-emerald-400",
    },
    {
      title: "Positionen",
      value: String(stats.positionCount),
      icon: Hash,
      color: "text-slate-400",
    },
    {
      title: "Bestes Investment",
      value: stats.bestInvestment?.name ?? "—",
      sub: stats.bestInvestment
        ? formatPercent(stats.bestInvestment.profitPercent)
        : undefined,
      icon: Trophy,
      color: "text-yellow-400",
      valueColor: "text-green-400",
    },
    {
      title: "Schlechtestes Investment",
      value: stats.worstInvestment?.name ?? "—",
      sub: stats.worstInvestment
        ? formatPercent(stats.worstInvestment.profitPercent)
        : undefined,
      icon: AlertTriangle,
      color: "text-orange-400",
      valueColor: "text-red-400",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={cn("h-4 w-4", card.color)} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-xl font-bold tabular-nums", card.valueColor)}>
              {card.value}
            </div>
            {card.sub && (
              <p
                className={cn(
                  "mt-0.5 text-xs tabular-nums",
                  card.valueColor ?? "text-muted-foreground"
                )}
              >
                {card.sub}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
