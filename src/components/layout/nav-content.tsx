"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Undo2, Redo2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAIN_NAV } from "@/config/navigation";
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
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <span className="text-base font-semibold tracking-tight">InvestTrack</span>
        </div>
      )}

      <div className="p-4">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Portfolio
        </label>
        {portfolios.length > 0 ? (
          <Select
            value={activePortfolioId || undefined}
            onValueChange={(v) => v && setActivePortfolio(v)}
          >
            <SelectTrigger className="h-10 w-full">
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
        ) : (
          <p className="text-xs text-muted-foreground">Noch kein Portfolio</p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="mt-2 h-10 w-full"
          onClick={() => {
            const name = prompt("Name des neuen Portfolios:");
            if (name) addPortfolio(name);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Neues Portfolio
        </Button>
      </div>

      <Separator />

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {MAIN_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-10 flex-1" onClick={undo}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-10 flex-1" onClick={redo}>
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
