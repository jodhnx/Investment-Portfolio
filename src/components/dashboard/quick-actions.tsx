"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Layers, ArrowLeftRight, Calculator, Eye, Settings, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomAssetDialog } from "@/components/assets/custom-asset-dialog";

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
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Schnellzugriff</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="h-11 w-full gap-2" size="lg" onClick={() => setAssetOpen(true)}>
          <Plus className="h-4 w-4" />
          Neues Asset anlegen
        </Button>
        <CustomAssetDialog open={assetOpen} onOpenChange={setAssetOpen} hideTrigger />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {links.map(({ href, label, icon: Icon }) => (
            <Button key={href} variant="outline" className="h-11 gap-2" render={<Link href={href} />}>
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
