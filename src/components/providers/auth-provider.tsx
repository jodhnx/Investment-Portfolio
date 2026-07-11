"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient, resetBrowserClient } from "@/lib/supabase/client";
import { usePortfolioStore } from "@/store/portfolio-store";
import { logAuthDebug, logAuthError } from "@/lib/auth/logger";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshSession: async () => {},
});

function sameUser(a: User | null, b: User | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.id === b.id;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { session: s },
        error,
      } = await supabase.auth.getSession();
      if (error) logAuthError("refreshSession", error);
      setSession(s);
      setUser((prev) => {
        const next = s?.user ?? null;
        return sameUser(prev, next) ? prev : next;
      });
    } catch (err) {
      logAuthError("refreshSession:unexpected", err);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      logAuthDebug("authStateChange", { event, userId: s?.user?.id });

      setSession((prev) => (prev?.access_token === s?.access_token ? prev : s));
      setUser((prev) => {
        const next = s?.user ?? null;
        return sameUser(prev, next) ? prev : next;
      });
      setLoading(false);

      if (event === "SIGNED_OUT") {
        usePortfolioStore.getState().reset();
        resetBrowserClient();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) logAuthError("signOut", error);
    } catch (err) {
      logAuthError("signOut:unexpected", err);
    }
    setUser(null);
    setSession(null);
    usePortfolioStore.getState().reset();
    resetBrowserClient();
  }, []);

  const value = useMemo(
    () => ({ user, session, loading, signOut, refreshSession }),
    [user, session, loading, signOut, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
