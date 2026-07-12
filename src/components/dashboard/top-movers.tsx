"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency, formatPercent, computePosition } from "@/lib/calculations";
import type { Portfolio } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TopMoversProps {
  portfolio: Portfolio;
  mode: "winners" | "losers";
  currency?: string;
  limit?: number;
}

export function TopMovers({ portfolio, mode, currency = "EUR", limit = 5 }: TopMoversProps) {
  const positions = portfolio.positions
    .filter((p) => !p.isWatchlist)
    .map(computePosition)
    .filter((p) => p.invested > 0)
    .sort((a, b) =>
      mode === "winners"
        ? b.profitLossPercent - a.profitLossPercent
        : a.profitLossPercent - b.profitLossPercent
    )
    .slice(0, limit);

  const Icon = mode === "winners" ? TrendingUp : TrendingDown;
  const title = mode === "winners" ? "Top Gewinner" : "Top Verlierer";

  return (
    <div className="premium-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className={cn("h-5 w-5", mode === "winners" ? "text-emerald-500" : "text-red-500")} />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="space-y-1">
        {positions.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">Noch keine Daten</p>
        ) : (
          positions.map((p) => (
            <Link
              key={p.id}
              href={`/assets/${p.id}`}
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50"
            >
              <Avatar className="h-10 w-10 ring-2 ring-border/50">
                <AvatarImage src={p.logoUrl} />
                <AvatarFallback className="text-xs">{p.symbol.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(p.currentValue, currency)}</p>
              </div>
              <div className="text-right">
                <p className={cn("text-sm font-semibold tabular-nums", p.profitLoss >= 0 ? "text-emerald-500" : "text-red-500")}>
                  {formatPercent(p.profitLossPercent)}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
