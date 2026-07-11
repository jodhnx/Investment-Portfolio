import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { mapAuthError } from "@/lib/auth/errors";

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 0, resetAt: now + WINDOW_MS });
    return false;
  }
  return record.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip: string): void {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    record.count += 1;
  }
}

function createSupabaseForRoute(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Zu viele Anmeldeversuche. Bitte warte 15 Minuten." },
      { status: 429 }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: "E-Mail und Passwort sind erforderlich." },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ success: true });
  const supabase = createSupabaseForRoute(request, response);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    recordAttempt(ip);
    return NextResponse.json(
      { error: mapAuthError(error.message, error.code), code: error.code },
      { status: 401 }
    );
  }

  if (data.user && !data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    return NextResponse.json(
      {
        error: mapAuthError("Email not confirmed", "email_not_confirmed"),
        code: "email_not_confirmed",
      },
      { status: 403 }
    );
  }

  attempts.delete(ip);
  return response;
}
