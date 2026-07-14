"use client";

import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/calculations";
import { getAssetMeta } from "@/lib/asset-meta";
import type { AssetHistoryData } from "@/hooks/use-asset-history";
import type { Position } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AssetDetailHeaderProps {
  position: Position;
  categoryName: string;
  currency: string;
  history: AssetHistoryData;
  onAddTransaction?: () => void;
}

export function AssetDetailHeader({
  position,
  categoryName,
  currency,
  history,
  onAddTransaction,
}: AssetDetailHeaderProps) {
  const { computed, summary } = history;
  const meta = getAssetMeta(position.notes);
  const isPositive = computed.profitLoss >= 0;

  const kpis = [
    { label: "Aktueller Kurs", value: formatCurrency(computed.currentPrice, meta.currency ?? currency) },
    { label: "Bestand", value: formatNumber(computed.quantity) },
    { label: "Ø Kaufpreis", value: formatCurrency(computed.avgBuyPrice, currency) },
    { label: "Gesamtwert", value: formatCurrency(computed.currentValue, currency) },
    { label: "Investiert", value: formatCurrency(computed.invested, currency) },
    {
      label: "G/V €",
      value: formatCurrency(computed.profitLoss, currency),
      color: isPositive ? "text-emerald-500" : "text-red-500",
    },
    {
      label: "G/V %",
      value: formatPercent(computed.profitLossPercent),
      color: isPositive ? "text-emerald-500" : "text-red-500",
    },
    {
      label: "Realisiert",
      value: formatCurrency(summary.realizedProfit, currency),
      color: summary.realizedProfit >= 0 ? "text-emerald-500" : "text-red-500",
    },
    {
      label: "Unrealisiert",
      value: formatCurrency(summary.unrealizedProfit, currency),
      color: summary.unrealizedProfit >= 0 ? "text-emerald-500" : "text-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/assets"
          className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Assets
        </Link>
        {onAddTransaction && (
          <Button className="h-10 gap-2 rounded-xl" onClick={onAddTransaction}>
            <Plus className="h-4 w-4" />
            Transaktion
          </Button>
        )}
      </div>

      <div className="premium-card p-6 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-border/50">
              <AvatarImage src={position.logoUrl ?? meta.imageUrl} className="object-contain" />
              <AvatarFallback
                className="text-lg font-bold"
                style={{ backgroundColor: position.color ?? "#6366f1", color: "white" }}
              >
                {position.symbol.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{position.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-lg">{position.symbol}</Badge>
                <Badge variant="outline" className="rounded-lg">{categoryName}</Badge>
              </div>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-muted-foreground">Gesamtwert</p>
            <p className="text-3xl font-semibold tabular-nums md:text-4xl">
              {formatCurrency(computed.currentValue, currency)}
            </p>
            <p className={cn("mt-1 text-base font-medium tabular-nums", isPositive ? "text-emerald-500" : "text-red-500")}>
              {formatCurrency(computed.profitLoss, currency)} · {formatPercent(computed.profitLossPercent)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="stat-pill">
            <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
            <p className={cn("mt-1.5 text-base font-semibold tabular-nums md:text-lg", kpi.color)}>{kpi.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
