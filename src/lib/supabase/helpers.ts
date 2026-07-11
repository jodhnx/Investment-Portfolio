import type { Profile } from "./database.types";

/** Hilfstyp für Supabase-Abfragen bis `supabase gen types` ausgeführt wird */
export type ProfileRow = Pick<Profile, "id" | "auth_user_id" | "onboarding_complete" | "name" | "email" | "currency">;

export function asProfile(data: unknown): ProfileRow | null {
  if (!data || typeof data !== "object") return null;
  return data as ProfileRow;
}
