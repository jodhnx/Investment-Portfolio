"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { usePortfolioStore } from "@/store/portfolio-store";

export function StoreHydrator({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const hydrated = usePortfolioStore((s) => s.hydrated);
  const userId = user?.id ?? null;
  const requestedForUser = useRef<string | null>(null);

  // Genau ein Hydrate-Aufruf pro User-ID – kein hydrated in den Dependencies!
  useEffect(() => {
    if (authLoading) return;

    if (!userId) {
      requestedForUser.current = null;
      return;
    }

    if (requestedForUser.current === userId) return;

    const state = usePortfolioStore.getState();
    if (state.hydrated && state.profile?.auth_user_id === userId) {
      requestedForUser.current = userId;
      return;
    }

    requestedForUser.current = userId;
    void usePortfolioStore.getState().hydrate();
  }, [userId, authLoading]);

  if (authLoading || (userId && !hydrated)) {
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
