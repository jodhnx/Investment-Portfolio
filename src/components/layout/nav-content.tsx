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

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn("nav-item", active ? "nav-item-active" : "nav-item-idle")}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      )}
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} />
      {label}
    </Link>
  );
}

export function NavContent({ onNavigate, showBrand = true }: NavContentProps) {
  const pathname = usePathname();
  const undo = usePortfolioStore((s) => s.undo);
  const redo = usePortfolioStore((s) => s.redo);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {showBrand && (
        <div className="border-b border-sidebar-border px-5 py-5">
          <AppLogo size="sm" />
        </div>
      )}

      <div className="border-b border-sidebar-border p-4">
        <PortfolioSwitcher />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {PRIMARY_NAV.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={isActive(item.href)}
            onNavigate={onNavigate}
          />
        ))}

        <div className="pt-5">
          <p className="mb-2 px-3.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Mehr
          </p>
          <div className="space-y-1">
            {SECONDARY_NAV.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={isActive(item.href)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-10 flex-1 rounded-xl" onClick={undo}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-10 flex-1 rounded-xl" onClick={redo}>
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
