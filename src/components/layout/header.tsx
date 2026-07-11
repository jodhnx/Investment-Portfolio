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
import { getPageTitle } from "@/config/navigation";
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
      toast.success("Preise aktualisiert");
    } catch {
      toast.error("Preise konnten nicht geladen werden");
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Abgemeldet");
    window.location.assign("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold tracking-tight">
          {getPageTitle(pathname)}
        </h1>
        {portfolio && (
          <p className="truncate text-xs text-muted-foreground">{portfolio.name}</p>
        )}
      </div>

      <GlobalSearch />

      {profile && (
        <div className="hidden items-center gap-2 lg:flex">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar ?? undefined} />
            <AvatarFallback className="text-xs">
              {profile.name?.slice(0, 2).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleRefreshPrices} title="Preise aktualisieren">
        <RefreshCw className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme} title="Theme wechseln">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleLogout} title="Abmelden">
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  );
}
