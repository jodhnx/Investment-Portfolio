"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { usePortfolioStore } from "@/store/portfolio-store";

export function StoreHydrator({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const hydrate = usePortfolioStore((s) => s.hydrate);
  const hydrated = usePortfolioStore((s) => s.hydrated);

  useEffect(() => {
    if (user && !hydrated) {
      hydrate();
    }
  }, [user, hydrated, hydrate]);

  if (authLoading || (user && !hydrated)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Daten werden synchronisiert…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
