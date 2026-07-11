"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError, validateEmail } from "@/lib/auth/errors";
import { AuthLayout, AuthLink } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) return toast.error(emailErr);
    if (!password) return toast.error("Passwort ist erforderlich.");

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast.error(mapAuthError(error.message));
      return;
    }
    toast.success("Erfolgreich angemeldet!");
    router.push(redirect);
    router.refresh();
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setOauthLoading(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
    if (error) {
      toast.error(mapAuthError(error.message));
      setOauthLoading(null);
    }
  };

  return (
    <AuthLayout title="Willkommen zurück" subtitle="Melde dich an, um dein Portfolio zu verwalten">
      <form onSubmit={handleLogin} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Passwort</Label>
            <AuthLink href="/forgot-password">Vergessen?</AuthLink>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Anmelden"}
        </Button>
      </form>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          oder
        </span>
      </div>

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          disabled={!!oauthLoading}
          onClick={() => handleOAuth("google")}
        >
          {oauthLoading === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mit Google anmelden"}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          disabled={!!oauthLoading}
          onClick={() => handleOAuth("github")}
        >
          {oauthLoading === "github" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mit GitHub anmelden"}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Noch kein Konto? <AuthLink href="/register">Registrieren</AuthLink>
      </p>
    </AuthLayout>
  );
}
