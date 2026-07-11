import type {
  ComputedPosition,
  DashboardStats,
  Dividend,
  Position,
  Portfolio,
  PortfolioSnapshot,
  Transaction,
} from "./types";

/** Berechnet Menge, Durchschnittspreis und realisierten Gewinn aus Transaktionen */
export function computeTransactionStats(transactions: Transaction[]) {
  let totalQuantity = 0;
  let totalCost = 0;
  let totalFees = 0;
  let realizedProfit = 0;
  let avgBuyPrice = 0;

  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const tx of sorted) {
    if (tx.type === "BUY") {
      totalCost += tx.quantity * tx.price;
      totalQuantity += tx.quantity;
      totalFees += tx.fees;
      avgBuyPrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;
    } else {
      const sellQty = Math.min(tx.quantity, totalQuantity);
      const costBasis = sellQty * avgBuyPrice;
      const proceeds = sellQty * tx.price - tx.fees;
      realizedProfit += proceeds - costBasis;
      totalQuantity -= sellQty;
      totalCost = totalQuantity * avgBuyPrice;
      totalFees += tx.fees;
    }
  }

  return {
    quantity: totalQuantity,
    avgBuyPrice,
    invested: totalCost,
    totalFees,
    realizedProfit,
    firstPurchaseDate: sorted.find((t) => t.type === "BUY")?.date,
  };
}

export function computePosition(position: Position): ComputedPosition {
  const stats = computeTransactionStats(position.transactions);
  const currentPrice = position.currentPrice ?? stats.avgBuyPrice;
  const currentValue = stats.quantity * currentPrice;
  const profitLoss =
    currentValue - stats.invested + stats.realizedProfit;
  const profitLossPercent =
    stats.invested > 0
      ? ((currentValue - stats.invested) / stats.invested) * 100
      : 0;

  return {
    id: position.id,
    name: position.name,
    symbol: position.symbol,
    type: position.type,
    broker: position.broker,
    logoUrl: position.logoUrl,
    notes: position.notes,
    color: position.color,
    categoryId: position.categoryId,
    purchaseDate: stats.firstPurchaseDate,
    buyPrice: stats.avgBuyPrice,
    currentPrice,
    quantity: stats.quantity,
    invested: stats.invested,
    currentValue,
    profitLoss,
    profitLossPercent,
    fees: stats.totalFees,
    avgBuyPrice: stats.avgBuyPrice,
    priceChange24h: position.priceChange24h,
    priceChangePercent24h: position.priceChangePercent24h,
    isWatchlist: position.isWatchlist,
  };
}

export function computePortfolioStats(
  portfolio: Portfolio
): DashboardStats {
  const positions = portfolio.positions
    .filter((p) => !p.isWatchlist)
    .map(computePosition)
    .filter((p) => p.quantity > 0 || p.invested > 0);

  const totalValue = positions.reduce((s, p) => s + p.currentValue, 0);
  const totalInvested = positions.reduce((s, p) => s + p.invested, 0);
  const profitLoss = positions.reduce((s, p) => s + p.profitLoss, 0);
  const profitLossPercent =
    totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  const dayChange = positions.reduce((s, p) => {
    const change = p.priceChange24h ?? 0;
    return s + change * p.quantity;
  }, 0);
  const dayChangePercent =
    totalValue > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0;

  const realMoneyProfit = positions.reduce((s, p) => {
    const stats = computeTransactionStats(
      portfolio.positions.find((pos) => pos.id === p.id)!.transactions
    );
    return s + stats.realizedProfit + (p.currentValue - p.invested);
  }, 0);

  const ranked = [...positions]
    .filter((p) => p.invested > 0)
    .sort((a, b) => b.profitLossPercent - a.profitLossPercent);

  return {
    totalValue,
    totalInvested,
    profitLoss,
    profitLossPercent,
    dayChange,
    dayChangePercent,
    realMoneyProfit,
    positionCount: positions.length,
    bestInvestment: ranked[0]
      ? { name: ranked[0].name, profitPercent: ranked[0].profitLossPercent }
      : null,
    worstInvestment: ranked.length
      ? {
          name: ranked[ranked.length - 1].name,
          profitPercent: ranked[ranked.length - 1].profitLossPercent,
        }
      : null,
  };
}

/** Investment-Rechner */
export function calculateTrade(params: {
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  fees: number;
  taxes: number;
}) {
  const gross = (params.sellPrice - params.buyPrice) * params.quantity;
  const totalFees = params.fees * 2;
  const afterFees = gross - totalFees;
  const afterTaxes = afterFees - params.taxes;
  const percent =
    params.buyPrice * params.quantity > 0
      ? (afterTaxes / (params.buyPrice * params.quantity)) * 100
      : 0;
  const breakEven =
    params.quantity > 0
      ? params.buyPrice + (totalFees + params.taxes) / params.quantity
      : 0;

  return { gross, afterFees, afterTaxes, percent, breakEven };
}

/** Sparplan-Rechner mit monatlicher Einzahlung */
export function calculateSavingsPlan(params: {
  monthlyRate: number;
  annualReturn: number;
  years: number;
  inflation: number;
}) {
  const monthlyRate = params.annualReturn / 100 / 12;
  const months = params.years * 12;
  let endCapital = 0;
  const chartData: { month: number; value: number; invested: number }[] = [];

  for (let m = 1; m <= months; m++) {
    endCapital = (endCapital + params.monthlyRate) * (1 + monthlyRate);
    if (m % 12 === 0 || m === months) {
      const invested = params.monthlyRate * m;
      const inflationFactor = Math.pow(1 + params.inflation / 100, m / 12);
      chartData.push({
        month: m,
        value: endCapital / inflationFactor,
        invested,
      });
    }
  }

  const totalInvested = params.monthlyRate * months;
  const profit = endCapital - totalInvested;

  return { endCapital, totalInvested, profit, chartData };
}

/** DCA-Rechner */
export function calculateDCA(
  purchases: { quantity: number; price: number; fees?: number }[]
) {
  let totalQty = 0;
  let totalCost = 0;
  let totalFees = 0;

  for (const p of purchases) {
    totalQty += p.quantity;
    totalCost += p.quantity * p.price;
    totalFees += p.fees ?? 0;
  }

  const avgPrice = totalQty > 0 ? (totalCost + totalFees) / totalQty : 0;
  return { totalQty, totalCost, totalFees, avgPrice };
}

export function calculateDividendStats(dividends: Dividend[]) {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const annual = dividends
    .filter((d) => new Date(d.date) >= yearStart)
    .reduce((s, d) => s + d.amount, 0);
  return { annual, monthly: annual / 12 };
}

export function generateSnapshot(
  portfolio: Portfolio
): PortfolioSnapshot {
  const stats = computePortfolioStats(portfolio);
  return {
    date: new Date().toISOString(),
    totalValue: stats.totalValue,
    invested: stats.totalInvested,
  };
}

export function formatCurrency(
  value: number,
  currency: string = "EUR",
  locale: string = "de-DE"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals = 4): string {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}
