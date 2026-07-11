import {
  LayoutDashboard,
  Wallet,
  Layers,
  ArrowLeftRight,
  TrendingUp,
  Eye,
  Coins,
  BarChart3,
  Calculator,
  Settings,
  Landmark,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** In Bottom-Navigation auf Mobile anzeigen */
  mobilePrimary?: boolean;
}

export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, mobilePrimary: true },
  { href: "/assets", label: "Assets", icon: Layers, mobilePrimary: true },
  { href: "/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/transactions", label: "Transaktionen", icon: ArrowLeftRight, mobilePrimary: true },
  { href: "/performance", label: "Performance", icon: TrendingUp },
  { href: "/watchlist", label: "Watchlist", icon: Eye, mobilePrimary: true },
  { href: "/dividends", label: "Dividenden", icon: Coins },
  { href: "/statistics", label: "Statistiken", icon: BarChart3 },
  { href: "/capital", label: "Kapital", icon: Landmark },
  { href: "/calculators", label: "Rechner", icon: Calculator },
  { href: "/settings", label: "Einstellungen", icon: Settings, mobilePrimary: true },
];

export const MOBILE_BOTTOM_NAV = MAIN_NAV.filter((item) => item.mobilePrimary);

export function getPageTitle(pathname: string): string {
  const exact = MAIN_NAV.find((item) => item.href === pathname);
  if (exact) return exact.label;
  if (pathname.startsWith("/assets/")) return "Asset Details";
  if (pathname.startsWith("/capital")) return "Kapital";
  return "InvestTrack";
}
