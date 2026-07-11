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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Navigation"
    >
      <div className="flex h-14 items-stretch">
        {MOBILE_BOTTOM_NAV.slice(0, 4).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px]",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label.split(" ")[0]}</span>
            </Link>
          );
        })}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] text-muted-foreground">
            <Menu className="h-5 w-5" />
            <span>Mehr</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <NavContent onNavigate={() => setMenuOpen(false)} showBrand />
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
