"use client";

import { formatCurrency, formatNumber } from "@/lib/calculations";
import type { AssetCapitalOverview, ExtendedAssetMetrics } from "@/lib/asset-calculations";
import { cn } from "@/lib/utils";

interface AssetMetricsSectionsProps {
  metrics: ExtendedAssetMetrics;
  capital: AssetCapitalOverview;
  currency?: string;
}

export function AssetMetricsSections({ metrics, capital, currency = "EUR" }: AssetMetricsSectionsProps) {
  const kpiItems = [
    { label: "Erster Kaufpreis", value: formatCurrency(metrics.firstBuyPrice, currency) },
    { label: "Letzter Kaufpreis", value: formatCurrency(metrics.lastBuyPrice, currency) },
    { label: "Höchster Kauf", value: formatCurrency(metrics.highestBuyPrice, currency) },
    { label: "Niedrigster Kauf", value: formatCurrency(metrics.lowestBuyPrice, currency) },
    { label: "Ø Kaufpreis", value: formatCurrency(metrics.avgBuyPrice, currency) },
    { label: "Ø Verkaufspreis", value: formatCurrency(metrics.avgSellPrice, currency) },
    { label: "Anzahl Käufe", value: String(metrics.buyCount) },
    { label: "Anzahl Verkäufe", value: String(metrics.sellCount) },
    { label: "Gebühren gesamt", value: formatCurrency(metrics.totalFees, currency) },
    { label: "Steuern gesamt", value: formatCurrency(metrics.totalTaxes, currency) },
    {
      label: "Realisierter Gewinn",
      value: formatCurrency(metrics.realizedProfit, currency),
      color: metrics.realizedProfit >= 0 ? "text-emerald-500" : "text-red-500",
    },
    {
      label: "Unrealisierter Gewinn",
      value: formatCurrency(metrics.unrealizedProfit, currency),
      color: metrics.unrealizedProfit >= 0 ? "text-emerald-500" : "text-red-500",
    },
    {
      label: "ROI",
      value: `${metrics.roi >= 0 ? "+" : ""}${metrics.roi.toFixed(2)}%`,
      color: metrics.roi >= 0 ? "text-emerald-500" : "text-red-500",
    },
    { label: "Break-Even", value: formatCurrency(metrics.breakEvenPrice, currency) },
  ];

  const capitalItems = [
    { label: "Insgesamt investiert", value: formatCurrency(capital.totalInvested, currency) },
    { label: "Insgesamt verkauft", value: formatCurrency(capital.totalSold, currency) },
    { label: "Offener Bestand", value: formatNumber(capital.openHoldings) },
    { label: "Noch investiert", value: formatCurrency(capital.capitalStillInvested, currency) },
    { label: "Ausgezahlt", value: formatCurrency(capital.capitalWithdrawn, currency) },
    {
      label: "Gewinn nach Gebühren",
      value: formatCurrency(capital.profitAfterFees, currency),
      color: capital.profitAfterFees >= 0 ? "text-emerald-500" : "text-red-500",
    },
    {
      label: "Gewinn nach Steuern",
      value: formatCurrency(capital.profitAfterTaxes, currency),
      color: capital.profitAfterTaxes >= 0 ? "text-emerald-500" : "text-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-lg font-semibold">Kennzahlen</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {kpiItems.map((item) => (
            <div key={item.label} className="stat-pill">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className={cn("mt-1 font-semibold tabular-nums", item.color)}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-lg font-semibold">Kapitalübersicht</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {capitalItems.map((item) => (
            <div key={item.label} className="stat-pill">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className={cn("mt-1 font-semibold tabular-nums", item.color)}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
