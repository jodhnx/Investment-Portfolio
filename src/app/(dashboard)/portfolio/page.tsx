"use client";

import { PortfolioTable } from "@/components/portfolio/portfolio-table";

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Portfolio</h2>
        <p className="text-sm text-muted-foreground">
          Excel-ähnliche Tabelle mit Sortierung, Filter und verschiebbaren Spalten
        </p>
      </div>
      <PortfolioTable />
    </div>
  );
}
