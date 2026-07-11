export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export function getPasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const passed = Object.values(checks).filter(Boolean).length;

  if (passed <= 2) return { score: 1, label: "Schwach", color: "bg-red-500", checks };
  if (passed <= 3) return { score: 2, label: "Mittel", color: "bg-yellow-500", checks };
  if (passed <= 4) return { score: 3, label: "Gut", color: "bg-blue-500", checks };
  return { score: 4, label: "Stark", color: "bg-green-500", checks };
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface FieldErrors {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function validateRegisterForm(data: RegisterFormData): FieldErrors {
  const errors: FieldErrors = {};

  if (!data.firstName.trim()) errors.firstName = "Vorname ist erforderlich.";
  if (!data.lastName.trim()) errors.lastName = "Nachname ist erforderlich.";

  if (data.username.trim()) {
    if (data.username.length < 3) errors.username = "Mindestens 3 Zeichen.";
    if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.username = "Nur Buchstaben, Zahlen und Unterstriche.";
    }
  }

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;

  const pwErr = validatePassword(data.password);
  if (pwErr) errors.password = pwErr;

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwörter stimmen nicht überein.";
  }

  return errors;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "E-Mail ist erforderlich.";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(trimmed)) return "Ungültige E-Mail-Adresse.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Passwort ist erforderlich.";
  if (password.length < 8) return "Mindestens 8 Zeichen erforderlich.";
  if (!/[A-Z]/.test(password)) return "Mindestens ein Großbuchstabe erforderlich.";
  if (!/[a-z]/.test(password)) return "Mindestens ein Kleinbuchstabe erforderlich.";
  if (!/[0-9]/.test(password)) return "Mindestens eine Zahl erforderlich.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Mindestens ein Sonderzeichen erforderlich.";
  return null;
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
