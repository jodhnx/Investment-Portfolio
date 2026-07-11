/**
 * Kanonische Site-URL für Auth-Redirects.
 * Produktion: NEXT_PUBLIC_SITE_URL=https://investment-portfolio-flax.vercel.app
 */
const PRODUCTION_URL = "https://investment-portfolio-flax.vercel.app";

export function getSiteUrl(request?: Request | { url: string }): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL);
  }

  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (request) {
    const url =
      "url" in request ? new URL(request.url) : new URL((request as Request).url);
    return url.origin;
  }

  return "http://localhost:3000";
}

export function getClientSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL);
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return PRODUCTION_URL;
}

export function getAuthCallbackUrl(params?: Record<string, string>): string {
  const base = getClientSiteUrl();
  if (!base) {
    console.error("[Auth:url] getAuthCallbackUrl – keine Site-URL verfügbar");
    return `${PRODUCTION_URL}/auth/callback`;
  }
  const url = new URL("/auth/callback", base);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const result = url.toString();
  logAuthUrl("callback", result);
  return result;
}

export function logAuthUrl(context: string, url: string): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[Auth:url:${context}]`, url);
  }
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}
