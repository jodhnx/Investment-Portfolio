"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth/url";
import { mapAuthError } from "@/lib/auth/errors";
import {
  validateRegisterForm,
  hasFieldErrors,
  type FieldErrors,
} from "@/lib/auth/validation";
import { AuthLayout, AuthLink } from "@/components/auth/auth-layout";
import { FormField, PasswordField } from "@/components/auth/form-fields";
import { PasswordStrengthMeter } from "@/components/auth/password-strength";
import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { toast } from "sonner";

export function RegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    const fieldErrors = validateRegisterForm({
      firstName,
      lastName,
      username,
      email,
      password,
      confirmPassword,
    });

    if (hasFieldErrors(fieldErrors)) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          username: username.trim() || null,
          name: `${firstName.trim()} ${lastName.trim()}`,
        },
        emailRedirectTo: getAuthCallbackUrl({ next: "/onboarding" }),
      },
    });

    setLoading(false);

    if (error) {
      const msg = mapAuthError(error.message, error.code);
      setGlobalError(msg);
      toast.error(msg);
      return;
    }

    // E-Mail-Bestätigung erforderlich → keine Session
    if (data.user && !data.session) {
      toast.success("Bestätigungs-E-Mail gesendet!", {
        description: "Bitte prüfe dein Postfach und klicke auf den Bestätigungslink.",
      });
      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
      return;
    }

    // Fallback falls Bestätigung deaktiviert
    toast.success("Konto erstellt!");
    router.push("/onboarding");
    router.refresh();
  };

  return (
    <AuthLayout title="Konto erstellen" subtitle="Starte mit deinem persönlichen Portfolio">
      {globalError && <AuthAlert message={globalError} />}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            id="firstName"
            label="Vorname"
            value={firstName}
            onChange={setFirstName}
            error={errors.firstName}
            autoComplete="given-name"
            placeholder="Max"
            required
          />
          <FormField
            id="lastName"
            label="Nachname"
            value={lastName}
            onChange={setLastName}
            error={errors.lastName}
            autoComplete="family-name"
            placeholder="Mustermann"
            required
          />
        </div>

        <FormField
          id="username"
          label="Benutzername (optional)"
          value={username}
          onChange={setUsername}
          error={errors.username}
          autoComplete="username"
          placeholder="max_trader"
        />

        <FormField
          id="email"
          label="E-Mail"
          type="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
          autoComplete="email"
          placeholder="name@beispiel.de"
          required
        />

        <PasswordField
          id="password"
          label="Passwort"
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete="new-password"
        />
        <PasswordStrengthMeter password={password} />

        <PasswordField
          id="confirmPassword"
          label="Passwort wiederholen"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird registriert…
            </>
          ) : (
            "Konto erstellen"
          )}
        </Button>
      </form>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          oder
        </span>
      </div>

      <OAuthButtons redirect="/onboarding" />

      <p className="text-center text-sm text-muted-foreground">
        Bereits registriert? <AuthLink href="/login">Anmelden</AuthLink>
      </p>
    </AuthLayout>
  );
}
