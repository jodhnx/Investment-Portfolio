"use client";

import { AppLogo } from "@/components/brand/app-logo";
import { APP_TAGLINE } from "@/config/brand";
import Link from "next/link";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="mb-12 flex flex-col items-center gap-3">
        <AppLogo size="lg" />
        <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
      </div>
      <div className="premium-card w-full max-w-md space-y-6 p-8">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {children}
      </div>
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
    <Link href={href} className="text-sm font-medium text-primary hover:underline">
      {children}
    </Link>
  );
}
