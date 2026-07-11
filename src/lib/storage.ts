import { v4 as uuidv4 } from "uuid";
import type {
  AppSettings,
  AppState,
  AssetSearchResult,
  Category,
  Portfolio,
  Position,
  PriceAlert,
  Transaction,
} from "./types";

const STORAGE_KEY = "crypto-invest-data";

export const defaultSettings: AppSettings = {
  theme: "dark",
  defaultCurrency: "EUR",
  priceRefreshInterval: 60000,
};

export function createDefaultPortfolio(name = "Hauptportfolio"): Portfolio {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name,
    currency: "EUR",
    color: "#6366f1",
    positions: [],
    categories: [
      { id: uuidv4(), name: "Langfristig", color: "#22c55e" },
      { id: uuidv4(), name: "Trading", color: "#f59e0b" },
      { id: uuidv4(), name: "Krypto", color: "#8b5cf6" },
      { id: uuidv4(), name: "ETFs", color: "#3b82f6" },
      { id: uuidv4(), name: "Dividenden", color: "#ec4899" },
      { id: uuidv4(), name: "Gold", color: "#eab308" },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

export function createInitialState(): AppState {
  const portfolio = createDefaultPortfolio();
  return {
    portfolios: [portfolio],
    activePortfolioId: portfolio.id,
    snapshots: { [portfolio.id]: [] },
    settings: defaultSettings,
    history: [],
    historyIndex: -1,
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return createInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.portfolios?.length) return createInitialState();
    return parsed;
  } catch {
    return createInitialState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function positionFromSearch(
  asset: AssetSearchResult,
  portfolioId: string
): Position {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: asset.name,
    symbol: asset.symbol,
    type: asset.type,
    logoUrl: asset.logoUrl,
    externalId: asset.id,
    currentPrice: asset.currentPrice,
    transactions: [],
    dividends: [],
    priceAlerts: [],
    isWatchlist: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function exportToCSV(portfolio: Portfolio): string {
  const headers = [
    "Name",
    "Symbol",
    "Typ",
    "Broker",
    "Menge",
    "Ø Kaufpreis",
    "Aktueller Preis",
    "Investiert",
    "Aktueller Wert",
    "G/V €",
    "G/V %",
    "Notizen",
  ];
  const rows = portfolio.positions.map((p) => {
    const qty = p.transactions.reduce((s, t) => {
      return t.type === "BUY" ? s + t.quantity : s - t.quantity;
    }, 0);
    const invested = p.transactions
      .filter((t) => t.type === "BUY")
      .reduce((s, t) => s + t.quantity * t.price, 0);
    const current = (p.currentPrice ?? 0) * qty;
    const pl = current - invested;
    const plPct = invested > 0 ? (pl / invested) * 100 : 0;
    return [
      p.name,
      p.symbol,
      p.type,
      p.broker ?? "",
      qty,
      invested / (qty || 1),
      p.currentPrice ?? 0,
      invested,
      current,
      pl,
      plPct,
      p.notes ?? "",
    ];
  });
  return [headers, ...rows]
    .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export function parseCSVImport(text: string): Partial<Position>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  return lines.slice(1).map((line) => {
    const cols = line.match(/("([^"]|"")*"|[^,]+)/g)?.map((c) =>
      c.replace(/^"|"$/g, "").replace(/""/g, '"')
    ) ?? [];
    const now = new Date().toISOString();
    const qty = parseFloat(cols[4] ?? "0") || 0;
    const price = parseFloat(cols[5] ?? "0") || 0;
    return {
      id: uuidv4(),
      name: cols[0] ?? "Unbekannt",
      symbol: cols[1] ?? "",
      type: (cols[2] as Position["type"]) ?? "OTHER",
      broker: cols[3],
      notes: cols[11],
      transactions:
        qty > 0
          ? [
              {
                id: uuidv4(),
                type: "BUY" as const,
                quantity: qty,
                price,
                fees: 0,
                date: now,
              },
            ]
          : [],
      dividends: [],
      priceAlerts: [],
      isWatchlist: false,
      createdAt: now,
      updatedAt: now,
    };
  });
}
