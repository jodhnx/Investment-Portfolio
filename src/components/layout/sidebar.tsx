"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Calculator,
  Eye,
  Coins,
  BarChart3,
  Settings,
  FileInput,
  TrendingUp,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortfolioStore } from "@/store/portfolio-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/calculators", label: "Rechner", icon: Calculator },
  { href: "/watchlist", label: "Watchlist", icon: Eye },
  { href: "/dividends", label: "Dividenden", icon: Coins },
  { href: "/statistics", label: "Statistik", icon: BarChart3 },
  { href: "/import-export", label: "Import/Export", icon: FileInput },
  { href: "/settings", label: "Einstellungen", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const portfolios = usePortfolioStore((s) => s.portfolios);
  const activePortfolioId = usePortfolioStore((s) => s.activePortfolioId);
  const setActivePortfolio = usePortfolioStore((s) => s.setActivePortfolio);
  const addPortfolio = usePortfolioStore((s) => s.addPortfolio);
  const undo = usePortfolioStore((s) => s.undo);
  const redo = usePortfolioStore((s) => s.redo);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <TrendingUp className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold tracking-tight">InvestTrack</span>
      </div>

      <div className="p-4">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Portfolio
        </label>
        <Select value={activePortfolioId} onValueChange={(v) => v && setActivePortfolio(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Portfolio wählen" />
          </SelectTrigger>
          <SelectContent>
            {portfolios.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full text-xs"
          onClick={() => {
            const name = prompt("Name des neuen Portfolios:");
            if (name) addPortfolio(name);
          }}
        >
          + Neues Portfolio
        </Button>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="flex-1" onClick={undo}>
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={redo}>
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
