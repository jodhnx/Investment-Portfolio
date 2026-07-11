import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSiteUrl } from "@/lib/auth/url";
import { asProfile } from "@/lib/supabase/helpers";
import { syncProfileFromUser } from "@/lib/auth/profile-sync";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { logAuthDebug, logAuthError } from "@/lib/auth/logger";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const siteUrl = getSiteUrl(request);
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") ?? "/";
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  logAuthDebug("callback", {
    hasCode: !!code,
    type,
    next,
    error,
    siteUrl,
  });

  if (error) {
    logAuthError("callback:oauth", { message: errorDescription ?? error });
    const params = new URLSearchParams({
      error,
      message: errorDescription ?? error,
    });
    return NextResponse.redirect(`${siteUrl}/auth/error?${params}`);
  }

  // PKCE-Flow: E-Mail-Bestätigung, OAuth, Passwort-Reset
  if (code) {
    // Eine Response für den gesamten Flow – Session-Cookies bleiben mit Optionen erhalten
    let destination = type === "recovery" ? "/reset-password" : next;
    const response = NextResponse.redirect(`${siteUrl}${destination}`);

    const supabase = createRouteHandlerClient(request, response);
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      logAuthError("callback:exchange", exchangeError);
      const params = new URLSearchParams({
        error: "exchange_failed",
        message: exchangeError.message,
      });
      return NextResponse.redirect(`${siteUrl}/auth/error?${params}`);
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      logAuthError("callback:user", userError ?? "No user after exchange");
      return NextResponse.redirect(`${siteUrl}/auth/error?error=no_user`);
    }

    logAuthDebug("callback:success", {
      userId: user.id,
      email: user.email,
      confirmed: !!user.email_confirmed_at,
    });

    const { error: profileError } = await syncProfileFromUser(supabase, user);
    if (profileError) {
      logAuthError("callback:profile", profileError);
    }

    if (type !== "recovery") {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      const profile = asProfile(profileData);
      destination =
        !profile || !profile.onboarding_complete ? "/onboarding" : next;
    }

    response.headers.set("Location", `${siteUrl}${destination}`);
    return response;
  }

  // Legacy OTP-Flow (token_hash)
  if (tokenHash && type) {
    let destination = type === "recovery" ? "/reset-password" : next;
    const response = NextResponse.redirect(`${siteUrl}${destination}`);
    const supabase = createRouteHandlerClient(request, response);

    const { error: otpError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });

    if (otpError) {
      logAuthError("callback:otp", otpError);
      const params = new URLSearchParams({
        error: "otp_invalid",
        message: otpError.message,
      });
      return NextResponse.redirect(`${siteUrl}/auth/error?${params}`);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await syncProfileFromUser(supabase, user);
    }

    return response;
  }

  logAuthError("callback", "Missing code and token_hash");
  return NextResponse.redirect(`${siteUrl}/auth/error?error=missing_code`);
}
