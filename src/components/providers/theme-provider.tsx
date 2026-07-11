"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";

type Theme = "dark" | "light";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: "dark", toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settingsTheme = usePortfolioStore((s) => s.settings.theme);
  const updateSettings = usePortfolioStore((s) => s.updateSettings);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(settingsTheme);
  }, [settingsTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    updateSettings({ theme: next });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
