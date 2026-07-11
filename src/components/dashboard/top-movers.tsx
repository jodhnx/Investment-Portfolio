"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={cn("h-4 w-4", mode === "winners" ? "text-emerald-500" : "text-red-500")} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {positions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Daten</p>
        ) : (
          positions.map((p) => (
            <Link
              key={p.id}
              href="/assets"
              className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent/50"
            >
              <Avatar className="h-8 w-8">
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
                <p className="text-xs tabular-nums text-muted-foreground">
                  {formatCurrency(p.profitLoss, currency)}
                </p>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
