"use client";

import { useEffect } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { selectActivePortfolioId, selectPositionCount } from "@/lib/store-selectors";

async function fetchAndApplyPrices(): Promise<void> {
  const { getActivePortfolio, updatePrices } = usePortfolioStore.getState();
  const portfolio = getActivePortfolio();
  if (!portfolio?.positions.length) return;

  const cryptoIds = portfolio.positions
    .filter((p) => p.type === "CRYPTO" || p.type === "GOLD")
    .map((p) => p.externalId ?? p.symbol.toLowerCase())
    .filter(Boolean);

  const stockSymbols = portfolio.positions
    .filter((p) => ["STOCK", "ETF"].includes(p.type))
    .map((p) => p.symbol)
    .filter(Boolean);

  const updates: Record<
    string,
    { price: number; change24h?: number; changePercent24h?: number }
  > = {};

  if (cryptoIds.length) {
    try {
      const res = await fetch("/api/prices/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: cryptoIds }),
      });
      if (res.ok) Object.assign(updates, await res.json());
    } catch {
      // offline
    }
  }

  if (stockSymbols.length) {
    try {
      const res = await fetch("/api/prices/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols: stockSymbols }),
      });
      if (res.ok) Object.assign(updates, await res.json());
    } catch {
      // offline
    }
  }

  if (Object.keys(updates).length) {
    updatePrices(updates);
  }
}

/** Preis-Updates – einmal pro Layout, stabile Effect-Dependencies */
export function PriceUpdater() {
  const activePortfolioId = usePortfolioStore(selectActivePortfolioId);
  const positionCount = usePortfolioStore(selectPositionCount);
  const interval = usePortfolioStore((s) => s.settings.priceRefreshInterval);

  useEffect(() => {
    if (!activePortfolioId || positionCount === 0) return;

    void fetchAndApplyPrices();
    const timer = setInterval(() => void fetchAndApplyPrices(), interval);
    return () => clearInterval(timer);
  }, [activePortfolioId, positionCount, interval]);

  return null;
}

export function assetTypeLabel(type: import("@/lib/types").AssetType): string {
  const labels: Record<import("@/lib/types").AssetType, string> = {
    CRYPTO: "Krypto",
    STOCK: "Aktie",
    ETF: "ETF",
    GOLD: "Gold",
    SILVER: "Silber",
    COMMODITY: "Rohstoff",
    OTHER: "Sonstige",
  };
  return labels[type];
}
