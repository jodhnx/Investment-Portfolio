"use client";

import { useEffect } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";

export function StoreHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = usePortfolioStore((s) => s.hydrate);
  const hydrated = usePortfolioStore((s) => s.hydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Portfolio wird geladen…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
