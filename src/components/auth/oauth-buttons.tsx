"use client";

import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth/url";
import { mapAuthError } from "@/lib/auth/errors";
import { logAuthDebug, logAuthError } from "@/lib/auth/logger";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export function OAuthButtons({ redirect = "/" }: { redirect?: string }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleOAuth = async (provider: "google" | "github") => {
    setLoading(provider);
    const redirectTo = getAuthCallbackUrl({ next: redirect });
    logAuthDebug("oauth:attempt", { provider, redirectTo });

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (error) {
        logAuthError(`oauth:${provider}`, error);
        toast.error(mapAuthError(error.message, error.code));
        setLoading(null);
      }
    } catch (err) {
      logAuthError(`oauth:${provider}:unexpected`, err);
      toast.error("Verbindungsfehler beim OAuth-Login.");
      setLoading(null);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={!!loading}
        onClick={() => handleOAuth("google")}
      >
        {loading === "google" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Mit Google anmelden"
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={!!loading}
        onClick={() => handleOAuth("github")}
      >
        {loading === "github" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Mit GitHub anmelden"
        )}
      </Button>
    </div>
  );
}
