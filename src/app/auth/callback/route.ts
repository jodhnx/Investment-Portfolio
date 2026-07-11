import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { asProfile } from "@/lib/supabase/helpers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("onboarding_complete")
          .eq("auth_user_id", user.id)
          .single();

        const profile = asProfile(profileData);
        const destination = profile && !profile.onboarding_complete
          ? "/onboarding"
          : redirect;
        return NextResponse.redirect(`${origin}${destination}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
