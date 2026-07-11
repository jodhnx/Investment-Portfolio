"use client";

import { formatCurrency, formatNumber } from "@/lib/calculations";
import { computeAssetDetailSummary } from "@/lib/asset-calculations";
import type { Position } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AssetSummaryGridProps {
  position: Position;
  currency?: string;
}

export function AssetSummaryGrid({ position, currency = "EUR" }: AssetSummaryGridProps) {
  const s = computeAssetDetailSummary(position);
  const items = [
    { label: "Gesamt gekauft", value: formatNumber(s.totalBoughtQty) },
    { label: "Gesamt verkauft", value: formatNumber(s.totalSoldQty) },
    { label: "Aktueller Bestand", value: formatNumber(s.currentHoldings) },
    { label: "Ø Kaufpreis", value: formatCurrency(s.avgBuyPrice, currency) },
    { label: "Ø Verkaufspreis", value: formatCurrency(s.avgSellPrice, currency) },
    { label: "Gesamtinvestition", value: formatCurrency(s.totalInvested, currency) },
    { label: "Verkaufserlös", value: formatCurrency(s.totalSaleProceeds, currency) },
    {
      label: "Realisierter Gewinn",
      value: formatCurrency(s.realizedProfit, currency),
      color: s.realizedProfit >= 0 ? "text-emerald-500" : "text-red-500",
    },
    {
      label: "Nicht realisierter Gewinn",
      value: formatCurrency(s.unrealizedProfit, currency),
      color: s.unrealizedProfit >= 0 ? "text-emerald-500" : "text-red-500",
    },
    { label: "Gebühren gesamt", value: formatCurrency(s.totalFees, currency) },
    { label: "Steuern gesamt", value: formatCurrency(s.totalTaxes, currency) },
    {
      label: "Netto Gewinn",
      value: formatCurrency(s.netProfit, currency),
      color: s.netProfit >= 0 ? "text-emerald-500" : "text-red-500",
    },
    {
      label: "ROI",
      value: `${s.roi >= 0 ? "+" : ""}${s.roi.toFixed(2)}%`,
      color: s.roi >= 0 ? "text-emerald-500" : "text-red-500",
    },
    { label: "Break-Even Preis", value: formatCurrency(s.breakEvenPrice, currency) },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Zusammenfassung</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border/60 bg-muted/20 p-3"
          >
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
              {item.label}
            </p>
            <p className={cn("mt-1 text-sm font-semibold tabular-nums", item.color)}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
