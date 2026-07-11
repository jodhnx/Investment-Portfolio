"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth/url";
import { mapAuthError } from "@/lib/auth/errors";
import { logAuthDebug, logAuthError } from "@/lib/auth/logger";
import { validateEmail } from "@/lib/auth/validation";
import { AuthLayout, AuthLink } from "@/components/auth/auth-layout";
import { FormField } from "@/components/auth/form-fields";
import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailErr = validateEmail(email);
    if (emailErr) {
      setFieldError(emailErr);
      return;
    }
    setFieldError(undefined);

    setLoading(true);

    const redirectTo = getAuthCallbackUrl({ type: "recovery", next: "/reset-password" });
    logAuthDebug("forgot-password:attempt", { email: email.trim(), redirectTo });

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo }
      );

      if (resetError) {
        logAuthError("forgot-password", resetError);
        const msg = mapAuthError(resetError.message, resetError.code);
        setError(msg);
        toast.error(msg);
        return;
      }

      setSent(true);
      toast.success("E-Mail gesendet!");
    } catch (err) {
      logAuthError("forgot-password:unexpected", err);
      const msg = "Verbindungsfehler. Bitte prüfe deine Internetverbindung.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }

  };

  if (sent) {
    return (
      <AuthLayout title="E-Mail gesendet" subtitle="Prüfe dein Postfach">
        <div className="flex flex-col items-center gap-4 text-center animate-in fade-in duration-500">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Wir haben einen Link zum Zurücksetzen des Passworts an{" "}
            <strong className="text-foreground">{email}</strong> gesendet.
          </p>
          <p className="text-xs text-muted-foreground">
            Der Link ist 24 Stunden gültig. Prüfe auch den Spam-Ordner.
          </p>
          <AuthLink href="/login">Zurück zum Login</AuthLink>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Passwort vergessen" subtitle="Wir senden dir einen sicheren Reset-Link">
      {error && <AuthAlert message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="email"
          label="E-Mail"
          type="email"
          value={email}
          onChange={setEmail}
          error={fieldError}
          placeholder="name@beispiel.de"
          autoComplete="email"
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird gesendet…
            </>
          ) : (
            "Reset-Link senden"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <AuthLink href="/login">Zurück zum Login</AuthLink>
      </p>
    </AuthLayout>
  );
}
