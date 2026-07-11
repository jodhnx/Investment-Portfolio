import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/auth/url";
import { asProfile } from "@/lib/supabase/helpers";
import { syncProfileFromUser } from "@/lib/auth/profile-sync";
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

  if (error) {
    const params = new URLSearchParams({
      error,
      message: errorDescription ?? error,
    });
    return NextResponse.redirect(`${siteUrl}/auth/error?${params}`);
  }

  const supabase = await createClient();

  // PKCE-Flow (E-Mail-Bestätigung, OAuth, Passwort-Reset)
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      const params = new URLSearchParams({
        error: "exchange_failed",
        message: exchangeError.message,
      });
      return NextResponse.redirect(`${siteUrl}/auth/error?${params}`);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${siteUrl}/auth/error?error=no_user`);
    }

    await syncProfileFromUser(supabase, user);

    // Passwort-Reset-Flow
    if (type === "recovery") {
      return NextResponse.redirect(`${siteUrl}/reset-password`);
    }

    // E-Mail gerade bestätigt → Onboarding oder Dashboard
    const { data: profileData } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("auth_user_id", user.id)
      .single();

    const profile = asProfile(profileData);
    const destination =
      profile && !profile.onboarding_complete ? "/onboarding" : next;

    return NextResponse.redirect(`${siteUrl}${destination}`);
  }

  // Legacy OTP-Flow (token_hash)
  if (tokenHash && type) {
    const { error: otpError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });

    if (otpError) {
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

    if (type === "recovery") {
      return NextResponse.redirect(`${siteUrl}/reset-password`);
    }

    return NextResponse.redirect(`${siteUrl}${next}`);
  }

  return NextResponse.redirect(`${siteUrl}/auth/error?error=missing_code`);
}
