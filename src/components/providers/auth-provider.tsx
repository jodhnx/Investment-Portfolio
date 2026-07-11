"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { usePortfolioStore } from "@/store/portfolio-store";

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
    const supabase = createClient();
    const { data: { session: s } } = await supabase.auth.getSession();
    setSession(s);
    setUser(s?.user ?? null);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN" && s) {
        await hydrate();
      }
      if (event === "SIGNED_OUT") {
        reset();
      }
    });

    return () => subscription.unsubscribe();
  }, [hydrate, reset]);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    reset();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
