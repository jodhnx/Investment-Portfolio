"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Loader2, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth/url";
import { mapAuthError } from "@/lib/auth/errors";
import { AuthLayout, AuthLink } from "@/components/auth/auth-layout";
import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) {
      toast.error("Keine E-Mail-Adresse bekannt. Bitte registriere dich erneut.");
      return;
    }

    setResending(true);
    setError(null);
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: getAuthCallbackUrl({ next: "/onboarding" }),
      },
    });
    setResending(false);

    if (resendError) {
      const msg = mapAuthError(resendError.message, resendError.code);
      setError(msg);
      toast.error(msg);
      return;
    }

    setResent(true);
    toast.success("Bestätigungs-E-Mail erneut gesendet!");
  };

  return (
    <AuthLayout title="E-Mail bestätigen" subtitle="Fast geschafft!">
      <div className="flex flex-col items-center gap-4 text-center animate-in fade-in duration-500">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>

        <p className="text-sm text-muted-foreground">
          Wir haben eine Bestätigungs-E-Mail
          {email ? (
            <>
              {" "}an <strong className="text-foreground">{email}</strong>
            </>
          ) : (
            ""
          )}{" "}
          gesendet. Klicke auf den Link, um dein Konto zu aktivieren.
        </p>

        <p className="text-xs text-muted-foreground">
          Du kannst dich erst anmelden, nachdem deine E-Mail bestätigt wurde.
        </p>

        {error && <AuthAlert message={error} className="w-full text-left" />}
        {resent && (
          <AuthAlert
            variant="success"
            message="Bestätigungs-E-Mail wurde erneut gesendet."
            className="w-full text-left"
          />
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={handleResend}
          disabled={resending || !email}
        >
          {resending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          E-Mail erneut senden
        </Button>

        <AuthLink href="/login">Zurück zum Login</AuthLink>
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
