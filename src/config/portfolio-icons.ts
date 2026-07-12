import {
  Briefcase,
  TrendingUp,
  Bitcoin,
  PiggyBank,
  Zap,
  Coins,
  Landmark,
  Wallet,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

export const PORTFOLIO_ICONS: Record<string, LucideIcon> = {
  Briefcase,
  TrendingUp,
  Bitcoin,
  PiggyBank,
  Zap,
  Coins,
  Landmark,
  Wallet,
  FlaskConical,
};

export const PORTFOLIO_COLORS = [
  "#2dd4bf",
  "#6366f1",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#3b82f6",
  "#84cc16",
  "#64748b",
];

export const PORTFOLIO_PRESETS = [
  { name: "Langfristiges Portfolio", icon: "TrendingUp", color: "#6366f1" },
  { name: "Krypto Portfolio", icon: "Bitcoin", color: "#f59e0b" },
  { name: "ETF Sparplan", icon: "PiggyBank", color: "#2dd4bf" },
  { name: "Trading", icon: "Zap", color: "#ef4444" },
  { name: "Dividenden", icon: "Coins", color: "#8b5cf6" },
  { name: "Altersvorsorge", icon: "Landmark", color: "#3b82f6" },
  { name: "Echtgeld", icon: "Wallet", color: "#14b8a6" },
  { name: "Demo", icon: "FlaskConical", color: "#64748b" },
] as const;

export function getPortfolioIcon(name?: string): LucideIcon {
  return PORTFOLIO_ICONS[name ?? "Briefcase"] ?? Briefcase;
}
