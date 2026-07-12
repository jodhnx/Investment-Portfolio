import { createClient } from "@/lib/supabase/client";
import type { AssetSearchResult, Dividend, Portfolio, PortfolioInput, Position, Transaction } from "@/lib/types";
import {
  positionToAssetInsert,
  transactionToInsert,
} from "./mappers";

type SyncResult = { error: string | null };

function getSupabase() {
  return createClient();
}

export async function syncPortfolioInsert(
  profileId: string,
  portfolio: Pick<
    Portfolio,
    "id" | "name" | "description" | "currency" | "color" | "icon" | "startCapital" | "isDefault"
  >
): Promise<SyncResult> {
  const { error } = await getSupabase().from("portfolios").insert({
    id: portfolio.id,
    profile_id: profileId,
    name: portfolio.name,
    description: portfolio.description ?? null,
    currency: portfolio.currency,
    color: portfolio.color ?? "#2dd4bf",
    icon: portfolio.icon ?? "Briefcase",
    start_capital: portfolio.startCapital ?? 0,
    is_default: portfolio.isDefault ?? false,
  });
  return { error: error?.message ?? null };
}

export async function syncPortfolioUpdate(
  id: string,
  data: Partial<
    Pick<
      Portfolio,
      "name" | "description" | "currency" | "color" | "icon" | "startCapital" | "archived" | "isDefault"
    >
  >
): Promise<SyncResult> {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.description !== undefined) payload.description = data.description;
  if (data.currency !== undefined) payload.currency = data.currency;
  if (data.color !== undefined) payload.color = data.color;
  if (data.icon !== undefined) payload.icon = data.icon;
  if (data.startCapital !== undefined) payload.start_capital = data.startCapital;
  if (data.archived !== undefined) payload.archived = data.archived;
  if (data.isDefault !== undefined) payload.is_default = data.isDefault;
  const { error } = await getSupabase().from("portfolios").update(payload).eq("id", id);
  return { error: error?.message ?? null };
}

