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

export interface EnrichedAssetTransactionRow extends AssetTransactionRow {
  time: string;
  actionLabel: string;
  holdingsAfter: number;
  avgPriceAfter: number;
  profitOnTx: number | null;
  investedAmount: number | null;
  saleProceeds: number | null;
}

export interface ExtendedAssetMetrics {
  firstBuyPrice: number;
  lastBuyPrice: number;
  highestBuyPrice: number;
  lowestBuyPrice: number;
  avgBuyPrice: number;
  avgSellPrice: number;
  buyCount: number;
  sellCount: number;
  totalFees: number;
  totalTaxes: number;
  realizedProfit: number;
  unrealizedProfit: number;
  roi: number;
  breakEvenPrice: number;
}

export interface AssetCapitalOverview {
  totalInvested: number;
  totalSold: number;
  openHoldings: number;
  capitalStillInvested: number;
  capitalWithdrawn: number;
  profitAfterFees: number;
  profitAfterTaxes: number;
}

export interface AssetChartPoint {
  date: string;
  label: string;
  price: number;
  avgBuyPrice: number;
  holdings: number;
  cumulativeProfit: number;
  buyVolume: number;
  sellVolume: number;
}

const BUY_TYPES: TransactionType[] = ["BUY", "DEPOSIT", "BONUS"];
const SELL_TYPES: TransactionType[] = ["SELL", "WITHDRAWAL"];

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

function parseTxTaxes(tx: Transaction): number {
  if (tx.type === "TAX") return tx.price > 0 ? tx.price : tx.fees;
  return tx.taxes ?? 0;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function formatChartLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "2-digit" });
}

type HistoryEvent = AssetTransactionRow & { sortDate: number };

function toHistoryEvents(position: Position): HistoryEvent[] {
  const txRows: HistoryEvent[] = position.transactions.map((tx) => {
    const taxes = parseTxTaxes(tx);
    const gross = tx.quantity * tx.price;
    return {
      id: tx.id,
      source: "transaction" as const,
      date: tx.date,
      sortDate: new Date(tx.date).getTime(),
      type: tx.type,
      quantity: tx.quantity,
      price: tx.price,
      gross,
      fees: tx.fees,
      taxes,
      net: gross - tx.fees - taxes,
      notes: tx.notes,
    };
  });

  const divRows: HistoryEvent[] = position.dividends.map((d) => ({
    id: d.id,
    source: "dividend" as const,
    date: d.date,
    sortDate: new Date(d.date).getTime(),
    type: "DIVIDEND" as const,
    quantity: 1,
    price: d.amount,
    gross: d.amount,
    fees: 0,
    taxes: 0,
    net: d.amount,
    notes: d.notes,
  }));

  return [...txRows, ...divRows].sort((a, b) => a.sortDate - b.sortDate);
}

function resolveActionLabel(
  type: TransactionType | "DIVIDEND",
  isFirstBuy: boolean,
  holdingsBefore: number,
  holdingsAfter: number,
  quantity: number
): string {
  if (type === "BUY") return isFirstBuy ? "Erstkauf" : "Nachkauf";
  if (type === "BONUS") return isFirstBuy ? "Erstkauf (Bonus)" : "Nachkauf (Bonus)";
  if (type === "DEPOSIT") return "Einzahlung";
  if (type === "SELL") {
    if (holdingsAfter <= 0.000001) return "Vollständiger Verkauf";
    return "Teilverkauf";
  }
  if (type === "WITHDRAWAL") return "Auszahlung";
  if (type === "DIVIDEND") return "Dividende";
  if (type === "FEE") return "Gebühr";
  if (type === "TAX") return "Steuer";
  if (type === "SPLIT") return "Split";
  if (type === "CUSTOM") return "Sonstige";
  return TX_TYPE_LABELS[type] ?? type;
}

