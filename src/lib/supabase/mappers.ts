import { prepareTransactionForDatabase } from "@/lib/transaction-db";
import type { Database } from "@/lib/supabase/database.types";
import type {
  AssetType,
  Currency,
  Portfolio,
  PortfolioSnapshot,
  Position,
  Transaction,
  Dividend,
  PriceAlert,
} from "@/lib/types";

type AssetRow = Database["public"]["Tables"]["assets"]["Row"];
type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
type DividendRow = Database["public"]["Tables"]["dividends"]["Row"];
type PortfolioRow = Database["public"]["Tables"]["portfolios"]["Row"];
type WatchlistRow = Database["public"]["Tables"]["watchlist"]["Row"];
type SnapshotRow = Database["public"]["Tables"]["portfolio_snapshots"]["Row"];
type AlertRow = Database["public"]["Tables"]["price_alerts"]["Row"];

export function mapTransaction(row: TransactionRow): Transaction {
  let type = row.transaction_type as Transaction["type"];
  let notes = row.notes ?? undefined;
  if (notes) {
    try {
      const parsed = JSON.parse(notes) as { extendedType?: Transaction["type"]; note?: string };
      if (parsed.extendedType) {
        type = parsed.extendedType;
        notes = parsed.note;
      }
    } catch {
      // plain notes
    }
  }
  return {
    id: row.id,
    type,
    quantity: Number(row.quantity),
    price: Number(row.price),
    fees: Number(row.fees),
    taxes: Number(row.taxes) || undefined,
    date: row.date,
    notes,
  };
}

export function mapDividend(row: DividendRow): Dividend {
  return {
    id: row.id,
    amount: Number(row.amount),
    date: row.date,
    notes: row.notes ?? undefined,
  };
}

export function mapAssetToPosition(
  asset: AssetRow,
  transactions: TransactionRow[],
  dividends: DividendRow[],
  alerts: AlertRow[]
): Position {
  const symbolAlerts = alerts.filter((a) => a.symbol === asset.symbol);
  return {
    id: asset.id,
    name: asset.asset_name,
    symbol: asset.symbol,
    type: asset.asset_type as AssetType,
    broker: asset.exchange ?? undefined,
    logoUrl: asset.logo_url ?? undefined,
    externalId: asset.external_id ?? undefined,
    notes: asset.notes ?? undefined,
    color: asset.color ?? undefined,
    currentPrice: asset.current_price ? Number(asset.current_price) : undefined,
    priceChange24h: asset.price_change_24h ? Number(asset.price_change_24h) : undefined,
    priceChangePercent24h: asset.price_change_percent_24h
      ? Number(asset.price_change_percent_24h)
      : undefined,
    transactions: transactions.map(mapTransaction),
    dividends: dividends.map(mapDividend),
    priceAlerts: symbolAlerts.map((a) => ({
      id: a.id,
      targetPrice: Number(a.target_price),
      condition: a.direction as PriceAlert["condition"],
      active: a.enabled,
      triggered: a.triggered,
    })),
    isWatchlist: false,
    createdAt: asset.created_at,
    updatedAt: asset.updated_at,
  };
}

export function mapWatchlistToPosition(row: WatchlistRow, alerts: AlertRow[]): Position {
  const symbolAlerts = alerts.filter((a) => a.symbol === row.symbol);
  return {
    id: row.id,
    name: row.asset_name,
    symbol: row.symbol,
    type: row.asset_type as AssetType,
    logoUrl: row.logo_url ?? undefined,
    externalId: row.external_id ?? undefined,
    currentPrice: row.current_price ? Number(row.current_price) : undefined,
    priceChange24h: row.price_change_24h ? Number(row.price_change_24h) : undefined,
    priceChangePercent24h: row.price_change_percent_24h
      ? Number(row.price_change_percent_24h)
      : undefined,
    transactions: [],
    dividends: [],
    priceAlerts: symbolAlerts.map((a) => ({
      id: a.id,
      targetPrice: Number(a.target_price),
      condition: a.direction as PriceAlert["condition"],
      active: a.enabled,
      triggered: a.triggered,
    })),
    isWatchlist: true,
    createdAt: row.created_at,
    updatedAt: row.created_at,
  };
}

export function mapPortfolio(
  row: PortfolioRow,
  positions: Position[],
  cashFlows: import("@/lib/types").CashFlow[] = []
): Portfolio {
  return {
    id: row.id,
    name: row.name,
    currency: row.currency as Currency,
    color: row.color ?? undefined,
    positions,
    categories: [],
    cashFlows,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSnapshot(row: SnapshotRow): PortfolioSnapshot {
  return {
    date: row.date,
    totalValue: Number(row.total_value),
    invested: Number(row.invested),
  };
}

export function positionToAssetInsert(
  position: Position,
  portfolioId: string
): Database["public"]["Tables"]["assets"]["Insert"] {
  return {
    id: position.id,
    portfolio_id: portfolioId,
    symbol: position.symbol,
    asset_name: position.name,
    asset_type: position.type,
    exchange: position.broker ?? null,
    currency: "EUR",
    logo_url: position.logoUrl ?? null,
    external_id: position.externalId ?? null,
    notes: position.notes ?? null,
    color: position.color ?? null,
    current_price: position.currentPrice ?? null,
    price_change_24h: position.priceChange24h ?? null,
    price_change_percent_24h: position.priceChangePercent24h ?? null,
  };
}

export function transactionToInsert(
  tx: Transaction,
  assetId: string
): Database["public"]["Tables"]["transactions"]["Insert"] {
  const { dbType, quantity, price, fees, taxes, notes } = prepareTransactionForDatabase(tx);
  return {
    id: tx.id,
    asset_id: assetId,
    transaction_type: dbType,
    quantity,
    price,
    fees,
    taxes: tx.taxes ?? taxes,
    date: tx.date,
    notes,
  };
}
