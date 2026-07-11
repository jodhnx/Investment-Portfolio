"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError, getAuthErrorMessage } from "@/lib/auth/errors";
import { validateEmail } from "@/lib/auth/validation";
import { AuthLayout, AuthLink } from "@/components/auth/auth-layout";
import { FormField, PasswordField } from "@/components/auth/form-fields";
import { AuthAlert } from "@/components/auth/auth-alert";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const urlError = searchParams.get("error");
  const urlMessage = searchParams.get("message");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (urlError || urlMessage) {
      setGlobalError(getAuthErrorMessage(urlError, urlMessage));
    }
  }, [urlError, urlMessage]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError(undefined);

    if (!password) {
      setGlobalError("Passwort ist erforderlich.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error ?? "Anmeldung fehlgeschlagen.";
        setGlobalError(msg);
        toast.error(msg);

        if (data.code === "email_not_confirmed") {
          router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
        }
        return;
      }

      // Session-Cookies wurden serverseitig gesetzt – Client synchronisieren
      const supabase = createClient();
      await supabase.auth.getSession();

      toast.success("Erfolgreich angemeldet!");
      router.push(redirect);
      router.refresh();
    } catch {
      setGlobalError("Keine Internetverbindung. Bitte prüfe deine Verbindung.");
      toast.error("Verbindungsfehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Willkommen zurück" subtitle="Melde dich an, um dein Portfolio zu verwalten">
      {globalError && <AuthAlert message={globalError} />}

      <form onSubmit={handleLogin} className="space-y-4">
        <FormField
          id="email"
          label="E-Mail"
          type="email"
          value={email}
          onChange={setEmail}
          error={emailError}
          autoComplete="email"
          placeholder="name@beispiel.de"
          required
        />

        <PasswordField
          id="password"
          label="Passwort"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(v) => setRememberMe(v === true)}
            />
            <Label htmlFor="remember" className="cursor-pointer text-sm font-normal">
              Angemeldet bleiben
            </Label>
          </div>
          <AuthLink href="/forgot-password">Passwort vergessen?</AuthLink>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird angemeldet…
            </>
          ) : (
            "Anmelden"
          )}
        </Button>
      </form>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          oder
        </span>
      </div>

      <OAuthButtons redirect={redirect} />

      <p className="text-center text-sm text-muted-foreground">
        Noch kein Konto? <AuthLink href="/register">Registrieren</AuthLink>
      </p>
    </AuthLayout>
  );
}
