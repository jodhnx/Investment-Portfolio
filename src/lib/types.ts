export type AssetType =
  | "CRYPTO"
  | "STOCK"
  | "ETF"
  | "GOLD"
  | "SILVER"
  | "COMMODITY"
  | "OTHER";

export type TransactionType =
  | "BUY"
  | "SELL"
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "DIVIDEND"
  | "FEE"
  | "TAX"
  | "SPLIT"
  | "BONUS"
  | "CUSTOM";

export type Currency = "EUR" | "USD" | "CHF";

export type AlertCondition = "BELOW" | "ABOVE";

export interface Transaction {
  id: string;
  type: TransactionType;
  quantity: number;
  price: number;
  fees: number;
  taxes?: number;
  date: string;
  notes?: string;
}

export interface CashFlow {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  date: string;
  category?: string;
  notes?: string;
}

export interface Dividend {
  id: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface PriceAlert {
  id: string;
  targetPrice: number;
  condition: AlertCondition;
  active: boolean;
  triggered: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Position {
  id: string;
  name: string;
  symbol: string;
  type: AssetType;
  broker?: string;
  logoUrl?: string;
  externalId?: string;
  notes?: string;
  color?: string;
  categoryId?: string;
  transactions: Transaction[];
  dividends: Dividend[];
  priceAlerts: PriceAlert[];
  isWatchlist: boolean;
  currentPrice?: number;
  priceChange24h?: number;
  priceChangePercent24h?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  currency: Currency;
  color?: string;
  icon?: string;
  startCapital?: number;
  archived?: boolean;
  isDefault?: boolean;
  positions: Position[];
  categories: Category[];
  cashFlows?: CashFlow[];
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioInput {
  name: string;
  description?: string;
  currency: Currency;
  color?: string;
  icon?: string;
  startCapital?: number;
}

export interface PortfolioSnapshot {
  date: string;
  totalValue: number;
  invested: number;
}

export interface ComputedPosition {
  id: string;
  name: string;
  symbol: string;
  type: AssetType;
  broker?: string;
  logoUrl?: string;
  notes?: string;
  color?: string;
  categoryId?: string;
  categoryName?: string;
  purchaseDate?: string;
  buyPrice: number;
  currentPrice: number;
  quantity: number;
  invested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  fees: number;
  avgBuyPrice: number;
  roi: number;
  breakEven: number;
  netProfit: number;
  taxes: number;
  priceChange24h?: number;
  priceChangePercent24h?: number;
  isWatchlist: boolean;
}

export interface DashboardStats {
  totalValue: number;
  totalInvested: number;
  profitLoss: number;
  profitLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  dayGain: number;
  dayLoss: number;
  realMoneyProfit: number;
  positionCount: number;
  transactionCount: number;
  totalFees: number;
  totalTaxes: number;
  netProfit: number;
  freeCapital: number;
  investedCapital: number;
  totalDeposits: number;
  totalWithdrawals: number;
  realizedProfit: number;
  unrealizedProfit: number;
  bestInvestment: { name: string; profitPercent: number } | null;
  worstInvestment: { name: string; profitPercent: number } | null;
}

export interface AssetSearchResult {
  id: string;
  name: string;
  symbol: string;
  type: AssetType;
  logoUrl?: string;
  currentPrice?: number;
  currency?: string;
}

export interface AppSettings {
  theme: "dark" | "light";
  defaultCurrency: Currency;
  priceRefreshInterval: number;
}

export interface AppState {
  portfolios: Portfolio[];
  activePortfolioId: string;
  snapshots: Record<string, PortfolioSnapshot[]>;
  settings: AppSettings;
  history: AppState[];
  historyIndex: number;
}
