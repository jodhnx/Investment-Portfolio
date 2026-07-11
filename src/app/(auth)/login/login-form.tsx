"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError, getAuthErrorMessage } from "@/lib/auth/errors";
import { logAuthError, logAuthDebug } from "@/lib/auth/logger";
import {
  navigateAfterLogin,
  resolvePostLoginDestination,
} from "@/lib/auth/post-login";
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

const MAX_ATTEMPTS = 5;

function checkRateLimit(): boolean {
  try {
    const raw = sessionStorage.getItem("auth_attempts");
    if (!raw) return false;
    const { count, resetAt } = JSON.parse(raw) as { count: number; resetAt: number };
    if (Date.now() > resetAt) {
      sessionStorage.removeItem("auth_attempts");
      return false;
    }
    return count >= MAX_ATTEMPTS;
  } catch {
    return false;
  }
}

function recordFailedAttempt(): void {
  try {
    const raw = sessionStorage.getItem("auth_attempts");
    const now = Date.now();
    const window = 15 * 60 * 1000;
    if (!raw) {
      sessionStorage.setItem(
        "auth_attempts",
        JSON.stringify({ count: 1, resetAt: now + window })
      );
      return;
    }
    const data = JSON.parse(raw) as { count: number; resetAt: number };
    if (now > data.resetAt) {
      sessionStorage.setItem(
        "auth_attempts",
        JSON.stringify({ count: 1, resetAt: now + window })
      );
    } else {
      sessionStorage.setItem(
        "auth_attempts",
        JSON.stringify({ count: data.count + 1, resetAt: data.resetAt })
      );
    }
  } catch {
    // ignore
  }
}

function clearAttempts(): void {
  try {
    sessionStorage.removeItem("auth_attempts");
  } catch {
    // ignore
  }
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const urlError = searchParams.get("error");
  const urlMessage = searchParams.get("message");
  const confirmed = searchParams.get("confirmed");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (urlError || urlMessage) {
      setGlobalError(getAuthErrorMessage(urlError, urlMessage));
    }
    if (confirmed === "1") {
      setSuccessMsg("E-Mail bestätigt! Du kannst dich jetzt anmelden.");
    }
  }, [urlError, urlMessage, confirmed]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setSuccessMsg(null);

    if (checkRateLimit()) {
      const msg = "Zu viele Anmeldeversuche. Bitte warte 15 Minuten.";
      setGlobalError(msg);
      toast.error(msg);
      return;
    }

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
      const supabase = createClient();

      logAuthDebug("login:attempt", { email: email.trim() });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        logAuthError("login", error);
        recordFailedAttempt();
        const msg = mapAuthError(error.message, error.code);
        setGlobalError(msg);
        toast.error(msg);

        if (error.code === "email_not_confirmed") {
          router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
        }
        return;
      }

      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        const msg = mapAuthError("Email not confirmed", "email_not_confirmed");
        setGlobalError(msg);
        toast.error(msg);
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
        return;
      }

      clearAttempts();
      logAuthDebug("login:success", { userId: data.user?.id });

      const { path } = await resolvePostLoginDestination(
        supabase,
        data.user,
        redirect
      );

      toast.success("Erfolgreich angemeldet!");
      navigateAfterLogin(path);
    } catch (err) {
      logAuthError("login:unexpected", err);
      const msg = "Keine Internetverbindung oder Serverfehler.";
      setGlobalError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Willkommen zurück" subtitle="Melde dich an, um dein Portfolio zu verwalten">
      {successMsg && <AuthAlert variant="success" message={successMsg} />}
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
