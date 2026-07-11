"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";

/** Preis-Updates – nur einmal pro Layout mounten, nicht pro Komponente */
export function usePriceUpdater() {
  const activePortfolioId = usePortfolioStore((s) => s.activePortfolioId);
  const positionCount = usePortfolioStore(
    (s) => s.portfolios.find((p) => p.id === s.activePortfolioId)?.positions.length ?? 0
  );
  const updatePrices = usePortfolioStore((s) => s.updatePrices);
  const interval = usePortfolioStore((s) => s.settings.priceRefreshInterval);
  const mountedRef = useRef(false);

  const refresh = useCallback(async () => {
    const portfolio = usePortfolioStore.getState().getActivePortfolio();
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
  }, [updatePrices]);

  useEffect(() => {
    if (!activePortfolioId || positionCount === 0) return;

    // Nur einmal initial fetchen wenn Portfolio/Positionen sich ändern
    refresh();
    const timer = setInterval(refresh, interval);
    return () => clearInterval(timer);
  }, [activePortfolioId, positionCount, interval, refresh]);

  // Verhindert doppeltes Mounten in Strict Mode
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { refresh };
}

export function PriceUpdater() {
  usePriceUpdater();
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
