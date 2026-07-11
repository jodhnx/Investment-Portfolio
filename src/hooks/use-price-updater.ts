"use client";

import { useEffect, useCallback } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import type { AssetType } from "@/lib/types";

export function usePriceUpdater() {
  const portfolio = usePortfolioStore((s) => s.getActivePortfolio());
  const updatePrices = usePortfolioStore((s) => s.updatePrices);
  const interval = usePortfolioStore((s) => s.settings.priceRefreshInterval);

  const refresh = useCallback(async () => {
    if (!portfolio) return;

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
        if (res.ok) {
          const data = await res.json();
          Object.assign(updates, data);
        }
      } catch {
        // offline fallback
      }
    }

    if (stockSymbols.length) {
      try {
        const res = await fetch("/api/prices/stocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbols: stockSymbols }),
        });
        if (res.ok) {
          const data = await res.json();
          Object.assign(updates, data);
        }
      } catch {
        // offline fallback
      }
    }

    if (Object.keys(updates).length) {
      updatePrices(updates);
    }
  }, [portfolio, updatePrices]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, interval);
    return () => clearInterval(timer);
  }, [refresh, interval]);

  return { refresh };
}

export function assetTypeLabel(type: AssetType): string {
  const labels: Record<AssetType, string> = {
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
