"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOBILE_BOTTOM_NAV } from "@/config/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavContent } from "./nav-content";

export function BottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Hauptnavigation"
    >
      <div className="flex h-16 items-stretch justify-around px-1">
        {MOBILE_BOTTOM_NAV.slice(0, 4).map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "scale-110")} />
              <span className="truncate">{label.split(" ")[0]}</span>
            </Link>
          );
        })}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium text-muted-foreground"
            aria-label="Menü öffnen"
          >
            <Menu className="h-5 w-5" />
            <span>Mehr</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(100vw-2rem,20rem)] p-0">
            <NavContent onNavigate={() => setMenuOpen(false)} showBrand />
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
