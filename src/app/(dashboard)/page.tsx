"use client";

import Link from "next/link";
import { usePortfolioStore } from "@/store/portfolio-store";
import {
  selectActivePortfolio,
  selectProfile,
  selectSnapshotsForActivePortfolio,
} from "@/lib/store-selectors";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { PortfolioChart } from "@/components/dashboard/portfolio-chart";
import { AllocationChart } from "@/components/dashboard/allocation-chart";
import { computePortfolioStats } from "@/lib/calculations";

export default function DashboardPage() {
  const portfolio = usePortfolioStore(selectActivePortfolio);
  const snapshots = usePortfolioStore(selectSnapshotsForActivePortfolio);
  const profile = usePortfolioStore(selectProfile);

  if (!portfolio) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <h2 className="text-xl font-semibold">Willkommen{profile?.name ? `, ${profile.name}` : ""}!</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Dein Portfolio ist noch leer. Schließe das Onboarding ab oder lege dein erstes Portfolio an.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Onboarding fortsetzen
        </Link>
      </div>
    );
  }

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
