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
import { computePortfolioStats, formatCurrency } from "@/lib/calculations";
import { getPortfolioIcon } from "@/config/portfolio-icons";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <h2 className="text-xl font-semibold">Willkommen{profile?.name ? `, ${profile.name}` : ""}!</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Erstelle dein erstes Portfolio, um deine Investments zu verwalten.
        </p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
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

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${accent}22`, color: accent }}
        >
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-bold tracking-tight">{portfolio.name}</h2>
          {portfolio.description ? (
            <p className="text-sm text-muted-foreground">{portfolio.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Dein Investment-Überblick</p>
          )}
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-xs text-muted-foreground">Gesamtwert</p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCurrency(stats.totalValue, portfolio.currency)}
          </p>
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
