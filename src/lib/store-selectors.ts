import type { Portfolio, PortfolioSnapshot } from "@/lib/types";
import type { PortfolioStore } from "@/store/portfolio-store";

/** Stabile leere Referenz – niemals `?? []` inline in useSyncExternalStore-Selektoren! */
const EMPTY_SNAPSHOTS: PortfolioSnapshot[] = [];
const EMPTY_PORTFOLIOS: Portfolio[] = [];

let cachedPortfoliosRef: Portfolio[] | null = null;
let cachedVisiblePortfolios: Portfolio[] = EMPTY_PORTFOLIOS;

/** Stabiler Selektor – keine Funktionsaufrufe im Hook */
export function selectActivePortfolio(state: PortfolioStore) {
  return state.portfolios.find((p) => p.id === state.activePortfolioId);
}

export function selectActivePortfolioId(state: PortfolioStore) {
  return state.activePortfolioId;
}

export function selectPositionCount(state: PortfolioStore) {
  return (
    state.portfolios.find((p) => p.id === state.activePortfolioId)?.positions.length ?? 0
  );
}

export function selectSnapshotsForActivePortfolio(state: PortfolioStore) {
  const id = state.activePortfolioId;
  if (!id) return EMPTY_SNAPSHOTS;
  return state.snapshots[id] ?? EMPTY_SNAPSHOTS;
}

/** Gefilterte Portfolios – Referenz bleibt stabil solange state.portfolios unverändert */
export function selectVisiblePortfolios(state: PortfolioStore): Portfolio[] {
  if (state.portfolios === cachedPortfoliosRef) {
    return cachedVisiblePortfolios;
  }
  cachedPortfoliosRef = state.portfolios;
  const hasArchived = state.portfolios.some((p) => p.archived);
  if (!hasArchived) {
    cachedVisiblePortfolios = state.portfolios;
  } else {
    const visible = state.portfolios.filter((p) => !p.archived);
    cachedVisiblePortfolios = visible.length === 0 ? EMPTY_PORTFOLIOS : visible;
  }
  return cachedVisiblePortfolios;
}

export function selectProfile(state: PortfolioStore) {
  return state.profile;
}
