"use client";

import { getPasswordStrength } from "@/lib/auth/validation";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const items = [
    { key: "length", label: "Min. 8 Zeichen", ok: strength.checks.length },
    { key: "upper", label: "Großbuchstabe", ok: strength.checks.uppercase },
    { key: "lower", label: "Kleinbuchstabe", ok: strength.checks.lowercase },
    { key: "num", label: "Zahl", ok: strength.checks.number },
    { key: "special", label: "Sonderzeichen", ok: strength.checks.special },
  ];

  return (
    <div className="space-y-2 animate-in fade-in duration-300">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              level <= strength.score ? strength.color : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Passwortstärke: <span className="font-medium text-foreground">{strength.label}</span>
      </p>
      <ul className="grid grid-cols-2 gap-1">
        {items.map(({ key, label, ok }) => (
          <li key={key} className="flex items-center gap-1 text-xs">
            {ok ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground" />
            )}
            <span className={ok ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
