"use client";

import Link from "next/link";
import { usePortfolioStore } from "@/store/portfolio-store";
import {
  selectActivePortfolio,
  selectProfile,
  selectSnapshotsForActivePortfolio,
} from "@/lib/store-selectors";
import { DashboardWidgets } from "@/components/dashboard/dashboard-widgets";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { PortfolioFormDialog } from "@/components/portfolio/portfolio-form-dialog";
import { computePortfolioStats, formatCurrency, formatPercent } from "@/lib/calculations";
import { getPortfolioIcon } from "@/config/portfolio-icons";
import { useState } from "react";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const hydrated = usePortfolioStore((s) => s.hydrated);
  const portfolio = usePortfolioStore(selectActivePortfolio);
  const snapshots = usePortfolioStore(selectSnapshotsForActivePortfolio);
  const profile = usePortfolioStore(selectProfile);
  const addPortfolio = usePortfolioStore((s) => s.addPortfolio);
  const [createOpen, setCreateOpen] = useState(false);

  if (!hydrated) {
    return <DashboardSkeleton />;
  }

  if (!portfolio) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <Plus className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Willkommen{profile?.name ? `, ${profile.name}` : ""}</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Erstelle dein erstes Portfolio und starte mit deinen Investments.
          </p>
        </div>
        <Button className="h-12 rounded-2xl px-8" onClick={() => setCreateOpen(true)}>
          Portfolio erstellen
        </Button>
        <PortfolioFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSubmit={(input) => addPortfolio(input)}
        />
      </div>
    );
  }

  const stats = computePortfolioStats(portfolio);
  const Icon = getPortfolioIcon(portfolio.icon);
  const accent = portfolio.color ?? "#2dd4bf";
  const isPositive = stats.profitLoss >= 0;

  return (
    <div className="space-y-8">
      <div className="premium-card flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-center gap-4">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${accent}18`, color: accent }}
          >
            <Icon className="h-7 w-7" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold md:text-2xl">{portfolio.name}</h1>
            {portfolio.description && (
              <p className="truncate text-sm text-muted-foreground">{portfolio.description}</p>
            )}
          </div>
        </div>
        <div className="md:text-right">
          <p className="text-sm text-muted-foreground">Portfolio-Wert</p>
          <p className="text-2xl font-semibold tabular-nums md:text-3xl">
            {formatCurrency(stats.totalValue, portfolio.currency)}
          </p>
          <div
            className={cn(
              "mt-1 inline-flex items-center gap-1 text-sm font-medium tabular-nums",
              isPositive ? "text-emerald-500" : "text-red-500"
            )}
          >
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {formatPercent(stats.profitLossPercent)}
          </div>
        </div>
      </div>

      <DashboardWidgets
        key={portfolio.id}
        portfolio={portfolio}
        stats={stats}
        snapshots={snapshots}
      />
    </div>
  );
}
