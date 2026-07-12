"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Layers, ArrowLeftRight, Eye, Landmark, Calculator, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomAssetDialog } from "@/components/assets/custom-asset-dialog";
import { cn } from "@/lib/utils";

const links = [
  { href: "/assets", label: "Assets", icon: Layers },
  { href: "/transactions", label: "Transaktion", icon: ArrowLeftRight },
  { href: "/watchlist", label: "Watchlist", icon: Eye },
  { href: "/capital", label: "Kapital", icon: Landmark },
  { href: "/calculators", label: "Rechner", icon: Calculator },
  { href: "/settings", label: "Einstellungen", icon: Settings },
];

export function QuickActions() {
  const [assetOpen, setAssetOpen] = useState(false);

  return (
    <div className="premium-card p-5">
      <p className="mb-4 text-sm font-medium text-muted-foreground">Schnellzugriff</p>
      <Button
        className="mb-4 h-12 w-full rounded-2xl text-base font-medium"
        size="lg"
        onClick={() => setAssetOpen(true)}
      >
        <Plus className="mr-2 h-5 w-5" />
        Asset hinzufügen
      </Button>
      <CustomAssetDialog open={assetOpen} onOpenChange={setAssetOpen} hideTrigger />
      <div className="grid grid-cols-3 gap-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-muted/30 px-2 py-3",
              "text-center text-xs font-medium text-muted-foreground transition-all duration-200",
              "hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
