"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError, validatePassword } from "@/lib/auth/errors";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwErr = validatePassword(password);
    if (pwErr) return toast.error(pwErr);
    if (password !== confirm) return toast.error("Passwörter stimmen nicht überein.");

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(mapAuthError(error.message));
      return;
    }

    toast.success("Passwort erfolgreich geändert!");
    router.push("/");
    router.refresh();
  };

  return (
    <AuthLayout title="Neues Passwort" subtitle="Wähle ein sicheres Passwort">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Neues Passwort</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Passwort bestätigen</Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Passwort speichern"}
        </Button>
      </form>
    </AuthLayout>
  );
}
