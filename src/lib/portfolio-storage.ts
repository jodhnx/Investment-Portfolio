const ACTIVE_PORTFOLIO_KEY = "velo-active-portfolio";

export function persistActivePortfolioId(id: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_PORTFOLIO_KEY, id);
  } catch {
    /* ignore */
  }
}

export function readActivePortfolioId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_PORTFOLIO_KEY);
  } catch {
    return null;
  }
}

export function clearActivePortfolioId() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACTIVE_PORTFOLIO_KEY);
  } catch {
    /* ignore */
  }
}

export function resolveActivePortfolioId(
  portfolios: { id: string; archived?: boolean; isDefault?: boolean }[],
  persistedId: string | null,
  dbActiveId?: string | null
): string {
  const active = portfolios.filter((p) => !p.archived);
  const candidates = [persistedId, dbActiveId].filter(Boolean) as string[];
  for (const id of candidates) {
    if (active.some((p) => p.id === id)) return id;
  }
  const defaultPortfolio = active.find((p) => p.isDefault);
  if (defaultPortfolio) return defaultPortfolio.id;
  return active[0]?.id ?? portfolios[0]?.id ?? "";
}
