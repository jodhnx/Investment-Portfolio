"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  BarChart3,
  Layers,
  ArrowLeftRight,
  Percent,
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
      title: "Gesamtvermögen",
      value: formatCurrency(stats.totalValue, currency),
      icon: Wallet,
      accent: "from-blue-500/20 to-blue-500/5",
    },
    {
      title: "Gesamtinvestition",
      value: formatCurrency(stats.totalInvested, currency),
      icon: PiggyBank,
      accent: "from-violet-500/20 to-violet-500/5",
    },
    {
      title: "Gesamtgewinn",
      value: formatCurrency(stats.profitLoss, currency),
      sub: formatPercent(stats.profitLossPercent),
      icon: stats.profitLoss >= 0 ? TrendingUp : TrendingDown,
      valueColor: stats.profitLoss >= 0 ? "text-emerald-500" : "text-red-500",
      accent: stats.profitLoss >= 0 ? "from-emerald-500/20 to-emerald-500/5" : "from-red-500/20 to-red-500/5",
    },
    {
      title: "Gewinn %",
      value: formatPercent(stats.profitLossPercent),
      icon: Percent,
      valueColor: stats.profitLossPercent >= 0 ? "text-emerald-500" : "text-red-500",
      accent: "from-amber-500/20 to-amber-500/5",
    },
    {
      title: "Tagesgewinn",
      value: formatCurrency(stats.dayGain, currency),
      icon: TrendingUp,
      valueColor: "text-emerald-500",
      accent: "from-emerald-500/15 to-emerald-500/5",
    },
    {
      title: "Tagesverlust",
      value: formatCurrency(stats.dayLoss, currency),
      icon: TrendingDown,
      valueColor: stats.dayLoss > 0 ? "text-red-500" : "text-muted-foreground",
      accent: "from-red-500/15 to-red-500/5",
    },
    {
      title: "Anzahl Assets",
      value: String(stats.positionCount),
      icon: Layers,
      accent: "from-slate-500/20 to-slate-500/5",
    },
    {
      title: "Transaktionen",
      value: String(stats.transactionCount),
      icon: ArrowLeftRight,
      accent: "from-cyan-500/20 to-cyan-500/5",
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
        >
          <Card className={cn("relative overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm")}>
            <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60", card.accent)} />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="relative">
              <div className={cn("text-lg font-bold tabular-nums sm:text-xl", card.valueColor)}>
                {card.value}
              </div>
              {card.sub && (
                <p className={cn("mt-0.5 text-xs tabular-nums", card.valueColor ?? "text-muted-foreground")}>
                  {card.sub}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
