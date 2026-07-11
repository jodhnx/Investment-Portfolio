"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usePortfolioStore } from "@/store/portfolio-store";
import type { AssetSearchResult } from "@/lib/types";
import { assetTypeLabel } from "@/hooks/use-price-updater";

interface AddAssetDialogProps {
  watchlist?: boolean;
}

export function AddAssetDialog({ watchlist = false }: AddAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AssetSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<AssetSearchResult | null>(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [broker, setBroker] = useState("");
  const addPosition = usePortfolioStore((s) => s.addPosition);
  const addPositionFromSearch = usePortfolioStore((s) => s.addPositionFromSearch);
  const addTransaction = usePortfolioStore((s) => s.addTransaction);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        setResults(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleAdd = () => {
    if (!selected) return;

    if (watchlist) {
      addPositionFromSearch(selected, true);
    } else {
      addPositionFromSearch(selected);
      const portfolio = usePortfolioStore.getState().getActivePortfolio();
      const pos = portfolio?.positions[portfolio.positions.length - 1];
      if (pos && quantity && price) {
        addTransaction(pos.id, {
          type: "BUY",
          quantity: parseFloat(quantity),
          price: parseFloat(price),
          fees: 0,
          date: new Date().toISOString(),
        });
        if (broker) {
          usePortfolioStore.getState().updatePosition(pos.id, { broker });
        }
      }
    }

    setOpen(false);
    setQuery("");
    setSelected(null);
    setQuantity("");
    setPrice("");
    setBroker("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        {watchlist ? "Zur Watchlist" : "Asset hinzufügen"}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {watchlist ? "Asset beobachten" : "Asset hinzufügen"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Bitcoin, Apple, MSCI World…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          <div className="max-h-48 space-y-1 overflow-y-auto">
            {results.map((r) => (
              <button
                key={`${r.type}-${r.id}`}
                type="button"
                className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent ${
                  selected?.id === r.id ? "bg-accent" : ""
                }`}
                onClick={() => {
                  setSelected(r);
                  if (r.currentPrice) setPrice(String(r.currentPrice));
                }}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={r.logoUrl} />
                  <AvatarFallback>{r.symbol.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.symbol}</div>
                </div>
                <Badge variant="secondary">{assetTypeLabel(r.type)}</Badge>
                {r.currentPrice && (
                  <span className="text-sm tabular-nums">
                    {r.currentPrice.toLocaleString("de-DE", {
                      style: "currency",
                      currency: r.currency ?? "EUR",
                    })}
                  </span>
                )}
              </button>
            ))}
          </div>

          {selected && !watchlist && (
            <div className="grid gap-3 border-t border-border pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Anzahl</Label>
                  <Input
                    type="number"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0.5"
                  />
                </div>
                <div>
                  <Label>Kaufpreis (€)</Label>
                  <Input
                    type="number"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Broker</Label>
                <Input
                  value={broker}
                  onChange={(e) => setBroker(e.target.value)}
                  placeholder="Trade Republic, Binance…"
                />
              </div>
            </div>
          )}

          <Button
            className="w-full"
            disabled={!selected || (!watchlist && (!quantity || !price))}
            onClick={handleAdd}
          >
            Hinzufügen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
