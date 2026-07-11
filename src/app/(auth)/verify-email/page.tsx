"use client";

import { Mail } from "lucide-react";
import { AuthLayout, AuthLink } from "@/components/auth/auth-layout";

export default function VerifyEmailPage() {
  return (
    <AuthLayout title="E-Mail bestätigen" subtitle="Fast geschafft!">
      <div className="flex flex-col items-center gap-4 text-center">
        <Mail className="h-12 w-12 text-primary" />
        <p className="text-sm text-muted-foreground">
          Wir haben dir eine Bestätigungs-E-Mail gesendet. Klicke auf den Link in der
          E-Mail, um dein Konto zu aktivieren.
        </p>
        <p className="text-xs text-muted-foreground">
          Keine E-Mail erhalten? Prüfe den Spam-Ordner oder registriere dich erneut.
        </p>
        <AuthLink href="/login">Zurück zum Login</AuthLink>
      </div>
    </AuthLayout>
  );
}
