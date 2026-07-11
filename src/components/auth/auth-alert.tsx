"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthAlert({
  variant = "error",
  message,
  className,
}: {
  variant?: "error" | "success";
  message: string;
  className?: string;
}) {
  const Icon = variant === "error" ? AlertCircle : CheckCircle2;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-lg border p-3 text-sm animate-in fade-in slide-in-from-top-1 duration-300",
        variant === "error"
          ? "border-destructive/50 bg-destructive/10 text-destructive"
          : "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400",
        className
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
