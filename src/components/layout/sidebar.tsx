"use client";

import { NavContent } from "./nav-content";

export function Sidebar() {
  return (
    <aside className="hidden w-[17.5rem] shrink-0 border-r border-border/50 bg-sidebar md:flex">
      <NavContent />
    </aside>
  );
}
