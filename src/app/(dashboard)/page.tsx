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
import { computePortfolioStats } from "@/lib/calculations";

export default function DashboardPage() {
  const hydrated = usePortfolioStore((s) => s.hydrated);
  const portfolio = usePortfolioStore(selectActivePortfolio);
  const snapshots = usePortfolioStore(selectSnapshotsForActivePortfolio);
  const profile = usePortfolioStore(selectProfile);

  if (!hydrated) {
    return <DashboardSkeleton />;
  }

  if (!portfolio) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <h2 className="text-xl font-semibold">Willkommen{profile?.name ? `, ${profile.name}` : ""}!</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Dein Portfolio ist noch leer. Schließe das Onboarding ab oder lege dein erstes Portfolio an.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
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
          Dein Investment-Überblick auf einen Blick
        </p>
      </div>

      <DashboardWidgets portfolio={portfolio} stats={stats} snapshots={snapshots} />
    </div>
  );
}
