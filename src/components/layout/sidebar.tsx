"use client";

import { NavContent } from "./nav-content";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <NavContent />
    </aside>
  );
}
