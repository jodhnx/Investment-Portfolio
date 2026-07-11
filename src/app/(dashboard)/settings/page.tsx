"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useTheme } from "@/components/providers/theme-provider";
import type { Currency } from "@/lib/types";
import { toast } from "sonner";

export default function SettingsPage() {
  const settings = usePortfolioStore((s) => s.settings);
  const updateSettings = usePortfolioStore((s) => s.updateSettings);
  const portfolios = usePortfolioStore((s) => s.portfolios);
  const updatePortfolio = usePortfolioStore((s) => s.updatePortfolio);
  const activePortfolioId = usePortfolioStore((s) => s.activePortfolioId);
  const { theme, toggleTheme } = useTheme();

  const activePortfolio = portfolios.find((p) => p.id === activePortfolioId);

  const handleBackup = () => {
    const state = usePortfolioStore.getState();
    const { history, historyIndex, hydrated, ...data } = state;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `investtrack_full_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Vollständiges Backup erstellt");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Einstellungen</h2>
        <p className="text-sm text-muted-foreground">
          App-Konfiguration, Währung und Backup
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Darstellung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Dunkler Modus</Label>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Währung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Standard-Währung</Label>
              <Select
                value={settings.defaultCurrency}
                onValueChange={(v) => v && updateSettings({ defaultCurrency: v as Currency })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="CHF">CHF (Fr.)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {activePortfolio && (
              <div>
                <Label>Portfolio-Währung</Label>
                <Select
                  value={activePortfolio.currency}
                  onValueChange={(v) =>
                    v && updatePortfolio(activePortfolio.id, { currency: v as Currency })
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="CHF">CHF (Fr.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preisaktualisierung</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Intervall</Label>
            <Select
              value={String(settings.priceRefreshInterval)}
              onValueChange={(v) =>
                v && updateSettings({ priceRefreshInterval: parseInt(v) })
              }
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30000">30 Sekunden</SelectItem>
                <SelectItem value="60000">1 Minute</SelectItem>
                <SelectItem value="300000">5 Minuten</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datensicherung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Alle Daten werden automatisch im Browser gespeichert (LocalStorage).
              Erstelle regelmäßig Backups.
            </p>
            <Button onClick={handleBackup}>Vollständiges Backup</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Authentifizierung (Cloud)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Für Google/Apple/E-Mail Login und Cloud-Sync PostgreSQL und NextAuth
              konfigurieren. Siehe README für Setup-Anleitung.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
