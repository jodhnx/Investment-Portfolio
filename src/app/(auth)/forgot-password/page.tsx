"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError, validateEmail } from "@/lib/auth/errors";
import { AuthLayout, AuthLink } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) return toast.error(emailErr);

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast.error(mapAuthError(error.message));
      return;
    }
    setSent(true);
    toast.success("E-Mail gesendet!");
  };

  if (sent) {
    return (
      <AuthLayout title="E-Mail gesendet" subtitle="Prüfe dein Postfach">
        <div className="flex flex-col items-center gap-4 text-center">
          <Mail className="h-12 w-12 text-primary" />
          <p className="text-sm text-muted-foreground">
            Wir haben einen Link zum Zurücksetzen des Passworts an{" "}
            <strong>{email}</strong> gesendet.
          </p>
          <AuthLink href="/login">Zurück zum Login</AuthLink>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Passwort vergessen" subtitle="Wir senden dir einen Reset-Link">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@beispiel.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Link senden"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <AuthLink href="/login">Zurück zum Login</AuthLink>
      </p>
    </AuthLayout>
  );
}