/** Chronologische Historie mit laufendem Bestand und Ø-Preis */
export function buildEnrichedAssetHistory(position: Position): EnrichedAssetTransactionRow[] {
  const events = toHistoryEvents(position);
  let holdings = 0;
  let costBasis = 0;
  let avgBuy = 0;
  let realizedRunning = 0;
  let hadBuy = false;
  const enriched: EnrichedAssetTransactionRow[] = [];

  for (const ev of events) {
    const holdingsBefore = holdings;
    let profitOnTx: number | null = null;
    let investedAmount: number | null = null;
    let saleProceeds: number | null = null;
    let isFirstBuy = false;

    if (BUY_TYPES.includes(ev.type as TransactionType)) {
      isFirstBuy = !hadBuy;
      hadBuy = true;
      investedAmount = ev.quantity * ev.price;
      holdings += ev.quantity;
      costBasis += investedAmount;
      avgBuy = holdings > 0 ? costBasis / holdings : 0;
    } else if (SELL_TYPES.includes(ev.type as TransactionType)) {
      const sellQty = Math.min(ev.quantity, holdings);
      saleProceeds = sellQty * ev.price;
      const basis = sellQty * avgBuy;
      profitOnTx = saleProceeds - ev.fees - ev.taxes - basis;
      realizedRunning += profitOnTx;
      holdings -= sellQty;
      costBasis = holdings * avgBuy;
    } else if (ev.type === "DIVIDEND") {
      profitOnTx = ev.gross;
      realizedRunning += ev.gross;
    } else if (ev.type === "FEE" || ev.type === "TAX") {
      profitOnTx = -ev.gross;
      realizedRunning += profitOnTx;
    }

    enriched.push({
      id: ev.id,
      source: ev.source,
      date: ev.date,
      type: ev.type,
      quantity: ev.quantity,
      price: ev.price,
      gross: ev.gross,
      fees: ev.fees,
      taxes: ev.taxes,
      net: ev.net,
      notes: ev.notes,
      time: formatTime(ev.date),
      actionLabel: resolveActionLabel(ev.type, isFirstBuy, holdingsBefore, holdings, ev.quantity),
      holdingsAfter: holdings,
      avgPriceAfter: avgBuy,
      profitOnTx,
      investedAmount,
      saleProceeds,
    });
  }

  return enriched.reverse();
}

export function buildAssetTransactionRows(position: Position): AssetTransactionRow[] {
  return buildEnrichedAssetHistory(position);
}

