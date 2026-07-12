import type { PortfolioSnapshot } from "@/lib/types";
import type { PortfolioStore } from "@/store/portfolio-store";

/** Stabile leere Referenz – niemals `?? []` inline in useSyncExternalStore-Selektoren! */
const EMPTY_SNAPSHOTS: PortfolioSnapshot[] = [];

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

export function selectVisiblePortfolios(state: PortfolioStore) {
  return state.portfolios.filter((p) => !p.archived);
}

export function selectProfile(state: PortfolioStore) {
  return state.profile;
}
