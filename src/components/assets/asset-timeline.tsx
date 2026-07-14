"use client";

import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Check } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import type { EnrichedAssetTransactionRow } from "@/lib/asset-calculations";
import { cn } from "@/lib/utils";

interface AssetTimelineProps {
  events: EnrichedAssetTransactionRow[];
  currency?: string;
}

export function AssetTimeline({ events, currency = "EUR" }: AssetTimelineProps) {
  if (!events.length) {
    return (
      <div className="premium-card p-8 text-center text-sm text-muted-foreground">
        Noch keine Historie — füge deine erste Transaktion hinzu.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Timeline</h3>
      <div className="space-y-0">
        {events.map((ev, i) => {
          const isPositive = (ev.profitOnTx ?? 0) >= 0;
          const label = ev.actionLabel.toLowerCase();
          const isBuy = label.includes("kauf") || label === "einzahlung";
          const isSell = label.includes("verkauf") || label === "auszahlung";

          return (
            <div key={ev.id} className="relative flex gap-4 pb-6 last:pb-0">
              {i < events.length - 1 && (
                <span className="absolute left-[11px] top-8 h-[calc(100%-8px)] w-px bg-border" />
              )}
              <span
                className={cn(
                  "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-background",
                  isBuy && "bg-emerald-500/15 text-emerald-500",
                  isSell && "bg-red-500/15 text-red-500",
                  !isBuy && !isSell && "bg-primary/15 text-primary"
                )}
              >
                <Check className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1 premium-card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">
                    {format(new Date(ev.date), "dd.MM.yyyy", { locale: de })}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">{ev.time}</span>
                  </p>
                  <span className="text-sm font-semibold text-primary">{ev.actionLabel}</span>
                </div>

                {ev.type !== "DIVIDEND" && ev.type !== "FEE" && ev.type !== "TAX" && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatNumber(ev.quantity)} Stück · {formatCurrency(ev.price, currency)} / Stk.
                  </p>
                )}

                {ev.investedAmount != null && (
                  <p className="mt-1 text-sm">
                    Investition: <span className="font-medium tabular-nums">{formatCurrency(ev.investedAmount, currency)}</span>
                  </p>
                )}

                {ev.saleProceeds != null && (
                  <p className="mt-1 text-sm">
                    Verkaufserlös: <span className="font-medium tabular-nums">{formatCurrency(ev.saleProceeds, currency)}</span>
                  </p>
                )}

                {ev.type === "DIVIDEND" && (
                  <p className="mt-1 text-sm">
                    Betrag: <span className="font-medium tabular-nums">{formatCurrency(ev.gross, currency)}</span>
                  </p>
                )}

                {ev.profitOnTx != null && ev.type !== "BUY" && ev.type !== "DEPOSIT" && ev.type !== "BONUS" && (
                  <p className={cn("mt-1 text-sm font-medium tabular-nums", isPositive ? "text-emerald-500" : "text-red-500")}>
                    Gewinn: {isPositive ? "+" : ""}{formatCurrency(ev.profitOnTx, currency)}
                  </p>
                )}

                {(ev.fees > 0 || ev.taxes > 0) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ev.fees > 0 && `Gebühren ${formatCurrency(ev.fees, currency)}`}
                    {ev.fees > 0 && ev.taxes > 0 && " · "}
                    {ev.taxes > 0 && `Steuer ${formatCurrency(ev.taxes, currency)}`}
                  </p>
                )}

                {ev.notes && (
                  <p className="mt-2 text-xs text-muted-foreground italic">{ev.notes}</p>
                )}

                <p className="mt-2 text-xs text-muted-foreground">
                  Bestand danach: {formatNumber(ev.holdingsAfter)} · Ø {formatCurrency(ev.avgPriceAfter, currency)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
