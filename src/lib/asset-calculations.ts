import type { Dividend, Position, Transaction, TransactionType } from "./types";

export interface AssetDetailSummary {
  totalBoughtQty: number;
  totalSoldQty: number;
  currentHoldings: number;
  avgBuyPrice: number;
  avgSellPrice: number;
  totalInvested: number;
  totalSaleProceeds: number;
  realizedProfit: number;
  unrealizedProfit: number;
  totalFees: number;
  totalTaxes: number;
  netProfit: number;
  roi: number;
  breakEvenPrice: number;
  allTimeHigh: number;
  allTimeLow: number;
}

export interface AssetTransactionRow {
  id: string;
  source: "transaction" | "dividend";
  date: string;
  type: TransactionType | "DIVIDEND";
  quantity: number;
  price: number;
  gross: number;
  fees: number;
  taxes: number;
  net: number;
  notes?: string;
}

const BUY_TYPES: TransactionType[] = ["BUY", "DEPOSIT", "BONUS"];
const SELL_TYPES: TransactionType[] = ["SELL", "WITHDRAWAL"];

function parseTxTaxes(tx: Transaction): number {
  if (tx.type === "TAX") return tx.price > 0 ? tx.price : tx.fees;
  return 0;
}

/** Detaillierte Asset-Zusammenfassung für Detailseite */
export function computeAssetDetailSummary(position: Position): AssetDetailSummary {
  const sorted = [...position.transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let holdings = 0;
  let costBasis = 0;
  let avgBuy = 0;
  let totalBoughtQty = 0;
  let totalSoldQty = 0;
  let totalBuyCost = 0;
  let totalSellProceeds = 0;
  let totalSellQty = 0;
  let totalFees = 0;
  let totalTaxes = 0;
  let realizedProfit = 0;
  const prices: number[] = [];

  if (position.currentPrice != null && position.currentPrice > 0) {
    prices.push(position.currentPrice);
  }

  for (const tx of sorted) {
    totalFees += tx.fees;
    totalTaxes += parseTxTaxes(tx);
    if (tx.price > 0) prices.push(tx.price);

    if (BUY_TYPES.includes(tx.type)) {
      totalBoughtQty += tx.quantity;
      totalBuyCost += tx.quantity * tx.price;
      holdings += tx.quantity;
      costBasis += tx.quantity * tx.price;
      avgBuy = holdings > 0 ? costBasis / holdings : 0;
    } else if (SELL_TYPES.includes(tx.type)) {
      const sellQty = Math.min(tx.quantity, holdings);
      totalSoldQty += sellQty;
      totalSellQty += sellQty;
      totalSellProceeds += sellQty * tx.price;
      const basis = sellQty * avgBuy;
      realizedProfit += sellQty * tx.price - tx.fees - basis;
      holdings -= sellQty;
      costBasis = holdings * avgBuy;
    }
  }

  for (const d of position.dividends) {
    totalSellProceeds += d.amount;
    realizedProfit += d.amount;
    prices.push(d.amount);
  }

  const currentPrice = position.currentPrice ?? avgBuy;
  const currentValue = holdings * currentPrice;
  const unrealizedProfit = currentValue - costBasis;
  const totalInvested = costBasis;
  const netProfit = realizedProfit + unrealizedProfit - totalFees - totalTaxes;
  const roi = totalBuyCost > 0 ? (netProfit / totalBuyCost) * 100 : 0;
  const breakEvenPrice =
    holdings > 0 ? avgBuy + (totalFees + totalTaxes) / holdings : 0;
  const avgSellPrice = totalSellQty > 0 ? totalSellProceeds / totalSellQty : 0;

  const validPrices = prices.filter((p) => p > 0);
  const allTimeHigh = validPrices.length ? Math.max(...validPrices) : 0;
  const allTimeLow = validPrices.length ? Math.min(...validPrices) : 0;

  return {
    totalBoughtQty,
    totalSoldQty,
    currentHoldings: holdings,
    avgBuyPrice: avgBuy,
    avgSellPrice,
    totalInvested: totalBuyCost,
    totalSaleProceeds: totalSellProceeds,
    realizedProfit,
    unrealizedProfit,
    totalFees,
    totalTaxes,
    netProfit,
    roi,
    breakEvenPrice,
    allTimeHigh,
    allTimeLow,
  };
}

/** Alle Zeilen für Transaktionstabelle (inkl. Dividenden) */
export function buildAssetTransactionRows(position: Position): AssetTransactionRow[] {
  const txRows: AssetTransactionRow[] = position.transactions.map((tx) => {
    const taxes = parseTxTaxes(tx);
    const gross = tx.quantity * tx.price;
    const net = gross - tx.fees - taxes;
    return {
      id: tx.id,
      source: "transaction",
      date: tx.date,
      type: tx.type,
      quantity: tx.quantity,
      price: tx.price,
      gross,
      fees: tx.fees,
      taxes,
      net,
      notes: tx.notes,
    };
  });

  const divRows: AssetTransactionRow[] = position.dividends.map((d) => ({
    id: d.id,
    source: "dividend",
    date: d.date,
    type: "DIVIDEND",
    quantity: 1,
    price: d.amount,
    gross: d.amount,
    fees: 0,
    taxes: 0,
    net: d.amount,
    notes: d.notes,
  }));

  return [...txRows, ...divRows].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/** Kursverlauf für Chart aus Transaktionen */
export function buildAssetPriceHistory(position: Position) {
  const points: { date: string; price: number; label: string }[] = [];

  for (const tx of [...position.transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )) {
    if (tx.price > 0 && (BUY_TYPES.includes(tx.type) || SELL_TYPES.includes(tx.type) || tx.type === "BUY" || tx.type === "SELL")) {
      points.push({
        date: tx.date,
        price: tx.price,
        label: new Date(tx.date).toLocaleDateString("de-DE", { day: "2-digit", month: "short" }),
      });
    }
  }

  if (position.currentPrice != null && position.currentPrice > 0) {
    points.push({
      date: new Date().toISOString(),
      price: position.currentPrice,
      label: "Heute",
    });
  }

  return points;
}

export const TX_TYPE_LABELS: Record<string, string> = {
  BUY: "Kauf",
  SELL: "Verkauf",
  DEPOSIT: "Einzahlung",
  WITHDRAWAL: "Auszahlung",
  DIVIDEND: "Dividende",
  FEE: "Gebühr",
  TAX: "Steuer",
  SPLIT: "Split",
  BONUS: "Bonus",
  CUSTOM: "Sonstige",
};