export function computeAssetDetailSummary(position: Position): AssetDetailSummary {
  const enrichedAsc = [...buildEnrichedAssetHistory(position)].reverse();
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

  for (const ev of enrichedAsc) {
    totalFees += ev.fees;
    totalTaxes += ev.taxes;
    if (ev.price > 0 && ev.type !== "DIVIDEND") prices.push(ev.price);

    if (BUY_TYPES.includes(ev.type as TransactionType)) {
      totalBoughtQty += ev.quantity;
      totalBuyCost += ev.quantity * ev.price;
    } else if (SELL_TYPES.includes(ev.type as TransactionType)) {
      totalSoldQty += ev.quantity;
      totalSellQty += ev.quantity;
      totalSellProceeds += ev.quantity * ev.price;
      if (ev.profitOnTx != null) realizedProfit += ev.profitOnTx;
    } else if (ev.type === "DIVIDEND" && ev.profitOnTx != null) {
      totalSellProceeds += ev.gross;
      realizedProfit += ev.profitOnTx;
    } else if ((ev.type === "FEE" || ev.type === "TAX") && ev.profitOnTx != null) {
      realizedProfit += ev.profitOnTx;
    }
  }

  const last = enrichedAsc[enrichedAsc.length - 1];
  const holdings = last?.holdingsAfter ?? 0;
  const avgBuy = last?.avgPriceAfter ?? 0;
  const costBasis = holdings * avgBuy;
  const currentPrice = position.currentPrice ?? avgBuy;
  const currentValue = holdings * currentPrice;
  const unrealizedProfit = currentValue - costBasis;
  const netProfit = realizedProfit + unrealizedProfit;
  const roi = totalBuyCost > 0 ? (netProfit / totalBuyCost) * 100 : 0;
  const breakEvenPrice = holdings > 0 ? avgBuy + (totalFees + totalTaxes) / holdings : 0;
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

export function computeExtendedAssetMetrics(position: Position): ExtendedAssetMetrics {
  const summary = computeAssetDetailSummary(position);
  const buys = position.transactions.filter((t) => BUY_TYPES.includes(t.type) && t.price > 0);
  const sells = position.transactions.filter((t) => SELL_TYPES.includes(t.type) && t.price > 0);
  const buyPrices = buys.map((t) => t.price);

  return {
    firstBuyPrice: buyPrices[0] ?? 0,
    lastBuyPrice: buyPrices[buyPrices.length - 1] ?? 0,
    highestBuyPrice: buyPrices.length ? Math.max(...buyPrices) : 0,
    lowestBuyPrice: buyPrices.length ? Math.min(...buyPrices) : 0,
    avgBuyPrice: summary.avgBuyPrice,
    avgSellPrice: summary.avgSellPrice,
    buyCount: buys.length,
    sellCount: sells.length,
    totalFees: summary.totalFees,
    totalTaxes: summary.totalTaxes,
    realizedProfit: summary.realizedProfit,
    unrealizedProfit: summary.unrealizedProfit,
    roi: summary.roi,
    breakEvenPrice: summary.breakEvenPrice,
  };
}

export function computeAssetCapitalOverview(position: Position): AssetCapitalOverview {
  const s = computeAssetDetailSummary(position);
  const capitalStillInvested = s.currentHoldings * s.avgBuyPrice;
  const profitAfterFees = s.realizedProfit + s.unrealizedProfit - s.totalFees;
  const profitAfterTaxes = profitAfterFees - s.totalTaxes;

  return {
    totalInvested: s.totalInvested,
    totalSold: s.totalSaleProceeds,
    openHoldings: s.currentHoldings,
    capitalStillInvested,
    capitalWithdrawn: s.totalSaleProceeds,
    profitAfterFees,
    profitAfterTaxes,
  };
}

export function buildAssetChartData(position: Position): AssetChartPoint[] {
  const asc = [...buildEnrichedAssetHistory(position)].reverse();
  let cumulativeProfit = 0;
  const points: AssetChartPoint[] = [];

  for (const ev of asc) {
    if (ev.profitOnTx != null) cumulativeProfit += ev.profitOnTx;

    const isTrade =
      BUY_TYPES.includes(ev.type as TransactionType) ||
      SELL_TYPES.includes(ev.type as TransactionType);

    if (!isTrade && ev.type !== "DIVIDEND") continue;

    points.push({
      date: ev.date,
      label: formatChartLabel(ev.date),
      price: ev.price,
      avgBuyPrice: ev.avgPriceAfter,
      holdings: ev.holdingsAfter,
      cumulativeProfit,
      buyVolume: BUY_TYPES.includes(ev.type as TransactionType) ? ev.quantity : 0,
      sellVolume: SELL_TYPES.includes(ev.type as TransactionType) ? ev.quantity : 0,
    });
  }

  if (position.currentPrice != null && position.currentPrice > 0) {
    const last = asc[asc.length - 1];
    points.push({
      date: new Date().toISOString(),
      label: "Heute",
      price: position.currentPrice,
      avgBuyPrice: last?.avgPriceAfter ?? 0,
      holdings: last?.holdingsAfter ?? 0,
      cumulativeProfit,
      buyVolume: 0,
      sellVolume: 0,
    });
  }

  return points;
}

/** Kursverlauf für einfaches Liniendiagramm */
export function buildAssetPriceHistory(position: Position) {
  return buildAssetChartData(position).map((p) => ({
    date: p.date,
    price: p.price,
    label: p.label,
  }));
}

/** CSV-Export der Historie */
export function exportAssetHistoryCsv(
  rows: EnrichedAssetTransactionRow[],
  assetName: string,
  currency: string
): string {
  const header = [
    "Datum",
    "Uhrzeit",
    "Aktion",
    "Typ",
    "Anzahl",
    "Preis",
    "Gesamt",
    "Gebühren",
    "Steuer",
    "Gewinn",
    "Bestand",
    "Ø Kaufpreis",
    "Notiz",
  ].join(";");

  const lines = rows.map((r) =>
    [
      new Date(r.date).toLocaleDateString("de-DE"),
      r.time,
      r.actionLabel,
      TX_TYPE_LABELS[r.type] ?? r.type,
      r.type === "DIVIDEND" ? "" : r.quantity,
      r.price.toFixed(4),
      r.gross.toFixed(2),
      r.fees.toFixed(2),
      r.taxes.toFixed(2),
      r.profitOnTx != null ? r.profitOnTx.toFixed(2) : "",
      r.holdingsAfter.toFixed(4),
      r.avgPriceAfter.toFixed(4),
      (r.notes ?? "").replace(/;/g, ","),
    ].join(";")
  );

  return `\uFEFF${header}\n${lines.join("\n")}`;
}

export function downloadAssetHistoryCsv(
  rows: EnrichedAssetTransactionRow[],
  assetName: string,
  currency: string
) {
  const csv = exportAssetHistoryCsv(rows, assetName, currency);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${assetName.replace(/\s+/g, "_")}_historie.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
