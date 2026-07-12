"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Undo2, Redo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, SECONDARY_NAV } from "@/config/navigation";
import { AppLogo } from "@/components/brand/app-logo";
import { PortfolioSwitcher } from "@/components/portfolio/portfolio-switcher";
import { usePortfolioStore } from "@/store/portfolio-store";
import { Button } from "@/components/ui/button";

interface NavContentProps {
  onNavigate?: () => void;
  showBrand?: boolean;
}

export function NavContent({ onNavigate, showBrand = true }: NavContentProps) {
  const pathname = usePathname();
  const undo = usePortfolioStore((s) => s.undo);
  const redo = usePortfolioStore((s) => s.redo);

  const linkClass = (href: string) => {
    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
    return cn(
      "flex h-10 items-center gap-2.5 rounded-xl px-3 text-sm transition-colors",
      active
        ? "bg-primary/10 font-medium text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );
  };

  return (
    <div className="flex h-full flex-col">
      {showBrand && (
        <div className="border-b border-border px-4 py-4">
          <AppLogo size="sm" />
        </div>
      )}

      <div className="border-b border-border p-3">
        <PortfolioSwitcher />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {PRIMARY_NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} onClick={onNavigate} className={linkClass(href)}>
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}

        <div className="pt-4">
          <p className="px-3 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Mehr
          </p>
          {SECONDARY_NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={onNavigate} className={linkClass(href)}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="border-t border-border p-2">
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-9 flex-1" onClick={undo}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-9 flex-1" onClick={redo}>
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
