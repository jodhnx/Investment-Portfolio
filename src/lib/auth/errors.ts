/** Deutsche Fehlermeldungen für Supabase Auth */
export function mapAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return "E-Mail oder Passwort ist falsch.";
  }
  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return "Diese E-Mail-Adresse ist bereits registriert.";
  }
  if (lower.includes("invalid email") || lower.includes("unable to validate email")) {
    return "Bitte gib eine gültige E-Mail-Adresse ein.";
  }
  if (lower.includes("password") && lower.includes("least")) {
    return "Das Passwort muss mindestens 8 Zeichen lang sein.";
  }
  if (lower.includes("weak password") || lower.includes("password is too weak")) {
    return "Das Passwort ist zu schwach. Verwende Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen.";
  }
  if (lower.includes("email not confirmed")) {
    return "Bitte bestätige zuerst deine E-Mail-Adresse.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Zu viele Anfragen. Bitte warte einen Moment.";
  }
  if (lower.includes("network") || lower.includes("fetch failed") || lower.includes("failed to fetch")) {
    return "Keine Internetverbindung. Bitte prüfe deine Verbindung.";
  }
  if (lower.includes("session") && lower.includes("expired")) {
    return "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.";
  }
  if (lower.includes("same password")) {
    return "Das neue Passwort muss sich vom alten unterscheiden.";
  }

  return message || "Ein unbekannter Fehler ist aufgetreten.";
}

export function validateEmail(email: string): string | null {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return "E-Mail ist erforderlich.";
  if (!re.test(email)) return "Ungültige E-Mail-Adresse.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Passwort ist erforderlich.";
  if (password.length < 8) return "Passwort muss mindestens 8 Zeichen lang sein.";
  if (!/[A-Z]/.test(password)) return "Passwort muss mindestens einen Großbuchstaben enthalten.";
  if (!/[0-9]/.test(password)) return "Passwort muss mindestens eine Zahl enthalten.";
  return null;
}
