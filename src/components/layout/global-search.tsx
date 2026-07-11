"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Layers, ArrowLeftRight, Tag, Building2, LayoutGrid } from "lucide-react";
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
import { getAssetMeta } from "@/lib/asset-meta";

const TX_LABELS: Record<string, string> = {
  BUY: "Kauf",
  SELL: "Verkauf",
  DEPOSIT: "Einzahlung",
  WITHDRAWAL: "Auszahlung",
  DIVIDEND: "Dividende",
  FEE: "Gebühr",
  TAX: "Steuer",
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
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
      setQuery("");
      router.push(path);
    },
    [router]
  );

  const q = query.trim().toLowerCase();

  const filteredNav = useMemo(
    () => MAIN_NAV.filter((item) => !q || item.label.toLowerCase().includes(q)),
    [q]
  );

  const positions = useMemo(
    () => portfolio?.positions.filter((p) => !p.isWatchlist) ?? [],
    [portfolio?.positions]
  );

  const filteredAssets = useMemo(() => {
    if (!q) return positions.slice(0, 15);
    return positions
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.symbol.toLowerCase().includes(q) ||
          getAssetMeta(p.notes).customCategory?.toLowerCase().includes(q)
      )
      .slice(0, 15);
  }, [positions, q]);

  const filteredTransactions = useMemo(() => {
    const all = positions.flatMap((p) =>
      p.transactions.map((t) => ({
        ...t,
        assetName: p.name,
        symbol: p.symbol,
      }))
    );
    if (!q) return all.slice(0, 15);
    return all
      .filter(
        (t) =>
          t.assetName.toLowerCase().includes(q) ||
          t.symbol.toLowerCase().includes(q) ||
          (TX_LABELS[t.type] ?? t.type).toLowerCase().includes(q)
      )
      .slice(0, 15);
  }, [positions, q]);

  const filteredCategories = useMemo(() => {
    const cats = portfolio?.categories ?? [];
    if (!q) return cats;
    return cats.filter((c) => c.name.toLowerCase().includes(q));
  }, [portfolio?.categories, q]);

  const filteredBrokers = useMemo(() => {
    const brokers = new Set<string>();
    for (const p of positions) {
      if (p.broker?.trim()) brokers.add(p.broker.trim());
    }
    const list = Array.from(brokers);
    if (!q) return list.slice(0, 10);
    return list.filter((b) => b.toLowerCase().includes(q)).slice(0, 10);
  }, [positions, q]);

  const hasResults =
    filteredNav.length > 0 ||
    filteredAssets.length > 0 ||
    filteredTransactions.length > 0 ||
    filteredCategories.length > 0 ||
    filteredBrokers.length > 0;

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

      <CommandDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setQuery("");
        }}
        title="Globale Suche"
        description="Assets, Transaktionen, Broker und Seiten durchsuchen"
      >
        <CommandInput
          placeholder="Assets, Transaktionen, Broker…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {!hasResults && <CommandEmpty>Keine Ergebnisse.</CommandEmpty>}
          {filteredNav.length > 0 && (
            <CommandGroup heading="Seiten">
              {filteredNav.map((item) => (
                <CommandItem key={item.href} value={`page-${item.href}`} onSelect={() => go(item.href)}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {filteredAssets.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Assets">
                {filteredAssets.map((p) => (
                  <CommandItem key={p.id} value={`asset-${p.id}`} onSelect={() => go(`/assets/${p.id}`)}>
                    <Layers className="mr-2 h-4 w-4" />
                    <span>{p.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{p.symbol}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          {filteredTransactions.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Transaktionen">
                {filteredTransactions.map((t) => (
                  <CommandItem key={t.id} value={`tx-${t.id}`} onSelect={() => go("/transactions")}>
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    {TX_LABELS[t.type] ?? t.type} · {t.assetName}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          {filteredCategories.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Kategorien">
                {filteredCategories.map((c) => (
                  <CommandItem key={c.id} value={`cat-${c.id}`} onSelect={() => go("/assets")}>
                    <Tag className="mr-2 h-4 w-4" />
                    {c.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          {filteredBrokers.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Broker">
                {filteredBrokers.map((b) => (
                  <CommandItem key={b} value={`broker-${b}`} onSelect={() => go("/assets")}>
                    <Building2 className="mr-2 h-4 w-4" />
                    {b}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          {!q && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Schnellzugriff">
                <CommandItem value="quick-dashboard" onSelect={() => go("/")}>
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Dashboard
                </CommandItem>
                <CommandItem value="quick-performance" onSelect={() => go("/performance")}>
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Performance
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
