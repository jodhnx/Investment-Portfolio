"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { getAuthErrorMessage, mapAuthError } from "@/lib/auth/errors";
import { AuthLayout, AuthLink } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  const displayMessage = error
    ? getAuthErrorMessage(error, message ? mapAuthError(message) : null)
    : "Ein unbekannter Fehler ist aufgetreten.";

  return (
    <AuthLayout title="Anmeldung fehlgeschlagen" subtitle="">
      <div className="flex flex-col items-center gap-4 text-center animate-in fade-in duration-500">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-sm text-muted-foreground">{displayMessage}</p>
        <div className="flex w-full flex-col gap-2 pt-2">
          <Button className="w-full" onClick={() => router.push("/login")}>
            Zum Login
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push("/register")}>
            Neu registrieren
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
