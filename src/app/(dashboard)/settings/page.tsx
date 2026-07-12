"use client";

import { useState, useRef } from "react";
import { Loader2, Trash2, Download, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { exportAllUserData } from "@/lib/supabase/queries";
import { uploadAvatar } from "@/lib/supabase/sync";
import { mapAuthError, validatePassword } from "@/lib/auth/errors";
import { useAuth } from "@/components/providers/auth-provider";
import { usePortfolioStore } from "@/store/portfolio-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/components/providers/theme-provider";
import type { Currency } from "@/lib/types";
import { toast } from "sonner";
import { PortfolioManager } from "@/components/portfolio/portfolio-manager";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const profile = usePortfolioStore((s) => s.profile);
  const updateProfile = usePortfolioStore((s) => s.updateProfile);
  const settings = usePortfolioStore((s) => s.updateSettings);
  const appSettings = usePortfolioStore((s) => s.settings);
  const profileId = usePortfolioStore((s) => s.profileId);
  const reset = usePortfolioStore((s) => s.reset);

  const [name, setName] = useState(profile?.name ?? "");
  const [currency, setCurrency] = useState(profile?.currency ?? "EUR");
  const [language, setLanguage] = useState(profile?.language ?? "de");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [portfolioManageOpen, setPortfolioManageOpen] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = () => {
    updateProfile({ name, currency, language });
    settings({ defaultCurrency: currency as Currency });
    toast.success("Profil gespeichert");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const { url, error } = await uploadAvatar(user.id, file);
    if (error) return toast.error(error);
    if (url) {
      updateProfile({ avatar: url });
      toast.success("Profilbild aktualisiert");
    }
  };

  const handlePasswordChange = async () => {
    const pwErr = validatePassword(newPassword);
    if (pwErr) return toast.error(pwErr);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) return toast.error(mapAuthError(error.message));
    setNewPassword("");
    toast.success("Passwort geändert");
  };

  const handleExport = async () => {
    if (!profileId) return;
    const data = await exportAllUserData(profileId);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `velo_export_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Daten exportiert");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Konto wirklich löschen? Alle Daten werden unwiderruflich gelöscht.")) return;
    setLoading(true);
    const supabase = createClient();
    if (profileId) {
      await supabase.from("profiles").delete().eq("id", profileId);
    }
    await supabase.auth.signOut();
    reset();
    setLoading(false);
    toast.success("Konto gelöscht");
    router.push("/login");
    router.refresh();
  };

  const handleResetData = async () => {
    if (!confirm("Alle Portfolios und Transaktionen löschen? Profil bleibt erhalten.")) return;
    if (!profileId) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("portfolios").delete().eq("profile_id", profileId);
    await supabase.from("watchlist").delete().eq("profile_id", profileId);
    await supabase.from("price_alerts").delete().eq("profile_id", profileId);
    await supabase.from("notes").delete().eq("profile_id", profileId);
    await usePortfolioStore.getState().hydrate();
    setLoading(false);
    toast.success("Daten zurückgesetzt");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Einstellungen</h2>
        <p className="text-sm text-muted-foreground">
          Profil, Sicherheit und Datensynchronisierung mit Supabase
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Portfolios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Erstellen, bearbeiten, duplizieren oder archivieren Sie Ihre Portfolios.
            </p>
            <Button variant="outline" onClick={() => setPortfolioManageOpen(true)}>
              Portfolios verwalten
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar ?? undefined} />
                <AvatarFallback>{name.slice(0, 2).toUpperCase() || "?"}</AvatarFallback>
              </Avatar>
              <div>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <Button variant="outline" size="sm" onClick={() => avatarRef.current?.click()}>
                  Profilbild ändern
                </Button>
              </div>
            </div>
            <div>
              <Label>Name</Label>
              <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>E-Mail</Label>
              <Input className="mt-1.5" value={profile?.email ?? ""} disabled />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Währung</Label>
                <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="CHF">CHF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sprache</Label>
                <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSaveProfile}>Profil speichern</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Passwort
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Neues Passwort</Label>
              <Input
                type="password"
                className="mt-1.5"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button onClick={handlePasswordChange} disabled={loading || !newPassword}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Passwort ändern"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Darstellung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label>Dunkler Modus</Label>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Synchronisierung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Alle Änderungen werden automatisch mit Supabase synchronisiert.</p>
            <p>Aktualisierungsintervall: {appSettings.priceRefreshInterval / 1000}s</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Daten & Konto</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Alle Daten exportieren
            </Button>
            <Button variant="outline" onClick={handleResetData} disabled={loading}>
              Daten zurücksetzen
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
              <Trash2 className="mr-2 h-4 w-4" /> Konto löschen
            </Button>
            <Button variant="ghost" onClick={async () => { await signOut(); router.push("/login"); }}>
              Abmelden
            </Button>
          </CardContent>
        </Card>
      </div>
      <PortfolioManager open={portfolioManageOpen} onOpenChange={setPortfolioManageOpen} />
    </div>
  );
}
