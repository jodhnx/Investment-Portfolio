import type { SupabaseClient, User } from "@supabase/supabase-js";
import { syncProfileFromUser } from "@/lib/auth/profile-sync";
import { logAuthDebug, logAuthError } from "@/lib/auth/logger";

export interface PostLoginDestination {
  path: string;
  onboardingComplete: boolean;
}

/** Profil sicherstellen und Zielroute nach Login bestimmen */
export async function resolvePostLoginDestination(
  supabase: SupabaseClient,
  user: User,
  requestedRedirect?: string | null
): Promise<PostLoginDestination> {
  await syncProfileFromUser(supabase, user);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("onboarding_complete")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) {
    logAuthError("post-login:profile", error);
  }

  const onboardingComplete = !!profile?.onboarding_complete;

  if (!onboardingComplete) {
    logAuthDebug("post-login:destination", { path: "/onboarding" });
    return { path: "/onboarding", onboardingComplete: false };
  }

  const safeRedirect =
    requestedRedirect &&
    requestedRedirect.startsWith("/") &&
    !requestedRedirect.startsWith("//") &&
    !requestedRedirect.startsWith("/login") &&
    !requestedRedirect.startsWith("/register")
      ? requestedRedirect
      : "/";

  logAuthDebug("post-login:destination", { path: safeRedirect });
  return { path: safeRedirect, onboardingComplete: true };
}

/** Vollständige Navigation nach Login – vermeidet RSC-Race mit Middleware */
export function navigateAfterLogin(path: string): void {
  window.location.assign(path);
}
