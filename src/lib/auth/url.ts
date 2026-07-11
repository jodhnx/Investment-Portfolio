/**
 * Kanonische Site-URL für Auth-Redirects (E-Mail, OAuth, Passwort-Reset).
 * Priorität: NEXT_PUBLIC_SITE_URL > VERCEL_URL > Request-Origin > localhost
 *
 * In Vercel setzen: NEXT_PUBLIC_SITE_URL=https://meine-app.vercel.app
 * Supabase Dashboard → Authentication → URL Configuration:
 *   Site URL: https://meine-app.vercel.app
 *   Redirect URLs: https://meine-app.vercel.app/auth/callback
 *                  http://localhost:3000/auth/callback (nur Entwicklung)
 */
export function getSiteUrl(request?: Request | { url: string }): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL);
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (request) {
    const url = "url" in request ? new URL(request.url) : new URL((request as Request).url);
    return url.origin;
  }

  return "http://localhost:3000";
}

/** Client-seitige Site-URL – bevorzugt immer NEXT_PUBLIC_SITE_URL */
export function getClientSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL);
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

export function getAuthCallbackUrl(params?: Record<string, string>): string {
  const base = typeof window !== "undefined" ? getClientSiteUrl() : getSiteUrl();
  const url = new URL("/auth/callback", base);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return url.toString();
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}
