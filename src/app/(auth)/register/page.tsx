"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError, validateEmail, validatePassword } from "@/lib/auth/errors";
import { AuthLayout, AuthLink } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) return toast.error(emailErr);
    const pwErr = validatePassword(password);
    if (pwErr) return toast.error(pwErr);
    if (password !== confirmPassword) return toast.error("Passwörter stimmen nicht überein.");

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      toast.error(mapAuthError(error.message));
      return;
    }

    if (data.user && !data.session) {
      toast.success("Bestätigungs-E-Mail gesendet!", {
        description: "Bitte prüfe dein Postfach und bestätige deine E-Mail.",
      });
      router.push("/verify-email");
      return;
    }

    toast.success("Konto erstellt!");
    router.push("/onboarding");
    router.refresh();
  };

  return (
    <AuthLayout title="Konto erstellen" subtitle="Starte mit deinem persönlichen Portfolio">
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Max Mustermann"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@beispiel.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Passwort</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <p className="text-xs text-muted-foreground">
            Min. 8 Zeichen, Großbuchstabe und Zahl
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Passwort bestätigen</Label>
          <Input
            id="confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrieren"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Bereits registriert? <AuthLink href="/login">Anmelden</AuthLink>
      </p>
    </AuthLayout>
  );
}
