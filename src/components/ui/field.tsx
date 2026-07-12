"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FieldProps {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, error, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface FloatingFieldProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
}

export function FloatingField({ label, error, className, id, ...props }: FloatingFieldProps) {
  const inputId = id ?? React.useId();
  return (
    <div className="relative">
      <input
        id={inputId}
        placeholder=" "
        className={cn(
          "peer h-12 w-full rounded-2xl border border-input bg-background/50 px-4 pt-5 pb-2 text-base outline-none transition-all",
          "placeholder-transparent focus:border-primary focus:ring-2 focus:ring-primary/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus:border-destructive focus:ring-destructive/20",
          className
        )}
        {...props}
      />
      <label
        htmlFor={inputId}
        className={cn(
          "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground transition-all",
          "peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-primary",
          "peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
        )}
      >
        {label}
      </label>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
