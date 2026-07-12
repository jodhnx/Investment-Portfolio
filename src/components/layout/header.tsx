"use client";

import { Moon, Sun, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { selectActivePortfolio } from "@/lib/store-selectors";
import { usePortfolioStore } from "@/store/portfolio-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { GlobalSearch } from "./global-search";
import { PortfolioSwitcher } from "@/components/portfolio/portfolio-switcher";
import { getPageTitle } from "@/config/navigation";
import { APP_ICON_PNG, APP_NAME } from "@/config/brand";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const portfolio = usePortfolioStore(selectActivePortfolio);
  const profile = usePortfolioStore((s) => s.profile);

  const handleRefreshPrices = async () => {
    const { getActivePortfolio, updatePrices } = usePortfolioStore.getState();
    const active = getActivePortfolio();
    if (!active?.positions.length) return;
    try {
      const cryptoIds = active.positions
        .filter((p) => p.type === "CRYPTO" || p.type === "GOLD")
        .map((p) => p.externalId ?? p.symbol.toLowerCase())
        .filter(Boolean);
      const stockSymbols = active.positions
        .filter((p) => ["STOCK", "ETF"].includes(p.type))
        .map((p) => p.symbol)
        .filter(Boolean);
      const updates: Record<string, { price: number; change24h?: number; changePercent24h?: number }> = {};
      if (cryptoIds.length) {
        const res = await fetch("/api/prices/crypto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: cryptoIds }),
        });
        if (res.ok) Object.assign(updates, await res.json());
      }
      if (stockSymbols.length) {
        const res = await fetch("/api/prices/stocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbols: stockSymbols }),
        });
        if (res.ok) Object.assign(updates, await res.json());
      }
      if (Object.keys(updates).length) updatePrices(updates);
      toast.success("Aktualisiert");
    } catch {
      toast.error("Fehler beim Laden");
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.assign("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border/50 glass px-4 md:px-6">
      <div className="hidden min-w-0 flex-1 md:block">
        <h1 className="truncate text-base font-semibold">{getPageTitle(pathname)}</h1>
        {portfolio && (
          <p className="truncate text-xs text-muted-foreground">{portfolio.name}</p>
        )}
      </div>

      <div className="flex min-w-0 flex-1 md:hidden">
        <PortfolioSwitcher compact className="w-full border-0 bg-transparent p-0 shadow-none hover:bg-transparent" />
      </div>

      <GlobalSearch />

      <Avatar className="h-9 w-9 ring-2 ring-border/50">
        <AvatarImage src={profile?.avatar ?? APP_ICON_PNG} />
        <AvatarFallback className="text-xs">{APP_NAME.slice(0, 1)}</AvatarFallback>
      </Avatar>

      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={handleRefreshPrices}>
        <RefreshCw className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={toggleTheme}>
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  );
}
