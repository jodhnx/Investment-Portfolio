"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/calculations";
import type { Portfolio } from "@/lib/types";

interface WatchlistPreviewProps {
  portfolio: Portfolio;
  currency?: string;
}

export function WatchlistPreview({ portfolio, currency = "EUR" }: WatchlistPreviewProps) {
  const items = portfolio.positions.filter((p) => p.isWatchlist).slice(0, 5);

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="h-4 w-4" />
          Watchlist
        </CardTitle>
        <Link href="/watchlist" className="text-xs text-primary hover:underline">
          Alle
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Assets in der Watchlist</p>
        ) : (
          <div className="space-y-2">
            {items.map((p) => (
              <Link
                key={p.id}
                href="/watchlist"
                className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent/50"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={p.logoUrl} />
                  <AvatarFallback className="text-xs">{p.symbol.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.symbol}</p>
                </div>
                {p.currentPrice != null && (
                  <span className="text-sm tabular-nums">
                    {formatCurrency(p.currentPrice, currency)}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
