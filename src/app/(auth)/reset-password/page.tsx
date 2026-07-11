"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError } from "@/lib/auth/errors";
import { validatePassword } from "@/lib/auth/validation";
import { AuthLayout, AuthLink } from "@/components/auth/auth-layout";
import { PasswordField } from "@/components/auth/form-fields";
import { PasswordStrengthMeter } from "@/components/auth/password-strength";
import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setHasSession(!!session);
      setChecking(false);
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    const newErrors: typeof errors = {};

    const pwErr = validatePassword(password);
    if (pwErr) newErrors.password = pwErr;
    if (password !== confirm) newErrors.confirm = "Passwörter stimmen nicht überein.";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      const msg = mapAuthError(error.message, error.code);
      setGlobalError(msg);
      toast.error(msg);
      return;
    }

    toast.success("Passwort erfolgreich geändert!");
    router.push("/");
    router.refresh();
  };

  if (checking) {
    return (
      <AuthLayout title="Passwort zurücksetzen" subtitle="">
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AuthLayout>
    );
  }

  if (!hasSession) {
    return (
      <AuthLayout title="Link ungültig" subtitle="Bitte fordere einen neuen Link an">
        <AuthAlert message="Dein Reset-Link ist abgelaufen oder ungültig." />
        <div className="flex w-full flex-col gap-2 pt-2">
          <Button className="w-full" onClick={() => router.push("/forgot-password")}>
            Neuen Link anfordern
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <AuthLink href="/login">Zurück zum Login</AuthLink>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Neues Passwort" subtitle="Wähle ein sicheres Passwort">
      {globalError && <AuthAlert message={globalError} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordField
          id="password"
          label="Neues Passwort"
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete="new-password"
        />
        <PasswordStrengthMeter password={password} />
        <PasswordField
          id="confirm"
          label="Passwort bestätigen"
          value={confirm}
          onChange={setConfirm}
          error={errors.confirm}
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird gespeichert…
            </>
          ) : (
            "Passwort speichern & anmelden"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
