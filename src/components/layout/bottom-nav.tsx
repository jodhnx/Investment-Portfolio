"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOBILE_BOTTOM_NAV } from "@/config/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavContent } from "./nav-content";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Navigation"
    >
      <div className="flex h-14 items-stretch">
        {MOBILE_BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {active && (
                <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary" />
              )}
              <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
              <span className="font-medium">{label.split(" ")[0]}</span>
            </Link>
          );
        })}
        <Sheet>
          <SheetTrigger className="relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] text-muted-foreground">
            <Menu className="h-5 w-5" />
            <span className="font-medium">Mehr</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <NavContent showBrand />
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
