"use client";

import { PortfolioTable } from "@/components/portfolio/portfolio-table";
import { usePriceUpdater } from "@/hooks/use-price-updater";

export default function PortfolioPage() {
  usePriceUpdater();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Portfolio</h2>
        <p className="text-sm text-muted-foreground">
          Excel-ähnliche Tabelle mit Sortierung, Filter und verschiebbaren Spalten
        </p>
      </div>
      <PortfolioTable />
    </div>
  );
}
