"use client";

import { useEffect } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { selectActivePortfolioId, selectPositionCount } from "@/lib/store-selectors";

async function fetchAndApplyPrices(): Promise<void> {
  if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

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

  const fetches: Promise<void>[] = [];

  if (cryptoIds.length) {
    fetches.push(
      (async () => {
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
      })()
    );
  }

  if (stockSymbols.length) {
    fetches.push(
      (async () => {
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
      })()
    );
  }

  await Promise.all(fetches);

  if (Object.keys(updates).length) {
    updatePrices(updates);
  }
}

/** Preis-Updates – pausiert wenn Tab im Hintergrund */
export function PriceUpdater() {
  const activePortfolioId = usePortfolioStore(selectActivePortfolioId);
  const positionCount = usePortfolioStore(selectPositionCount);
  const interval = usePortfolioStore((s) => s.settings.priceRefreshInterval);

  useEffect(() => {
    if (!activePortfolioId || positionCount === 0) return;

    void fetchAndApplyPrices();
    const timer = setInterval(() => void fetchAndApplyPrices(), interval);

    const onVisible = () => {
      if (document.visibilityState === "visible") void fetchAndApplyPrices();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
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
