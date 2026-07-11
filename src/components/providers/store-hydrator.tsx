"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { usePortfolioStore } from "@/store/portfolio-store";
import { Button } from "@/components/ui/button";

const HYDRATE_TIMEOUT_MS = 20_000;

export function StoreHydrator({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const hydrate = usePortfolioStore((s) => s.hydrate);
  const hydrated = usePortfolioStore((s) => s.hydrated);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (user && !hydrated) {
      setTimedOut(false);
      hydrate();
    }
  }, [user, hydrated, hydrate]);

  useEffect(() => {
    if (!user || hydrated) {
      setTimedOut(false);
      return;
    }
    const timer = window.setTimeout(() => setTimedOut(true), HYDRATE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [user, hydrated]);

  if (authLoading || (user && !hydrated && !timedOut)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Daten werden synchronisiert…</p>
        </div>
      </div>
    );
  }

  if (user && !hydrated && timedOut) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md space-y-4 text-center">
          <h2 className="text-lg font-semibold">Daten konnten nicht geladen werden</h2>
          <p className="text-sm text-muted-foreground">
            Die Verbindung zum Server dauert ungewöhnlich lange. Bitte versuche es erneut.
          </p>
          <Button
            onClick={() => {
              setTimedOut(false);
              hydrate();
            }}
          >
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
