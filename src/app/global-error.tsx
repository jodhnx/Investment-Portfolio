"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App:global-error]", error);
  }, [error]);

  return (
    <html lang="de">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <h2 className="text-xl font-semibold">Anwendungsfehler</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {error.message || "Die Anwendung konnte nicht geladen werden."}
        </p>
        <div className="flex gap-2">
          <Button onClick={() => reset()}>Erneut versuchen</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Startseite
          </Button>
        </div>
      </body>
    </html>
  );
}
