"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { PORTFOLIO_COLORS, PORTFOLIO_ICONS, PORTFOLIO_PRESETS } from "@/config/portfolio-icons";
import type { Currency, Portfolio, PortfolioInput } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PortfolioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolio?: Portfolio | null;
  onSubmit: (input: PortfolioInput) => void;
}

export function PortfolioFormDialog({
  open,
  onOpenChange,
  portfolio,
  onSubmit,
}: PortfolioFormDialogProps) {
  const isEdit = Boolean(portfolio);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [color, setColor] = useState(PORTFOLIO_COLORS[0]);
  const [icon, setIcon] = useState("Briefcase");
  const [startCapital, setStartCapital] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(portfolio?.name ?? "");
    setDescription(portfolio?.description ?? "");
    setCurrency(portfolio?.currency ?? "EUR");
    setColor(portfolio?.color ?? PORTFOLIO_COLORS[0]);
    setIcon(portfolio?.icon ?? "Briefcase");
    setStartCapital("");
  }, [open, portfolio]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      currency,
      color,
      icon,
      startCapital: !isEdit && startCapital ? Number(startCapital) : undefined,
    });
    onOpenChange(false);
  };

  const applyPreset = (preset: (typeof PORTFOLIO_PRESETS)[number]) => {
    setName(preset.name);
    setIcon(preset.icon);
    setColor(preset.color);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Portfolio bearbeiten" : "Neues Portfolio"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <div className="flex flex-wrap gap-1.5">
              {PORTFOLIO_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="pf-name">Name</Label>
            <Input
              id="pf-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z. B. Krypto Portfolio"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf-desc">Beschreibung (optional)</Label>
            <Textarea
              id="pf-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kurze Beschreibung…"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Währung</Label>
              <Select value={currency} onValueChange={(v) => v && setCurrency(v as Currency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="pf-capital">Startkapital</Label>
                <Input
                  id="pf-capital"
                  type="number"
                  min="0"
                  step="0.01"
                  value={startCapital}
                  onChange={(e) => setStartCapital(e.target.value)}
                  placeholder="0,00"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Farbe</Label>
            <div className="flex flex-wrap gap-2">
              {PORTFOLIO_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-7 w-7 rounded-full ring-offset-background transition-transform hover:scale-110",
                    color === c && "ring-2 ring-primary ring-offset-2"
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Farbe ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PORTFOLIO_ICONS).map(([key, Icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIcon(key)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors",
                    icon === key && "border-primary bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit">{isEdit ? "Speichern" : "Erstellen"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
