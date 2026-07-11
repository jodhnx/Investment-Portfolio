"use client";

import { PortfolioTable } from "@/components/portfolio/portfolio-table";
import { usePriceUpdater } from "@/hooks/use-price-updater";

export default function WatchlistPage() {
  usePriceUpdater();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Watchlist</h2>
        <p className="text-sm text-muted-foreground">
          Assets beobachten ohne Kauf – mit Live-Preisen und Preisalarmen
        </p>
      </div>
      <PortfolioTable watchlistOnly />
    </div>
  );
}
