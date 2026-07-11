"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Undo2, Redo2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAIN_NAV } from "@/config/navigation";
import { AppLogo } from "@/components/brand/app-logo";
import { usePortfolioStore } from "@/store/portfolio-store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NavContentProps {
  onNavigate?: () => void;
  showBrand?: boolean;
}

export function NavContent({ onNavigate, showBrand = true }: NavContentProps) {
  const pathname = usePathname();
  const portfolios = usePortfolioStore((s) => s.portfolios);
  const activePortfolioId = usePortfolioStore((s) => s.activePortfolioId);
  const setActivePortfolio = usePortfolioStore((s) => s.setActivePortfolio);
  const addPortfolio = usePortfolioStore((s) => s.addPortfolio);
  const undo = usePortfolioStore((s) => s.undo);
  const redo = usePortfolioStore((s) => s.redo);

  return (
    <div className="flex h-full flex-col">
      {showBrand && (
        <div className="border-b border-border px-4 py-4">
          <AppLogo size="sm" />
        </div>
      )}

      <div className="p-3">
        <label className="mb-1 block text-xs text-muted-foreground">Portfolio</label>
        {portfolios.length > 0 ? (
          <Select
            value={activePortfolioId || undefined}
            onValueChange={(v) => v && setActivePortfolio(v)}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Wählen" />
            </SelectTrigger>
            <SelectContent>
              {portfolios.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-xs text-muted-foreground">Noch leer</p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="mt-2 h-9 w-full text-xs"
          onClick={() => {
            const name = prompt("Portfolio-Name:");
            if (name) addPortfolio(name);
          }}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Neu
        </Button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-1">
        {MAIN_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex h-10 items-center gap-2.5 rounded-lg px-3 text-sm",
                active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-2">
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-9 flex-1" onClick={undo}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-9 flex-1" onClick={redo}>
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
