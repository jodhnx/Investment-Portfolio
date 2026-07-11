"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import type {
  AppState,
  AppSettings,
  AssetSearchResult,
  Category,
  Dividend,
  Portfolio,
  Position,
  PriceAlert,
  Transaction,
} from "@/lib/types";
import type { Profile } from "@/lib/supabase/database.types";
import { generateSnapshot } from "@/lib/calculations";
import { loadUserData } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/client";
import {
  syncAssetDelete,
  syncAssetInsert,
  syncAssetUpdate,
  syncDividendInsert,
  syncPortfolioDelete,
  syncPortfolioInsert,
  syncPortfolioUpdate,
  syncPriceUpdates,
  syncProfileUpdate,
  syncSnapshotInsert,
  syncTransactionInsert,
  syncWatchlistDelete,
  syncWatchlistInsert,
} from "@/lib/supabase/sync";
import { positionFromSearch } from "@/lib/storage";

const MAX_HISTORY = 50;

let hydrateInFlight: Promise<void> | null = null;
let lastHydratedUserId: string | null = null;

const emptyState: AppState = {
  portfolios: [],
  activePortfolioId: "",
  snapshots: {},
  settings: { theme: "dark", defaultCurrency: "EUR", priceRefreshInterval: 120000 },
  history: [],
  historyIndex: -1,
};

export interface PortfolioStore extends AppState {
  hydrated: boolean;
  profile: Profile | null;
  profileId: string | null;
  hydrate: () => Promise<void>;
  reset: () => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  setActivePortfolio: (id: string) => void;
  addPortfolio: (name: string) => void;
  updatePortfolio: (id: string, data: Partial<Portfolio>) => void;
  deletePortfolio: (id: string) => void;
  addPosition: (position: Position) => void;
  addPositionFromSearch: (asset: AssetSearchResult, watchlist?: boolean) => void;
  updatePosition: (id: string, data: Partial<Position>) => void;
  deletePosition: (id: string) => void;
  addTransaction: (positionId: string, tx: Omit<Transaction, "id">) => void;
  addDividend: (positionId: string, div: Omit<Dividend, "id">) => void;
  addPriceAlert: (positionId: string, alert: Omit<PriceAlert, "id" | "triggered">) => void;
  addCategory: (category: Omit<Category, "id">) => void;
  updatePrices: (updates: Record<string, { price: number; change24h?: number; changePercent24h?: number }>) => void;
  addSnapshot: (portfolioId: string) => void;
  importPositions: (positions: Partial<Position>[]) => void;
  getActivePortfolio: () => Portfolio | undefined;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateProfile: (data: Partial<Profile>) => void;
}

function withUpdatedPortfolio(
  state: AppState,
  portfolioId: string,
  updater: (p: Portfolio) => Portfolio
): AppState {
  return {
    ...state,
    portfolios: state.portfolios.map((p) =>
      p.id === portfolioId ? updater({ ...p, updatedAt: new Date().toISOString() }) : p
    ),
  };
}

function handleSyncError(error: string | null, action: string) {
  if (error) {
    toast.error(`Sync fehlgeschlagen: ${action}`, { description: error });
  }
}

