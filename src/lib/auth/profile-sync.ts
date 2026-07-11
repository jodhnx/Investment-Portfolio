import type { SupabaseClient, User } from "@supabase/supabase-js";
import { logAuthError, logAuthDebug } from "@/lib/auth/logger";

/** Profil nach Registrierung/Callback aus User-Metadaten synchronisieren (Upsert) */
export async function syncProfileFromUser(
  supabase: SupabaseClient,
  user: User
): Promise<{ error: string | null }> {
  const meta = user.user_metadata ?? {};
  const firstName = (meta.first_name as string) ?? "";
  const lastName = (meta.last_name as string) ?? "";
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    (meta.name as string) ||
    null;

  const profileData = {
    name: fullName,
    first_name: firstName || null,
    last_name: lastName || null,
    username: (meta.username as string) || null,
    email: user.email ?? "",
    avatar: (meta.avatar_url as string) || null,
  };

  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (selectError) {
    logAuthError("profile:select", selectError);
    return { error: selectError.message };
  }

  if (existing) {
    const { error } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("auth_user_id", user.id);

    if (error) {
      logAuthError("profile:update", error);
      return { error: error.message };
    }
    logAuthDebug("profile:update", { userId: user.id });
    return { error: null };
  }

  const { error: insertError } = await supabase.from("profiles").insert({
    auth_user_id: user.id,
    ...profileData,
    currency: "EUR",
    language: "de",
    onboarding_complete: false,
  });

  if (insertError) {
    logAuthError("profile:insert", insertError);
    return { error: insertError.message };
  }

  logAuthDebug("profile:insert", { userId: user.id });
  return { error: null };
}

export function isEmailConfirmed(user: User): boolean {
  return !!user.email_confirmed_at;
}
