"use client";

import { AssetsTable } from "@/components/assets/assets-table";
import { usePortfolioStore } from "@/store/portfolio-store";
import { selectActivePortfolio } from "@/lib/store-selectors";
import Link from "next/link";

export default function AssetsPage() {
  const portfolio = usePortfolioStore(selectActivePortfolio);

  if (!portfolio) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p>Kein Portfolio vorhanden.</p>
        <Link href="/onboarding" className="mt-4 inline-block text-primary hover:underline">
          Onboarding starten
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Assets</h2>
        <p className="text-sm text-muted-foreground">
          Beliebige Assets anlegen – Crypto, Aktien, Immobilien, Sammlerstücke und mehr
        </p>
      </div>
      <AssetsTable />
    </div>
  );
}
