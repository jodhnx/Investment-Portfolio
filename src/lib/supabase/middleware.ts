import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { asProfile } from "./helpers";
import { redirectWithCookies } from "./route-handler";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/auth/callback",
  "/auth/error",
];

const UNCONFIRMED_ALLOWED = [
  "/verify-email",
  "/auth/callback",
  "/auth/error",
  "/login",
  "/register",
  "/forgot-password",
];

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("[Auth:middleware] Supabase env vars missing");
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Session refreshen – KRITISCH: Cookies auf supabaseResponse, nicht auf Redirect verwerfen!
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isOnboarding = pathname.startsWith("/onboarding");

  if (!user && !isPublic) {
    return redirectWithCookies(request, supabaseResponse, "/login", {
      redirect: pathname,
    });
  }

  if (user) {
    const emailConfirmed = !!user.email_confirmed_at;

    if (
      !emailConfirmed &&
      !UNCONFIRMED_ALLOWED.some((r) => pathname.startsWith(r))
    ) {
      return redirectWithCookies(request, supabaseResponse, "/verify-email", {
        ...(user.email ? { email: user.email } : {}),
      });
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const profile = asProfile(profileData);
    const needsOnboarding =
      emailConfirmed && (!profile || !profile.onboarding_complete);

    if (needsOnboarding && !isOnboarding && !isPublic) {
      return redirectWithCookies(request, supabaseResponse, "/onboarding");
    }

    if (!needsOnboarding && isOnboarding) {
      return redirectWithCookies(request, supabaseResponse, "/");
    }

    if (
      isPublic &&
      !pathname.startsWith("/auth/") &&
      pathname !== "/verify-email" &&
      pathname !== "/reset-password" &&
      emailConfirmed &&
      !needsOnboarding
    ) {
      return redirectWithCookies(request, supabaseResponse, "/");
    }

    if (
      isPublic &&
      !pathname.startsWith("/auth/") &&
      pathname !== "/verify-email" &&
      needsOnboarding
    ) {
      return redirectWithCookies(request, supabaseResponse, "/onboarding");
    }
  }

  return supabaseResponse;
}
