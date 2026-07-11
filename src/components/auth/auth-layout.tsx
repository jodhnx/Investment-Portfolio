"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2">
        <TrendingUp className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold tracking-tight">InvestTrack</span>
      </div>
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Sichere Authentifizierung mit Supabase
      </p>
    </div>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-primary hover:underline underline-offset-4"
    >
      {children}
    </Link>
  );
}
