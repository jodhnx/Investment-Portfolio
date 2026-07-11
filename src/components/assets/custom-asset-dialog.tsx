"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Plus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePortfolioStore } from "@/store/portfolio-store";
import { selectActivePortfolio } from "@/lib/store-selectors";
import { serializePositionNotes, SUGGESTED_CATEGORIES } from "@/lib/asset-meta";
import type { AssetType, Currency } from "@/lib/types";
import { toast } from "sonner";

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#ef4444", "#14b8a6", "#f97316", "#64748b",
];

interface CustomAssetDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function CustomAssetDialog({ open: controlledOpen, onOpenChange, hideTrigger }: CustomAssetDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const portfolio = usePortfolioStore(selectActivePortfolio);
  const addPosition = usePortfolioStore((s) => s.addPosition);
  const addTransaction = usePortfolioStore((s) => s.addTransaction);
  const addCategory = usePortfolioStore((s) => s.addCategory);

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [buyPrice, setBuyPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [broker, setBroker] = useState("");
  const [fees, setFees] = useState("0");
  const [taxes, setTaxes] = useState("0");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const reset = () => {
    setName("");
    setSymbol("");
    setCategory("");
    setSubcategory("");
    setBuyPrice("");
    setCurrentPrice("");
    setQuantity("");
    setBroker("");
    setFees("0");
    setTaxes("0");
    setNotes("");
    setIcon("");
    setImageUrl("");
  };

  const handleSubmit = () => {
    if (!name.trim() || !symbol.trim()) {
      toast.error("Name und Symbol sind erforderlich");
      return;
    }

    const now = new Date().toISOString();
    const positionId = uuidv4();
    let categoryId: string | undefined;

    if (category.trim()) {
      const existing = portfolio?.categories.find(
        (c) => c.name.toLowerCase() === category.trim().toLowerCase()
      );
      if (existing) {
        categoryId = existing.id;
      } else {
        addCategory({ name: category.trim(), color });
        const fresh = usePortfolioStore.getState().getActivePortfolio()?.categories.find(
          (c) => c.name.toLowerCase() === category.trim().toLowerCase()
        );
        categoryId = fresh?.id;
      }
    }

    const notesPayload = serializePositionNotes(
      {
        customCategory: category.trim() || undefined,
        subcategory: subcategory.trim() || undefined,
        icon: icon.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        currency,
      },
      notes
    );

    addPosition({
      id: positionId,
      name: name.trim(),
      symbol: symbol.trim().toUpperCase(),
      type: "OTHER" as AssetType,
      broker: broker.trim() || undefined,
      logoUrl: imageUrl.trim() || undefined,
      notes: notesPayload,
      color,
      categoryId,
      currentPrice: currentPrice ? parseFloat(currentPrice) : buyPrice ? parseFloat(buyPrice) : undefined,
      transactions: [],
      dividends: [],
      priceAlerts: [],
      isWatchlist: false,
      createdAt: now,
      updatedAt: now,
    });

    if (quantity && buyPrice) {
      addTransaction(positionId, {
        type: "BUY",
        quantity: parseFloat(quantity),
        price: parseFloat(buyPrice),
        fees: parseFloat(fees) || 0,
        date: new Date(purchaseDate).toISOString(),
        notes: taxes && parseFloat(taxes) > 0 ? JSON.stringify({ taxes: parseFloat(taxes) }) : undefined,
      });
    }

    toast.success(`${name} wurde angelegt`);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Asset anlegen
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Eigenes Asset anlegen</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bitcoin, Rolex…" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Symbol *</Label>
              <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="BTC, AAPL…" className="h-11" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Crypto, Immobilien…"
                list="category-suggestions"
                className="h-11"
              />
              <datalist id="category-suggestions">
                {SUGGESTED_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label>Unterkategorie</Label>
              <Input value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className="h-11" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Währung</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Broker</Label>
              <Input value={broker} onChange={(e) => setBroker(e.target.value)} className="h-11" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Kaufkurs</Label>
              <Input type="number" step="any" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Aktueller Kurs</Label>
              <Input type="number" step="any" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} className="h-11" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Anzahl</Label>
              <Input type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Kaufdatum</Label>
              <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="h-11" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Gebühren</Label>
              <Input type="number" step="any" value={fees} onChange={(e) => setFees(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Steuern</Label>
              <Input type="number" step="any" value={taxes} onChange={(e) => setTaxes(e.target.value)} className="h-11" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Farbe</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="h-9 w-9 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: c, borderColor: color === c ? "white" : "transparent" }}
                  onClick={() => setColor(c)}
                  aria-label={`Farbe ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Icon (Emoji)</Label>
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🪙" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Bild-URL</Label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" className="h-11" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notizen</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <Button className="h-11 w-full" onClick={handleSubmit}>
            Asset speichern
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
