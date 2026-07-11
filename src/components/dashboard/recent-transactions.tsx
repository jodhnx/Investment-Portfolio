"use client";

import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import type { Portfolio } from "@/lib/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const TX_LABELS: Record<string, string> = {
  BUY: "Kauf",
  SELL: "Verkauf",
  DEPOSIT: "Einzahlung",
  WITHDRAWAL: "Auszahlung",
  DIVIDEND: "Dividende",
  FEE: "Gebühr",
  TAX: "Steuer",
  SPLIT: "Split",
  BONUS: "Bonus",
  CUSTOM: "Sonstige",
};

interface RecentTransactionsProps {
  portfolio: Portfolio;
  currency?: string;
  limit?: number;
}

export function RecentTransactions({ portfolio, currency = "EUR", limit = 6 }: RecentTransactionsProps) {
  const items = portfolio.positions
    .filter((p) => !p.isWatchlist)
    .flatMap((p) =>
      p.transactions.map((t) => ({
        ...t,
        assetName: p.name,
        symbol: p.symbol,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowLeftRight className="h-4 w-4" />
          Letzte Transaktionen
        </CardTitle>
        <Link href="/transactions" className="text-xs text-primary hover:underline">
          Alle anzeigen
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Transaktionen</p>
        ) : (
          <div className="space-y-2">
            {items.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-border/50 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.assetName}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(t.date), "dd. MMM yyyy", { locale: de })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {TX_LABELS[t.type] ?? t.type}
                  </Badge>
                  <div className="text-right text-sm tabular-nums">
                    {formatNumber(t.quantity)} × {formatCurrency(t.price, currency)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
