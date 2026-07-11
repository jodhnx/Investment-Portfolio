import type { SupabaseClient, User } from "@supabase/supabase-js";

/** Profil nach Registrierung/Callback aus User-Metadaten synchronisieren */
export async function syncProfileFromUser(
  supabase: SupabaseClient,
  user: User
): Promise<void> {
  const meta = user.user_metadata ?? {};
  const firstName = (meta.first_name as string) ?? "";
  const lastName = (meta.last_name as string) ?? "";
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    (meta.name as string) ||
    null;

  await supabase
    .from("profiles")
    .update({
      name: fullName,
      first_name: firstName || null,
      last_name: lastName || null,
      username: (meta.username as string) || null,
      email: user.email ?? "",
      avatar: meta.avatar_url ?? null,
    })
    .eq("auth_user_id", user.id);
}

export function isEmailConfirmed(user: User): boolean {
  return !!user.email_confirmed_at;
}
