"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { PortfolioChart } from "@/components/dashboard/portfolio-chart";
import { AllocationChart } from "@/components/dashboard/allocation-chart";
import { computePortfolioStats } from "@/lib/calculations";
import { usePortfolioStore } from "@/store/portfolio-store";
import { usePriceUpdater } from "@/hooks/use-price-updater";

export default function DashboardPage() {
  usePriceUpdater();
  const portfolio = usePortfolioStore((s) => s.getActivePortfolio());
  const activePortfolioId = usePortfolioStore((s) => s.activePortfolioId);
  const snapshots = usePortfolioStore((s) => s.snapshots[activePortfolioId] ?? []);

  if (!portfolio) return null;

  const stats = computePortfolioStats(portfolio);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Übersicht über dein Investment-Portfolio
        </p>
      </div>

      <StatsCards stats={stats} currency={portfolio.currency} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PortfolioChart
            snapshots={snapshots}
            currentValue={stats.totalValue}
            invested={stats.totalInvested}
            currency={portfolio.currency}
          />
        </div>
        <AllocationChart portfolio={portfolio} />
      </div>
    </div>
  );
}
