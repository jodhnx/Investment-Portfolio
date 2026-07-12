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
    { label: "Kurs", value: formatCurrency(computed.currentPrice, meta.currency ?? currency) },
    { label: "Stück", value: formatNumber(computed.quantity) },
    { label: "Ø Kauf", value: formatCurrency(computed.avgBuyPrice, currency) },
    { label: "Wert", value: formatCurrency(computed.currentValue, currency) },
    { label: "Investiert", value: formatCurrency(computed.invested, currency) },
    {
      label: "G/V",
      value: formatCurrency(computed.profitLoss, currency),
      sub: formatPercent(computed.profitLossPercent),
      color: isPositive ? "text-emerald-500" : "text-red-500",
    },
    {
      label: "24h",
      value: formatCurrency(dayChange, currency),
      color: dayChange >= 0 ? "text-emerald-500" : "text-red-500",
    },
    { label: "ATH", value: formatCurrency(summary.allTimeHigh, currency) },
    { label: "ATL", value: formatCurrency(summary.allTimeLow, currency) },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/assets"
        className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Assets
      </Link>

      <div className="premium-card p-6 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-border/50">
              <AvatarImage src={position.logoUrl ?? meta.imageUrl} />
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
                {position.broker && <Badge variant="outline" className="rounded-lg">{position.broker}</Badge>}
              </div>
            </div>
          </div>
          <div className="sm:text-right">
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
            <p className={cn("mt-1.5 text-lg font-semibold tabular-nums", kpi.color)}>{kpi.value}</p>
            {kpi.sub && <p className={cn("text-xs tabular-nums", kpi.color)}>{kpi.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
