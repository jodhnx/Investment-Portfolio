import type { CashFlow, Portfolio } from "./types";
import { computePosition } from "./calculations";

export interface CashFlowStats {
  totalDeposits: number;
  totalWithdrawals: number;
  availableCapital: number;
  investedCapital: number;
  uninvestedCapital: number;
  totalPortfolio: number;
}

export function computeCashFlowStats(
  portfolio: Portfolio,
  cashFlows: CashFlow[] = portfolio.cashFlows ?? []
): CashFlowStats {
  const totalDeposits = cashFlows
    .filter((c) => c.type === "DEPOSIT")
    .reduce((s, c) => s + c.amount, 0);
  const totalWithdrawals = cashFlows
    .filter((c) => c.type === "WITHDRAWAL")
    .reduce((s, c) => s + c.amount, 0);

  const positions = portfolio.positions
    .filter((p) => !p.isWatchlist)
    .map(computePosition);

  const investedCapital = positions.reduce((s, p) => s + p.invested, 0);
  const totalPortfolio = positions.reduce((s, p) => s + p.currentValue, 0);
  const netCash = totalDeposits - totalWithdrawals;
  const availableCapital = Math.max(0, netCash - investedCapital);
  const uninvestedCapital = availableCapital;

  return {
    totalDeposits,
    totalWithdrawals,
    availableCapital,
    investedCapital,
    uninvestedCapital,
    totalPortfolio: totalPortfolio + availableCapital,
  };
}
