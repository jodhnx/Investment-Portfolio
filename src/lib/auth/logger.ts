import type { AuthError } from "@supabase/supabase-js";

export function logAuthDebug(context: string, detail: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[Auth:${context}]`, detail);
  }
}

export function logAuthError(context: string, error: unknown): void {
  if (error && typeof error === "object" && "message" in error) {
    const authError = error as AuthError;
    console.error(`[Auth:${context}]`, {
      message: authError.message,
      code: authError.code,
      status: authError.status,
    });
  } else {
    console.error(`[Auth:${context}]`, error);
  }
}

export function getAuthErrorDetails(error: unknown): {
  message: string;
  code?: string;
  status?: number;
} {
  if (error && typeof error === "object" && "message" in error) {
    const e = error as AuthError;
    return { message: e.message, code: e.code, status: e.status };
  }
  return { message: String(error) };
}
