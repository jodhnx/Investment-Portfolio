"use client";

import { AssetsTable } from "@/components/assets/assets-table";
import { usePortfolioStore } from "@/store/portfolio-store";
import { selectActivePortfolio } from "@/lib/store-selectors";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AssetsPage() {
  const portfolio = usePortfolioStore(selectActivePortfolio);

  if (!portfolio) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-muted-foreground">Kein Portfolio vorhanden.</p>
        <Button render={<Link href="/onboarding" />}>Onboarding starten</Button>
      </div>
    );
  }

  return <AssetsTable />;
}
