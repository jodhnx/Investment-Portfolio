"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOBILE_BOTTOM_NAV, SECONDARY_NAV } from "@/config/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavContent } from "./nav-content";

export function BottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Menü schließt bei jeder Navigation automatisch
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isSecondaryActive = SECONDARY_NAV.some(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
  );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 glass pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Navigation"
    >
      <div className="flex h-[3.75rem] items-stretch px-1">
        {MOBILE_BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-[10px] transition-all duration-200 active:scale-95",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                  active && "bg-primary/12"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
              </span>
              <span className="font-medium leading-none">{label.split(" ")[0]}</span>
            </Link>
          );
        })}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-[10px] transition-all duration-200 active:scale-95",
              menuOpen || isSecondaryActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                (menuOpen || isSecondaryActive) && "bg-primary/12"
              )}
            >
              <Menu className="h-5 w-5" />
            </span>
            <span className="font-medium leading-none">Mehr</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(100vw-2rem,20rem)] border-r-0 p-0">
            <NavContent showBrand onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
