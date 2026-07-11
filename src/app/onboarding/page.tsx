"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { syncProfileFromUser } from "@/lib/auth/profile-sync";
import { completeOnboarding } from "@/lib/supabase/queries";
import { usePortfolioStore } from "@/store/portfolio-store";
import { logAuthError } from "@/lib/auth/logger";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const COUNTRIES = [
  { value: "DE", label: "Deutschland" },
  { value: "AT", label: "Österreich" },
  { value: "CH", label: "Schweiz" },
  { value: "US", label: "USA" },
  { value: "GB", label: "Großbritannien" },
];

const LANGUAGES = [
  { value: "de", label: "Deutsch" },
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
];

const TIMEZONES = [
  { value: "Europe/Berlin", label: "Berlin (MEZ)" },
  { value: "Europe/Vienna", label: "Wien (MEZ)" },
  { value: "Europe/Zurich", label: "Zürich (MEZ)" },
  { value: "America/New_York", label: "New York (EST)" },
  { value: "UTC", label: "UTC" },
];

export default function OnboardingPage() {
  const profile = usePortfolioStore((s) => s.profile);
  const hydrate = usePortfolioStore((s) => s.hydrate);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    currency: "EUR",
    country: "DE",
    language: "de",
    timezone: "Europe/Berlin",
  });

  useEffect(() => {
    async function init() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await syncProfileFromUser(supabase, user);
        }
        await hydrate();
      } catch (err) {
        logAuthError("onboarding:init", err);
        toast.error("Profil konnte nicht geladen werden.");
      } finally {
        setInitLoading(false);
      }
    }
    init();
  }, [hydrate]);

  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        name: profile.name ?? f.name,
        currency: profile.currency ?? f.currency,
        country: profile.country ?? f.country,
        language: profile.language ?? f.language,
        timezone: profile.timezone ?? f.timezone,
      }));
    }
  }, [profile]);

  const ensureProfile = async (): Promise<string | null> => {
    if (profile?.id) return profile.id;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    await syncProfileFromUser(supabase, user);
    await hydrate();

    return usePortfolioStore.getState().profile?.id ?? null;
  };

  const handleFinish = async () => {
    if (!form.name.trim()) return toast.error("Bitte gib deinen Namen ein.");

    setLoading(true);
    try {
      const profileId = await ensureProfile();
      if (!profileId) {
        toast.error("Profil konnte nicht erstellt werden. Bitte Seite neu laden.");
        return;
      }

      const success = await completeOnboarding(profileId, form);
      if (!success) {
        toast.error("Onboarding fehlgeschlagen. Bitte erneut versuchen.");
        return;
      }

      await hydrate();
      toast.success(`Willkommen, ${form.name}!`);
      window.location.assign("/");
    } catch (err) {
      logAuthError("onboarding:finish", err);
      toast.error("Ein Fehler ist aufgetreten. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <AuthLayout title="Willkommen bei InvestTrack" subtitle="Profil wird vorbereitet…">
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Willkommen bei InvestTrack"
      subtitle={`Schritt ${step} von 2 – Profil einrichten`}
    >
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Dein Name</Label>
            <Input
              id="name"
              placeholder="Max Mustermann"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Standardwährung</Label>
            <Select
              value={form.currency}
              onValueChange={(v) => v && setForm({ ...form, currency: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="CHF">CHF (Fr.)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={() => setStep(2)}>
            Weiter
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Land</Label>
            <Select
              value={form.country}
              onValueChange={(v) => v && setForm({ ...form, country: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sprache</Label>
            <Select
              value={form.language}
              onValueChange={(v) => v && setForm({ ...form, language: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Zeitzone</Label>
            <Select
              value={form.timezone}
              onValueChange={(v) => v && setForm({ ...form, timezone: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
              Zurück
            </Button>
            <Button className="flex-1" onClick={handleFinish} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Los geht's!"}
            </Button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
