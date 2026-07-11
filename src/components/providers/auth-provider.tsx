"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient, resetBrowserClient } from "@/lib/supabase/client";
import { syncProfileFromUser } from "@/lib/auth/profile-sync";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const hydrate = usePortfolioStore((s) => s.hydrate);
  const reset = usePortfolioStore((s) => s.reset);

  const refreshSession = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { session: s },
        error,
      } = await supabase.auth.getSession();
      if (error) logAuthError("refreshSession", error);
      setSession(s);
      setUser(s?.user ?? null);
    } catch (err) {
      logAuthError("refreshSession:unexpected", err);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session: s }, error }) => {
      if (error) logAuthError("initSession", error);
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
      logAuthDebug("initSession", { hasSession: !!s, userId: s?.user?.id });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, s) => {
      logAuthDebug("authStateChange", { event, userId: s?.user?.id });
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN" && s?.user?.email_confirmed_at) {
        const supabase = createClient();
        await syncProfileFromUser(supabase, s.user);
        await hydrate();
      }
      if (event === "SIGNED_OUT") {
        reset();
        resetBrowserClient();
      }
      if (event === "TOKEN_REFRESHED" && s) {
        setSession(s);
        setUser(s.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [hydrate, reset]);

  const signOut = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) logAuthError("signOut", error);
    } catch (err) {
      logAuthError("signOut:unexpected", err);
    }
    setUser(null);
    setSession(null);
    reset();
    resetBrowserClient();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
