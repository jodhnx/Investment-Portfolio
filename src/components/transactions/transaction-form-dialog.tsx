"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { usePortfolioStore } from "@/store/portfolio-store";
import { selectActivePortfolio } from "@/lib/store-selectors";
import type { TransactionType } from "@/lib/types";
import { isDividendTransaction } from "@/lib/transaction-db";
import { toast } from "sonner";

const TX_TYPES: { value: TransactionType; label: string }[] = [
  { value: "BUY", label: "Kauf" },
  { value: "SELL", label: "Verkauf" },
  { value: "DEPOSIT", label: "Einzahlung" },
  { value: "WITHDRAWAL", label: "Auszahlung" },
  { value: "DIVIDEND", label: "Dividende" },
  { value: "FEE", label: "Gebühr" },
  { value: "TAX", label: "Steuer" },
  { value: "SPLIT", label: "Split" },
  { value: "BONUS", label: "Bonusaktie" },
];

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPositionId?: string;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  defaultPositionId,
}: TransactionFormDialogProps) {
  const portfolio = usePortfolioStore(selectActivePortfolio);
  const addTransaction = usePortfolioStore((s) => s.addTransaction);
  const addDividend = usePortfolioStore((s) => s.addDividend);

  const positions = portfolio?.positions.filter((p) => !p.isWatchlist) ?? [];

  const [positionId, setPositionId] = useState(defaultPositionId ?? "");
  const [txType, setTxType] = useState<TransactionType>("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [fees, setFees] = useState("0");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setQuantity("");
    setPrice("");
    setFees("0");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const handleSubmit = async () => {
    const pid = positionId || defaultPositionId;
    if (!pid) {
      toast.error("Bitte ein Asset wählen");
      return;
    }

    const qty = parseFloat(quantity);
    const prc = parseFloat(price);
    const fee = parseFloat(fees) || 0;

    const needsAmount = txType === "FEE" || txType === "TAX" || txType === "DIVIDEND";
    if (needsAmount) {
      if (!prc && prc !== 0) {
        toast.error("Bitte Betrag eingeben");
        return;
      }
    } else if (!qty || qty <= 0 || !prc) {
      toast.error("Menge und Preis sind erforderlich");
      return;
    }

    setSaving(true);
    try {
      const isoDate = new Date(date).toISOString();

      if (isDividendTransaction(txType)) {
        addDividend(pid, {
          amount: prc,
          date: isoDate,
          notes: fee > 0 ? `Gebühren: ${fee}` : undefined,
        });
        toast.success("Dividende gespeichert");
      } else {
        addTransaction(pid, {
          type: txType,
          quantity: needsAmount ? 1 : qty,
          price: prc,
          fees: fee,
          date: isoDate,
        });
        toast.success("Transaktion gespeichert");
      }

      resetForm();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const isAmountOnly = txType === "FEE" || txType === "TAX" || txType === "DIVIDEND";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neue Transaktion</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Asset</Label>
            <Select
              value={positionId || defaultPositionId || undefined}
              onValueChange={(v) => v && setPositionId(v)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Asset wählen" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Art</Label>
            <Select value={txType} onValueChange={(v) => v && setTxType(v as TransactionType)}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TX_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!isAmountOnly && (
            <div className="space-y-2">
              <Label>Menge</Label>
              <Input
                type="number"
                step="any"
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-11"
                placeholder="0.5"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>{isAmountOnly ? "Betrag" : "Preis"}</Label>
            <Input
              type="number"
              step="any"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Gebühren</Label>
              <Input
                type="number"
                step="any"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Datum</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
              />
            </div>
          </div>
          <Button className="h-11 w-full" onClick={handleSubmit} disabled={saving || !positions.length}>
            {saving ? "Speichern…" : "Speichern"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
