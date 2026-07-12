import {
  LayoutDashboard,
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
  /** Nur in Sidebar „Mehr"-Bereich */
  secondary?: boolean;
}

export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, mobilePrimary: true },
  { href: "/assets", label: "Assets", icon: Layers, mobilePrimary: true },
  { href: "/transactions", label: "Transaktionen", icon: ArrowLeftRight, mobilePrimary: true },
  { href: "/performance", label: "Performance", icon: TrendingUp },
  { href: "/watchlist", label: "Watchlist", icon: Eye, mobilePrimary: true },
  { href: "/dividends", label: "Dividenden", icon: Coins, secondary: true },
  { href: "/statistics", label: "Statistiken", icon: BarChart3, secondary: true },
  { href: "/capital", label: "Kapital", icon: Landmark, secondary: true },
  { href: "/calculators", label: "Rechner", icon: Calculator, secondary: true },
  { href: "/settings", label: "Einstellungen", icon: Settings, secondary: true },
];

export const PRIMARY_NAV = MAIN_NAV.filter((item) => !item.secondary);
export const SECONDARY_NAV = MAIN_NAV.filter((item) => item.secondary);
export const MOBILE_BOTTOM_NAV = MAIN_NAV.filter((item) => item.mobilePrimary);

export function getPageTitle(pathname: string): string {
  const exact = MAIN_NAV.find((item) => item.href === pathname);
  if (exact) return exact.label;
  if (pathname.startsWith("/assets/")) return "Asset Details";
  if (pathname.startsWith("/capital")) return "Kapital";
  if (pathname.startsWith("/portfolio")) return "Portfolio";
  return "Velo";
}
