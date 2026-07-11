"use client";

import { Menu, Moon, Sun, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { useTheme } from "@/components/providers/theme-provider";
import { usePriceUpdater } from "@/hooks/use-price-updater";
import { usePortfolioStore } from "@/store/portfolio-store";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { refresh } = usePriceUpdater();
  const portfolio = usePortfolioStore((s) => s.getActivePortfolio());

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Sheet>
        <SheetTrigger
          className="inline-flex md:hidden h-9 w-9 items-center justify-center rounded-lg hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <h1 className="text-sm font-medium text-muted-foreground md:text-base">
          {portfolio?.name ?? "Portfolio"}
        </h1>
      </div>

      <Button variant="ghost" size="icon" onClick={refresh} title="Preise aktualisieren">
        <RefreshCw className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={toggleTheme} title="Theme wechseln">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </header>
  );
}
