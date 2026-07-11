"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type {
  AppState,
  AssetSearchResult,
  Category,
  Dividend,
  Portfolio,
  Position,
  PriceAlert,
  Transaction,
} from "@/lib/types";
import { generateSnapshot } from "@/lib/calculations";
import {
  createDefaultPortfolio,
  createInitialState,
  loadState,
  positionFromSearch,
  saveState,
} from "@/lib/storage";

const MAX_HISTORY = 50;

interface PortfolioStore extends AppState {
  hydrated: boolean;
  hydrate: () => void;
  persist: () => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  setActivePortfolio: (id: string) => void;
  addPortfolio: (name: string) => void;
  updatePortfolio: (id: string, data: Partial<Portfolio>) => void;
  deletePortfolio: (id: string) => void;
  addPosition: (position: Position) => void;
  addPositionFromSearch: (asset: AssetSearchResult) => void;
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
  updateSettings: (settings: Partial<AppState["settings"]>) => void;
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

export const usePortfolioStore = create<PortfolioStore>()(
  subscribeWithSelector((set, get) => ({
    ...createInitialState(),
    hydrated: false,

    hydrate: () => {
      const loaded = loadState();
      set({ ...loaded, hydrated: true });
    },

    persist: () => {
      const state = get();
      if (!state.hydrated) return;
      saveState({
        portfolios: state.portfolios,
        activePortfolioId: state.activePortfolioId,
        snapshots: state.snapshots,
        settings: state.settings,
        history: [],
        historyIndex: -1,
      });
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
      set({
        ...prev,
        history,
        historyIndex: historyIndex - 1,
      });
      get().persist();
    },

    redo: () => {
      const { historyIndex, history } = get();
      if (historyIndex >= history.length - 2) return;
      const next = history[historyIndex + 2];
      if (!next) return;
      set({
        ...next,
        history,
        historyIndex: historyIndex + 1,
      });
      get().persist();
    },

    getActivePortfolio: () =>
      get().portfolios.find((p) => p.id === get().activePortfolioId),

    setActivePortfolio: (id) => set({ activePortfolioId: id }),

    addPortfolio: (name) => {
      get().pushHistory();
      const portfolio = createDefaultPortfolio(name);
      set((s) => ({
        portfolios: [...s.portfolios, portfolio],
        activePortfolioId: portfolio.id,
        snapshots: { ...s.snapshots, [portfolio.id]: [] },
      }));
      get().persist();
    },

    updatePortfolio: (id, data) => {
      get().pushHistory();
      set((s) =>
        withUpdatedPortfolio(s, id, (p) => ({ ...p, ...data }))
      );
      get().persist();
    },

    deletePortfolio: (id) => {
      get().pushHistory();
      set((s) => {
        const portfolios = s.portfolios.filter((p) => p.id !== id);
        return {
          portfolios,
          activePortfolioId:
            s.activePortfolioId === id
              ? portfolios[0]?.id ?? ""
              : s.activePortfolioId,
        };
      });
      get().persist();
    },

    addPosition: (position) => {
      get().pushHistory();
      const pid = get().activePortfolioId;
      set((s) =>
        withUpdatedPortfolio(s, pid, (p) => ({
          ...p,
          positions: [...p.positions, position],
        }))
      );
      get().persist();
    },

    addPositionFromSearch: (asset) => {
      const position = positionFromSearch(asset, get().activePortfolioId);
      get().addPosition(position);
    },

    updatePosition: (id, data) => {
      get().pushHistory();
      const pid = get().activePortfolioId;
      set((s) =>
        withUpdatedPortfolio(s, pid, (p) => ({
          ...p,
          positions: p.positions.map((pos) =>
            pos.id === id
              ? { ...pos, ...data, updatedAt: new Date().toISOString() }
              : pos
          ),
        }))
      );
      get().persist();
    },

    deletePosition: (id) => {
      get().pushHistory();
      const pid = get().activePortfolioId;
      set((s) =>
        withUpdatedPortfolio(s, pid, (p) => ({
          ...p,
          positions: p.positions.filter((pos) => pos.id !== id),
        }))
      );
      get().persist();
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
              ? {
                  ...pos,
                  transactions: [...pos.transactions, transaction],
                  updatedAt: new Date().toISOString(),
                }
              : pos
          ),
        }))
      );
      get().persist();
    },

    addDividend: (positionId, div) => {
      get().pushHistory();
      const pid = get().activePortfolioId;
      const dividend: Dividend = { ...div, id: uuidv4() };
      set((s) =>
        withUpdatedPortfolio(s, pid, (p) => ({
          ...p,
          positions: p.positions.map((pos) =>
            pos.id === positionId
              ? { ...pos, dividends: [...pos.dividends, dividend] }
              : pos
          ),
        }))
      );
      get().persist();
    },

    addPriceAlert: (positionId, alert) => {
      get().pushHistory();
      const pid = get().activePortfolioId;
      const priceAlert: PriceAlert = {
        ...alert,
        id: uuidv4(),
        triggered: false,
      };
      set((s) =>
        withUpdatedPortfolio(s, pid, (p) => ({
          ...p,
          positions: p.positions.map((pos) =>
            pos.id === positionId
              ? { ...pos, priceAlerts: [...pos.priceAlerts, priceAlert] }
              : pos
          ),
        }))
      );
      get().persist();
    },

    addCategory: (category) => {
      get().pushHistory();
      const pid = get().activePortfolioId;
      const cat: Category = { ...category, id: uuidv4() };
      set((s) =>
        withUpdatedPortfolio(s, pid, (p) => ({
          ...p,
          categories: [...p.categories, cat],
        }))
      );
      get().persist();
    },

    updatePrices: (updates) => {
      const pid = get().activePortfolioId;
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
      get().persist();
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
      get().persist();
    },

    importPositions: (positions) => {
      get().pushHistory();
      const pid = get().activePortfolioId;
      set((s) =>
        withUpdatedPortfolio(s, pid, (p) => ({
          ...p,
          positions: [
            ...p.positions,
            ...positions.filter(Boolean).map((pos) => ({
              ...(pos as Position),
              id: pos.id ?? uuidv4(),
              transactions: pos.transactions ?? [],
              dividends: pos.dividends ?? [],
              priceAlerts: pos.priceAlerts ?? [],
              isWatchlist: pos.isWatchlist ?? false,
              createdAt: pos.createdAt ?? new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })),
          ],
        }))
      );
      get().persist();
    },

    updateSettings: (settings) => {
      set((s) => ({ settings: { ...s.settings, ...settings } }));
      get().persist();
    },
  }))
);

if (typeof window !== "undefined") {
  usePortfolioStore.subscribe(
    (s) => s.portfolios,
    () => {
      if (usePortfolioStore.getState().hydrated) {
        usePortfolioStore.getState().persist();
      }
    }
  );
}
