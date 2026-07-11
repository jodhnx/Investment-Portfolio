"use client";

import { createContext, useContext, useCallback, useMemo, useEffect } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";

type Theme = "dark" | "light";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: "dark", toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = usePortfolioStore((s) => s.settings.theme);
  const updateSettings = usePortfolioStore((s) => s.updateSettings);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    updateSettings({ theme: next });
  }, [theme, updateSettings]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
