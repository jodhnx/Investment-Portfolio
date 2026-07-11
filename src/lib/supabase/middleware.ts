import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { asProfile } from "./helpers";

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
];

export async function updateSession(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  // Session refreshen – hält Login beim Seiten-Reload
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isOnboarding = pathname.startsWith("/onboarding");

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    const emailConfirmed = !!user.email_confirmed_at;

    if (!emailConfirmed && !UNCONFIRMED_ALLOWED.some((r) => pathname.startsWith(r))) {
      const url = request.nextUrl.clone();
      url.pathname = "/verify-email";
      if (user.email) url.searchParams.set("email", user.email);
      return NextResponse.redirect(url);
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("auth_user_id", user.id)
      .single();

    const profile = asProfile(profileData);
    const needsOnboarding = emailConfirmed && profile && !profile.onboarding_complete;

    if (needsOnboarding && !isOnboarding && !isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    if (!needsOnboarding && isOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    if (isPublic && !pathname.startsWith("/auth/") && emailConfirmed && !needsOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    if (
      isPublic &&
      !pathname.startsWith("/auth/") &&
      pathname !== "/verify-email" &&
      needsOnboarding
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
