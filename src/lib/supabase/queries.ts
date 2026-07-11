import { createClient } from "@/lib/supabase/client";
import { syncProfileFromUser } from "@/lib/auth/profile-sync";
import { logAuthError } from "@/lib/auth/logger";
import type { Profile } from "@/lib/supabase/database.types";
import type { AppSettings, Portfolio, PortfolioSnapshot } from "@/lib/types";
import {
  mapAssetToPosition,
  mapPortfolio,
  mapSnapshot,
  mapWatchlistToPosition,
} from "./mappers";

export interface LoadedUserData {
  profile: Profile;
  portfolios: Portfolio[];
  watchlistPortfolioId: string | null;
  snapshots: Record<string, PortfolioSnapshot[]>;
  settings: AppSettings;
}

/** Lädt alle benutzerspezifischen Daten aus Supabase */
export async function loadUserData(): Promise<LoadedUserData | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!profile) {
    await syncProfileFromUser(supabase, user);
    const retry = await supabase
      .from("profiles")
      .select("*")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    profile = retry.data;
    profileError = retry.error;
  }

  if (profileError) {
    logAuthError("loadUserData:profile", profileError);
  }

  if (!profile) {
    logAuthError("loadUserData:profile", "Profil konnte nicht geladen oder erstellt werden");
    return null;
  }

  const profileRow = profile as Profile;

  const [
    { data: portfolios },
    { data: assets },
    { data: transactions },
    { data: dividends },
    { data: watchlist },
    { data: alerts },
    { data: snapshots },
    cashFlowsResult,
  ] = await Promise.all([
    supabase.from("portfolios").select("*").eq("profile_id", profileRow.id).order("created_at"),
    supabase.from("assets").select("*"),
    supabase.from("transactions").select("*").order("date"),
    supabase.from("dividends").select("*").order("date"),
    supabase.from("watchlist").select("*").eq("profile_id", profileRow.id),
    supabase.from("price_alerts").select("*").eq("profile_id", profileRow.id),
    supabase.from("portfolio_snapshots").select("*").order("date"),
    supabase.from("cash_flows").select("*").order("date"),
  ]);

  const cashFlowRows = cashFlowsResult.data ?? [];

  const portfolioRows = portfolios ?? [];
  const assetRows = assets ?? [];
  const txRows = transactions ?? [];
  const divRows = dividends ?? [];
  const alertRows = alerts ?? [];

  const mappedPortfolios: Portfolio[] = portfolioRows.map((p) => {
    const portfolioAssets = assetRows.filter((a) => a.portfolio_id === p.id);
    const positions = portfolioAssets.map((a) =>
      mapAssetToPosition(
        a,
        txRows.filter((t) => t.asset_id === a.id),
        divRows.filter((d) => d.asset_id === a.id),
        alertRows
      )
    );
    const flows = cashFlowRows
      .filter((c) => c.portfolio_id === p.id)
      .map((c) => ({
        id: c.id,
        type: c.flow_type as "DEPOSIT" | "WITHDRAWAL",
        amount: Number(c.amount),
        date: c.date,
        category: c.category ?? undefined,
        notes: c.notes ?? undefined,
      }));
    return mapPortfolio(p, positions, flows);
  });

  // Watchlist als virtuelles Portfolio anhängen
  const watchlistItems = watchlist ?? [];
  let watchlistPortfolioId: string | null = null;

  if (watchlistItems.length > 0 && mappedPortfolios.length > 0) {
    watchlistPortfolioId = mappedPortfolios[0].id;
    const watchlistPositions = watchlistItems.map((w) =>
      mapWatchlistToPosition(w, alertRows)
    );
    mappedPortfolios[0] = {
      ...mappedPortfolios[0],
      positions: [...mappedPortfolios[0].positions, ...watchlistPositions],
    };
  }

  const snapshotMap: Record<string, PortfolioSnapshot[]> = {};
  for (const row of snapshots ?? []) {
    if (!snapshotMap[row.portfolio_id]) snapshotMap[row.portfolio_id] = [];
    snapshotMap[row.portfolio_id].push(mapSnapshot(row));
  }

  const settings: AppSettings = {
    theme: "dark",
    defaultCurrency: profileRow.currency as AppSettings["defaultCurrency"],
    priceRefreshInterval: 60000,
  };

  return {
    profile: profileRow,
    portfolios: mappedPortfolios,
    watchlistPortfolioId,
    snapshots: snapshotMap,
    settings,
  };
}

/** Erstellt erstes Portfolio nach Onboarding */
export async function createInitialPortfolio(
  profileId: string,
  name = "Hauptportfolio",
  currency = "EUR"
): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("portfolios")
    .insert({ profile_id: profileId, name, currency })
    .select("id")
    .single();

  if (error) {
    console.error("createInitialPortfolio:", error);
    return null;
  }
  return data.id;
}

/** Profil nach Onboarding aktualisieren */
export async function completeOnboarding(
  profileId: string,
  data: {
    name: string;
    currency: string;
    country: string;
    language: string;
    timezone: string;
  }
): Promise<boolean> {
  const supabase = createClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name: data.name,
      currency: data.currency,
      country: data.country,
      language: data.language,
      timezone: data.timezone,
      onboarding_complete: true,
    })
    .eq("id", profileId);

  if (profileError) return false;

  const { data: existing } = await supabase
    .from("portfolios")
    .select("id")
    .eq("profile_id", profileId)
    .limit(1);

  if (!existing?.length) {
    await createInitialPortfolio(profileId, "Hauptportfolio", data.currency);
  }

  return true;
}

/** Alle Benutzerdaten exportieren */
export async function exportAllUserData(profileId: string) {
  const supabase = createClient();
  const [portfolios, watchlist, alerts, notes] = await Promise.all([
    supabase.from("portfolios").select("*, assets(*, transactions(*), dividends(*))").eq("profile_id", profileId),
    supabase.from("watchlist").select("*").eq("profile_id", profileId),
    supabase.from("price_alerts").select("*").eq("profile_id", profileId),
    supabase.from("notes").select("*").eq("profile_id", profileId),
  ]);
  return {
    exportedAt: new Date().toISOString(),
    portfolios: portfolios.data,
    watchlist: watchlist.data,
    priceAlerts: alerts.data,
    notes: notes.data,
  };
}

/** Konto und alle Daten löschen */
export async function deleteAccount(): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.rpc("delete_user" as never);
  if (error) {
    // Fallback: Profil löschen + Auth signOut (Cascade löscht Daten)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").delete().eq("auth_user_id", user.id);
    }
    await supabase.auth.signOut();
    return { error: null };
  }
  await supabase.auth.signOut();
  return { error: null };
}
