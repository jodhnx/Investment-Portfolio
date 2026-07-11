"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  computePosition,
} from "@/lib/calculations";
import { computeAssetDetailSummary } from "@/lib/asset-calculations";
import { getAssetMeta } from "@/lib/asset-meta";
import type { Position } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AssetDetailHeaderProps {
  position: Position;
  categoryName: string;
  currency: string;
}

export function AssetDetailHeader({ position, categoryName, currency }: AssetDetailHeaderProps) {
  const computed = computePosition(position);
  const summary = computeAssetDetailSummary(position);
  const meta = getAssetMeta(position.notes);
  const dayChange = (position.priceChange24h ?? 0) * computed.quantity;
  const isPositive = computed.profitLoss >= 0;

  const kpis = [
    { label: "Aktueller Kurs", value: formatCurrency(computed.currentPrice, meta.currency ?? currency) },
    { label: "Stückzahl", value: formatNumber(computed.quantity) },
    { label: "Ø Kaufpreis", value: formatCurrency(computed.avgBuyPrice, currency) },
    { label: "Aktueller Wert", value: formatCurrency(computed.currentValue, currency) },
    { label: "Investition", value: formatCurrency(computed.invested, currency) },
    {
      label: "Gewinn / Verlust",
      value: formatCurrency(computed.profitLoss, currency),
      sub: formatPercent(computed.profitLossPercent),
      color: isPositive ? "text-emerald-500" : "text-red-500",
    },
    {
      label: "Tagesänderung",
      value: formatCurrency(dayChange, currency),
      color: dayChange >= 0 ? "text-emerald-500" : "text-red-500",
    },
    { label: "All-Time High", value: formatCurrency(summary.allTimeHigh, currency) },
    { label: "All-Time Low", value: formatCurrency(summary.allTimeLow, currency) },
  ];

  return (
    <div className="space-y-4">
      <Link
        href="/assets"
        className="inline-flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-border">
            <AvatarImage src={position.logoUrl ?? meta.imageUrl} />
            <AvatarFallback
              className="text-lg font-bold"
              style={{ backgroundColor: position.color ?? "#6366f1", color: "white" }}
            >
              {position.symbol.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{position.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{position.symbol}</Badge>
              <Badge variant="outline">{categoryName}</Badge>
              {meta.isin && <Badge variant="outline">ISIN {meta.isin}</Badge>}
              {position.broker && <Badge variant="outline">{position.broker}</Badge>}
            </div>
          </div>
        </div>
        <div className={cn("text-right", isPositive ? "text-emerald-500" : "text-red-500")}>
          <p className="text-3xl font-bold tabular-nums">{formatCurrency(computed.currentValue, currency)}</p>
          <p className="text-sm tabular-nums">
            {formatCurrency(computed.profitLoss, currency)} ({formatPercent(computed.profitLossPercent)})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-border/60 bg-card/80 p-3 backdrop-blur-sm"
          >
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
              {kpi.label}
            </p>
            <p className={cn("mt-1 text-sm font-semibold tabular-nums sm:text-base", kpi.color)}>
              {kpi.value}
            </p>
            {kpi.sub && (
              <p className={cn("text-xs tabular-nums", kpi.color)}>{kpi.sub}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