export async function syncPortfolioDelete(id: string): Promise<SyncResult> {
  const { error } = await getSupabase().from("portfolios").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function syncAssetInsert(
  position: Position,
  portfolioId: string
): Promise<SyncResult> {
  const { error } = await getSupabase()
    .from("assets")
    .insert(positionToAssetInsert(position, portfolioId));
  return { error: error?.message ?? null };
}

export async function syncAssetUpdate(
  id: string,
  data: Partial<Position>
): Promise<SyncResult> {
  const { error } = await getSupabase()
    .from("assets")
    .update({
      asset_name: data.name,
      symbol: data.symbol,
      asset_type: data.type,
      exchange: data.broker ?? null,
      logo_url: data.logoUrl ?? null,
      external_id: data.externalId ?? null,
      notes: data.notes ?? null,
      color: data.color ?? null,
      current_price: data.currentPrice ?? null,
      price_change_24h: data.priceChange24h ?? null,
      price_change_percent_24h: data.priceChangePercent24h ?? null,
    })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function syncAssetDelete(id: string): Promise<SyncResult> {
  const { error } = await getSupabase().from("assets").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function syncWatchlistInsert(
  profileId: string,
  portfolioId: string,
  positionId: string,
  asset: AssetSearchResult
): Promise<SyncResult> {
  const { error } = await getSupabase().from("watchlist").insert({
    id: positionId,
    profile_id: profileId,
    portfolio_id: portfolioId,
    symbol: asset.symbol,
    asset_name: asset.name,
    asset_type: asset.type,
    logo_url: asset.logoUrl ?? null,
    external_id: asset.id,
    current_price: asset.currentPrice ?? null,
  });
  return { error: error?.message ?? null };
}

export async function syncWatchlistDelete(id: string): Promise<SyncResult> {
  const { error } = await getSupabase().from("watchlist").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function syncTransactionInsert(
  tx: Transaction,
  assetId: string
): Promise<SyncResult> {
  const { error } = await getSupabase()
    .from("transactions")
    .insert(transactionToInsert(tx, assetId));
  return { error: error?.message ?? null };
}

export async function syncTransactionUpdate(
  tx: Transaction,
  assetId: string
): Promise<SyncResult> {
  const row = transactionToInsert(tx, assetId);
  const { error } = await getSupabase()
    .from("transactions")
    .update({
      transaction_type: row.transaction_type,
      quantity: row.quantity,
      price: row.price,
      fees: row.fees,
      taxes: row.taxes,
      date: row.date,
      notes: row.notes,
    })
    .eq("id", tx.id);
  return { error: error?.message ?? null };
}

export async function syncTransactionDelete(id: string): Promise<SyncResult> {
  const { error } = await getSupabase().from("transactions").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function syncDividendInsert(
  div: Dividend,
  assetId: string
): Promise<SyncResult> {
  const { error } = await getSupabase().from("dividends").insert({
    id: div.id,
    asset_id: assetId,
    amount: div.amount,
    date: div.date,
    notes: div.notes ?? null,
  });
  return { error: error?.message ?? null };
}

export async function syncDividendDelete(id: string): Promise<SyncResult> {
  const { error } = await getSupabase().from("dividends").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function syncCashFlowInsert(
  flow: import("@/lib/types").CashFlow,
  portfolioId: string
): Promise<SyncResult> {
  const { error } = await getSupabase().from("cash_flows").insert({
    id: flow.id,
    portfolio_id: portfolioId,
    flow_type: flow.type,
    amount: flow.amount,
    date: flow.date,
    category: flow.category ?? null,
    notes: flow.notes ?? null,
  });
  return { error: error?.message ?? null };
}

export async function syncCashFlowUpdate(
  flow: import("@/lib/types").CashFlow
): Promise<SyncResult> {
  const { error } = await getSupabase()
    .from("cash_flows")
    .update({
      flow_type: flow.type,
      amount: flow.amount,
      date: flow.date,
      category: flow.category ?? null,
      notes: flow.notes ?? null,
    })
    .eq("id", flow.id);
  return { error: error?.message ?? null };
}

export async function syncCashFlowDelete(id: string): Promise<SyncResult> {
  const { error } = await getSupabase().from("cash_flows").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function syncSnapshotInsert(
  portfolioId: string,
  totalValue: number,
  invested: number
): Promise<SyncResult> {
  const { error } = await getSupabase().from("portfolio_snapshots").insert({
    portfolio_id: portfolioId,
    total_value: totalValue,
    invested,
  });
  return { error: error?.message ?? null };
}

export async function syncPriceUpdates(
  updates: Record<string, { price: number; change24h?: number; changePercent24h?: number }>,
  assets: { id: string; externalId?: string; symbol: string; isWatchlist: boolean }[]
): Promise<void> {
  const supabase = getSupabase();
  const promises = assets.map(async (asset) => {
    const key = asset.externalId ?? asset.symbol;
    const u = updates[key];
    if (!u) return;

    if (asset.isWatchlist) {
      await supabase
        .from("watchlist")
        .update({
          current_price: u.price,
          price_change_24h: u.change24h ?? null,
          price_change_percent_24h: u.changePercent24h ?? null,
        })
        .eq("id", asset.id);
    } else {
      await supabase
        .from("assets")
        .update({
          current_price: u.price,
          price_change_24h: u.change24h ?? null,
          price_change_percent_24h: u.changePercent24h ?? null,
        })
        .eq("id", asset.id);
    }
  });
  await Promise.all(promises);
}

export async function syncProfileUpdate(
  profileId: string,
  data: {
    name?: string;
    avatar?: string;
    currency?: string;
    country?: string;
    language?: string;
    active_portfolio_id?: string;
  }
): Promise<SyncResult> {
  const { error } = await getSupabase()
    .from("profiles")
    .update(data)
    .eq("id", profileId);
  return { error: error?.message ?? null };
}

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const supabase = getSupabase();
  const ext = file.name.split(".").pop();
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) return { url: null, error: uploadError.message };

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
