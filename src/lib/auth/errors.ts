/** Deutsche Fehlermeldungen für Supabase Auth */
export function mapAuthError(message: string, code?: string): string {
  const lower = message.toLowerCase();
  const errorCode = code?.toLowerCase() ?? "";

  if (
    errorCode === "email_not_confirmed" ||
    lower.includes("email not confirmed") ||
    lower.includes("email_not_confirmed")
  ) {
    return "Bitte bestätige zuerst deine E-Mail-Adresse. Prüfe dein Postfach.";
  }

  if (
    errorCode === "invalid_credentials" ||
    lower.includes("invalid login credentials") ||
    lower.includes("invalid credentials")
  ) {
    return "E-Mail oder Passwort ist falsch.";
  }

  if (
    errorCode === "user_already_exists" ||
    lower.includes("user already registered") ||
    lower.includes("already been registered") ||
    lower.includes("already exists")
  ) {
    return "Diese E-Mail-Adresse ist bereits registriert.";
  }

  if (
    errorCode === "email_address_invalid" ||
    lower.includes("invalid email") ||
    lower.includes("unable to validate email")
  ) {
    return "Bitte gib eine gültige E-Mail-Adresse ein.";
  }

  if (lower.includes("user not found")) {
    return "Kein Konto mit dieser E-Mail-Adresse gefunden.";
  }

  if (
    lower.includes("weak password") ||
    lower.includes("password is too weak") ||
    (lower.includes("password") && lower.includes("least"))
  ) {
    return "Das Passwort erfüllt nicht die Sicherheitsanforderungen.";
  }

  if (
    errorCode === "otp_expired" ||
    lower.includes("expired") ||
    lower.includes("link is invalid") ||
    lower.includes("token has expired")
  ) {
    return "Der Link ist abgelaufen. Bitte fordere einen neuen an.";
  }

  if (
    errorCode === "otp_invalid" ||
    lower.includes("invalid token") ||
    lower.includes("token is invalid")
  ) {
    return "Der Link ist ungültig. Bitte versuche es erneut.";
  }

  if (
    errorCode === "over_request_rate_limit" ||
    lower.includes("rate limit") ||
    lower.includes("too many requests")
  ) {
    return "Zu viele Anfragen. Bitte warte einige Minuten.";
  }

  if (
    lower.includes("network") ||
    lower.includes("fetch failed") ||
    lower.includes("failed to fetch")
  ) {
    return "Keine Internetverbindung. Bitte prüfe deine Verbindung.";
  }

  if (lower.includes("session") && lower.includes("expired")) {
    return "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.";
  }

  if (lower.includes("same password")) {
    return "Das neue Passwort muss sich vom alten unterscheiden.";
  }

  if (lower.includes("signup_disabled")) {
    return "Registrierung ist derzeit deaktiviert.";
  }

  return message || "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es erneut.";
}

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed: "Anmeldung fehlgeschlagen. Bitte versuche es erneut.",
  exchange_failed: "Sitzung konnte nicht erstellt werden.",
  missing_code: "Ungültiger Bestätigungslink.",
  no_user: "Benutzer konnte nicht gefunden werden.",
  email_not_confirmed: "E-Mail noch nicht bestätigt.",
  session_expired: "Deine Sitzung ist abgelaufen.",
};

export function getAuthErrorMessage(code: string | null, fallback?: string | null): string {
  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  if (fallback) return mapAuthError(fallback);
  return "Ein Fehler ist aufgetreten.";
}

// Re-export for backwards compatibility
export { validateEmail, validatePassword } from "./validation";