export const usePortfolioStore = create<PortfolioStore>()(
  subscribeWithSelector((set, get) => ({
    ...emptyState,
    hydrated: false,
    profile: null,
    profileId: null,

    hydrate: async () => {
      if (hydrateInFlight) return hydrateInFlight;

      hydrateInFlight = (async () => {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            lastHydratedUserId = null;
            set({ ...emptyState, hydrated: true, profile: null, profileId: null });
            return;
          }

          const current = get();
          if (
            lastHydratedUserId === user.id &&
            current.hydrated &&
            current.profile?.auth_user_id === user.id
          ) {
            return;
          }

          const data = await loadUserData();
          if (!data) {
            lastHydratedUserId = user.id;
            set({ ...emptyState, hydrated: true, profile: null, profileId: null });
            return;
          }

          lastHydratedUserId = user.id;
          set({
            portfolios: data.portfolios,
            activePortfolioId: data.portfolios[0]?.id ?? "",
            snapshots: data.snapshots,
            settings: data.settings,
            profile: data.profile,
            profileId: data.profile.id,
            hydrated: true,
            history: [],
            historyIndex: -1,
          });
        } catch {
          toast.error("Daten konnten nicht geladen werden.");
          set({ hydrated: true });
        }
      })();

      try {
        await hydrateInFlight;
      } finally {
        hydrateInFlight = null;
      }
    },

    reset: () => {
      lastHydratedUserId = null;
      set({ ...emptyState, hydrated: false, profile: null, profileId: null });
    },

    pushHistory: () => {
      const { portfolios, activePortfolioId, snapshots, settings } = get();
      const snapshot: AppState = {
        portfolios: JSON.parse(JSON.stringify(portfolios)),
        activePortfolioId,
        snapshots: JSON.parse(JSON.stringify(snapshots)),
        settings: { ...settings },
        history: [],
        historyIndex: -1,
      };
      const history = get().history.slice(0, get().historyIndex + 1);
      history.push(snapshot);
      if (history.length > MAX_HISTORY) history.shift();
      set({ history, historyIndex: history.length - 1 });
    },

    undo: () => {
      const { historyIndex, history } = get();
      if (historyIndex < 0) return;
      const prev = history[historyIndex];
      set({ ...prev, history, historyIndex: historyIndex - 1, profile: get().profile, profileId: get().profileId, hydrated: true });
    },

    redo: () => {
      const { historyIndex, history } = get();
      if (historyIndex >= history.length - 2) return;
      const next = history[historyIndex + 2];
      if (!next) return;
      set({ ...next, history, historyIndex: historyIndex + 1, profile: get().profile, profileId: get().profileId, hydrated: true });
    },

    getActivePortfolio: () =>
      get().portfolios.find((p) => p.id === get().activePortfolioId),

    setActivePortfolio: (id) => set({ activePortfolioId: id }),

    addPortfolio: (name) => {
      get().pushHistory();
      const profileId = get().profileId;
      if (!profileId) return;
      const portfolio: Portfolio = {
        id: uuidv4(),
        name,
        currency: get().settings.defaultCurrency,
        color: "#6366f1",
        positions: [],
        categories: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((s) => ({
        portfolios: [...s.portfolios, portfolio],
        activePortfolioId: portfolio.id,
        snapshots: { ...s.snapshots, [portfolio.id]: [] },
      }));
      syncPortfolioInsert(profileId, portfolio).then(({ error }) =>
        handleSyncError(error, "Portfolio erstellen")
      );
    },

    updatePortfolio: (id, data) => {
      get().pushHistory();
      set((s) => withUpdatedPortfolio(s, id, (p) => ({ ...p, ...data })));
      syncPortfolioUpdate(id, data).then(({ error }) =>
        handleSyncError(error, "Portfolio aktualisieren")
      );
    },

    deletePortfolio: (id) => {
      get().pushHistory();
      set((s) => {
        const portfolios = s.portfolios.filter((p) => p.id !== id);
        return {
          portfolios,
          activePortfolioId:
            s.activePortfolioId === id ? portfolios[0]?.id ?? "" : s.activePortfolioId,
        };
      });
      syncPortfolioDelete(id).then(({ error }) =>
        handleSyncError(error, "Portfolio löschen")
      );
    },

    addPosition: (position) => {
      get().pushHistory();
      const pid = get().activePortfolioId;
      const profileId = get().profileId;
      set((s) =>
        withUpdatedPortfolio(s, pid, (p) => ({
          ...p,
          positions: [...p.positions, position],
        }))
      );
      if (position.isWatchlist && profileId) {
        syncWatchlistInsert(profileId, position.id, {
          id: position.externalId ?? position.symbol,
          name: position.name,
          symbol: position.symbol,
          type: position.type,
          logoUrl: position.logoUrl,
          currentPrice: position.currentPrice,
        }).then(({ error }) => handleSyncError(error, "Watchlist"));
      } else {
        syncAssetInsert(position, pid).then(({ error }) =>
          handleSyncError(error, "Asset hinzufügen")
        );
      }
    },

    addPositionFromSearch: (asset, watchlist = false) => {
      if (watchlist) {
        const now = new Date().toISOString();
        get().addPosition({
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
          isWatchlist: true,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        const position = positionFromSearch(asset, get().activePortfolioId);
        get().addPosition(position);
      }
    },

    updatePosition: (id, data) => {
      get().pushHistory();
      const pid = get().activePortfolioId;
      const pos = get().getActivePortfolio()?.positions.find((p) => p.id === id);
      set((s) =>
        withUpdatedPortfolio(s, pid, (p) => ({
          ...p,
          positions: p.positions.map((pos) =>
            pos.id === id ? { ...pos, ...data, updatedAt: new Date().toISOString() } : pos
          ),
        }))
      );
      if (pos?.isWatchlist) return;
      syncAssetUpdate(id, data).then(({ error }) =>
        handleSyncError(error, "Asset aktualisieren")
      );
    },

    deletePosition: (id) => {
      get().pushHistory();
      const pid = get().activePortfolioId;
      const pos = get().getActivePortfolio()?.positions.find((p) => p.id === id);
      set((s) =>
        withUpdatedPortfolio(s, pid, (p) => ({
          ...p,
          positions: p.positions.filter((pos) => pos.id !== id),
        }))
      );
      if (pos?.isWatchlist) {
        syncWatchlistDelete(id).then(({ error }) => handleSyncError(error, "Watchlist"));
      } else {
        syncAssetDelete(id).then(({ error }) => handleSyncError(error, "Asset löschen"));
      }
    },

    addTransaction: (positionId, tx) => {
      get().pushHistory();
      const pid = get().activePortfolioId;
      const transaction: Transaction = { ...tx, id: uuidv4() };
      set((s) =>
        withUpdatedPortfolio(s, pid, (p) => ({
          ...p,
          positions: p.positions.map((pos) =>
            pos.id === positionId
              ? { ...pos, transactions: [...pos.transactions, transaction], updatedAt: new Date().toISOString() }
              : pos
          ),
        }))
      );
      syncTransactionInsert(transaction, positionId).then(({ error }) =>
        handleSyncError(error, "Transaktion speichern")
      );
    },

    addDividend: (positionId, div) => {
      get().pushHistory();
      const pid = get().activePortfolioId;
      const dividend: Dividend = { ...div, id: uuidv4() };
      set((s) =>
        withUpdatedPortfolio(s, pid, (p) => ({
          ...p,
          positions: p.positions.map((pos) =>
            pos.id === positionId ? { ...pos, dividends: [...pos.dividends, dividend] } : pos
          ),
        }))
      );
      syncDividendInsert(dividend, positionId).then(({ error }) =>
        handleSyncError(error, "Dividende speichern")
      );
    },

    addPriceAlert: (positionId, alert) => {
      get().pushHistory();
      const pid = get().activePortfolioId;
      const profileId = get().profileId;
      const pos = get().getActivePortfolio()?.positions.find((p) => p.id === positionId);
      const priceAlert: PriceAlert = { ...alert, id: uuidv4(), triggered: false };
      set((s) =>
        withUpdatedPortfolio(s, pid, (p) => ({
          ...p,
          positions: p.positions.map((pos) =>
            pos.id === positionId ? { ...pos, priceAlerts: [...pos.priceAlerts, priceAlert] } : pos
          ),
        }))
      );
      if (profileId && pos) {
        import("@/lib/supabase/client").then(({ createClient }) => {
          createClient()
            .from("price_alerts")
            .insert({
              id: priceAlert.id,
              profile_id: profileId,
              symbol: pos.symbol,
              target_price: alert.targetPrice,
              direction: alert.condition,
              enabled: alert.active,
            })
            .then(({ error }) => handleSyncError(error?.message ?? null, "Preisalarm"));
        });
      }
    },

    addCategory: (category) => {
      get().pushHistory();
      const pid = get().activePortfolioId;
      const cat: Category = { ...category, id: uuidv4() };
      set((s) =>
        withUpdatedPortfolio(s, pid, (p) => ({ ...p, categories: [...p.categories, cat] }))
      );
    },

    updatePrices: (updates) => {
      const pid = get().activePortfolioId;
      const portfolio = get().portfolios.find((p) => p.id === pid);
      if (!portfolio) return;

      set((s) =>
        withUpdatedPortfolio(s, pid, (p) => ({
          ...p,
          positions: p.positions.map((pos) => {
            const key = pos.externalId ?? pos.symbol;
            const u = updates[key];
            if (!u) return pos;
            return {
              ...pos,
              currentPrice: u.price,
              priceChange24h: u.change24h,
              priceChangePercent24h: u.changePercent24h,
            };
          }),
        }))
      );

      syncPriceUpdates(
        updates,
        portfolio.positions.map((p) => ({
          id: p.id,
          externalId: p.externalId,
          symbol: p.symbol,
          isWatchlist: p.isWatchlist,
        }))
      );
    },

    addSnapshot: (portfolioId) => {
      const portfolio = get().portfolios.find((p) => p.id === portfolioId);
      if (!portfolio) return;
      const snap = generateSnapshot(portfolio);
      set((s) => ({
        snapshots: {
          ...s.snapshots,
          [portfolioId]: [...(s.snapshots[portfolioId] ?? []), snap].slice(-365),
        },
      }));
      syncSnapshotInsert(portfolioId, snap.totalValue, snap.invested).then(({ error }) =>
        handleSyncError(error, "Snapshot speichern")
      );
    },

    importPositions: (positions) => {
      get().pushHistory();
      const pid = get().activePortfolioId;
      const newPositions = positions.filter(Boolean).map((pos) => ({
        ...(pos as Position),
        id: pos.id ?? uuidv4(),
        transactions: pos.transactions ?? [],
        dividends: pos.dividends ?? [],
        priceAlerts: pos.priceAlerts ?? [],
        isWatchlist: false,
        createdAt: pos.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      set((s) =>
        withUpdatedPortfolio(s, pid, (p) => ({
          ...p,
          positions: [...p.positions, ...newPositions],
        }))
      );
      newPositions.forEach((pos) => {
        syncAssetInsert(pos, pid).then(({ error }) => {
          if (!error && pos.transactions.length) {
            pos.transactions.forEach((tx) =>
              syncTransactionInsert(tx, pos.id)
            );
          }
        });
      });
    },

    updateSettings: (settings) => {
      set((s) => ({ settings: { ...s.settings, ...settings } }));
      const profileId = get().profileId;
      if (profileId && settings.defaultCurrency) {
        syncProfileUpdate(profileId, { currency: settings.defaultCurrency });
      }
    },

    updateProfile: (data) => {
      const profileId = get().profileId;
      if (!profileId) return;
      set((s) => ({
        profile: s.profile ? { ...s.profile, ...data } : null,
      }));
      syncProfileUpdate(profileId, {
        name: data.name ?? undefined,
        avatar: data.avatar ?? undefined,
        currency: data.currency ?? undefined,
        country: data.country ?? undefined,
        language: data.language ?? undefined,
      }).then(({ error }) => handleSyncError(error, "Profil aktualisieren"));
    },
  }))
);
