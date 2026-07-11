"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Layers, ArrowLeftRight, Tag } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { usePortfolioStore } from "@/store/portfolio-store";
import { selectActivePortfolio } from "@/lib/store-selectors";
import { MAIN_NAV } from "@/config/navigation";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const portfolio = usePortfolioStore(selectActivePortfolio);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router]
  );

  const positions = portfolio?.positions.filter((p) => !p.isWatchlist) ?? [];
  const allTransactions = positions.flatMap((p) =>
    p.transactions.map((t) => ({ ...t, assetName: p.name, assetId: p.id }))
  );

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden h-9 gap-2 text-muted-foreground sm:flex"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="text-xs">Suchen…</span>
        <kbd className="pointer-events-none ml-2 hidden rounded border bg-muted px-1.5 font-mono text-[10px] lg:inline">
          ⌘K
        </kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 sm:hidden"
        onClick={() => setOpen(true)}
        aria-label="Suche"
      >
        <Search className="h-4 w-4" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Globale Suche">
        <CommandInput placeholder="Assets, Transaktionen, Seiten…" />
        <CommandList>
          <CommandEmpty>Keine Ergebnisse.</CommandEmpty>
          <CommandGroup heading="Seiten">
            {MAIN_NAV.map((item) => (
              <CommandItem key={item.href} onSelect={() => go(item.href)}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
          {positions.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Assets">
                {positions.map((p) => (
                  <CommandItem key={p.id} onSelect={() => go("/assets")}>
                    <Layers className="mr-2 h-4 w-4" />
                    <span>{p.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{p.symbol}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          {allTransactions.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Transaktionen">
                {allTransactions.slice(0, 20).map((t) => (
                  <CommandItem key={t.id} onSelect={() => go("/transactions")}>
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    {t.type} · {t.assetName}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          {portfolio?.categories.map((c) => (
            <CommandItem key={c.id} onSelect={() => go("/assets")}>
              <Tag className="mr-2 h-4 w-4" />
              Kategorie: {c.name}
            </CommandItem>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
