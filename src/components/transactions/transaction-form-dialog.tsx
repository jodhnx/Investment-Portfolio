"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import type { TransactionType } from "@/lib/types";
import { isDividendTransaction } from "@/lib/transaction-db";
import type { EnrichedAssetTransactionRow } from "@/lib/asset-calculations";
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
  editRow?: EnrichedAssetTransactionRow | null;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  defaultPositionId,
  editRow,
}: TransactionFormDialogProps) {
  const portfolio = usePortfolioStore(selectActivePortfolio);
  const addTransaction = usePortfolioStore((s) => s.addTransaction);
  const updateTransaction = usePortfolioStore((s) => s.updateTransaction);
  const addDividend = usePortfolioStore((s) => s.addDividend);
  const updateDividend = usePortfolioStore((s) => s.updateDividend);

  const positions = portfolio?.positions.filter((p) => !p.isWatchlist) ?? [];
  const isEdit = Boolean(editRow);

  const [positionId, setPositionId] = useState(defaultPositionId ?? "");
  const [txType, setTxType] = useState<TransactionType>("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [fees, setFees] = useState("0");
  const [taxes, setTaxes] = useState("0");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (editRow) {
      setPositionId(defaultPositionId ?? "");
      if (editRow.source === "dividend") {
        setTxType("DIVIDEND");
        setQuantity("");
        setPrice(String(editRow.gross));
        setFees("0");
        setTaxes("0");
      } else {
        setTxType(editRow.type as TransactionType);
        setQuantity(String(editRow.quantity));
        setPrice(String(editRow.price));
        setFees(String(editRow.fees));
        setTaxes(String(editRow.taxes));
      }
      setDate(new Date(editRow.date).toISOString().split("T")[0]);
      setNotes(editRow.notes ?? "");
      return;
    }

    if (defaultPositionId) setPositionId(defaultPositionId);
    setTxType("BUY");
    setQuantity("");
    setPrice("");
    setFees("0");
    setTaxes("0");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  }, [open, defaultPositionId, editRow]);

  const handleSubmit = async () => {
    const pid = positionId || defaultPositionId;
    if (!pid) {
      toast.error("Bitte ein Asset wählen");
      return;
    }

    const qty = parseFloat(quantity);
    const prc = parseFloat(price);
    const fee = parseFloat(fees) || 0;
    const tax = parseFloat(taxes) || 0;

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

      if (isEdit && editRow) {
        if (editRow.source === "dividend") {
          updateDividend(pid, editRow.id, {
            amount: prc,
            date: isoDate,
            notes: notes || undefined,
          });
          toast.success("Dividende aktualisiert");
        } else {
          updateTransaction(pid, editRow.id, {
            type: txType,
            quantity: needsAmount ? 1 : qty,
            price: prc,
            fees: fee,
            taxes: tax,
            date: isoDate,
            notes: notes || undefined,
          });
          toast.success("Transaktion aktualisiert");
        }
      } else if (isDividendTransaction(txType)) {
        addDividend(pid, {
          amount: prc,
          date: isoDate,
          notes: notes || (fee > 0 ? `Gebühren: ${fee}` : undefined),
        });
        toast.success("Dividende gespeichert");
      } else {
        addTransaction(pid, {
          type: txType,
          quantity: needsAmount ? 1 : qty,
          price: prc,
          fees: fee,
          taxes: tax,
          date: isoDate,
          notes: notes || undefined,
        });
        toast.success("Transaktion gespeichert");
      }

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
          <DialogTitle>{isEdit ? "Transaktion bearbeiten" : "Neue Transaktion"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {!defaultPositionId && (
            <div className="space-y-2">
              <Label>Asset</Label>
              <Select
                value={positionId || undefined}
                onValueChange={(v) => v && setPositionId(v)}
                disabled={isEdit}
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
          )}
          <div className="space-y-2">
            <Label>Art</Label>
            <Select
              value={txType}
              onValueChange={(v) => v && setTxType(v as TransactionType)}
              disabled={isEdit && editRow?.source === "dividend"}
            >
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
              <Label>Steuer</Label>
              <Input
                type="number"
                step="any"
                value={taxes}
                onChange={(e) => setTaxes(e.target.value)}
                className="h-11"
                disabled={isEdit && editRow?.source === "dividend"}
              />
            </div>
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
          <div className="space-y-2">
            <Label>Notiz</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional"
            />
          </div>
          <Button className="h-11 w-full" onClick={handleSubmit} disabled={saving || !positions.length}>
            {saving ? "Speichern…" : isEdit ? "Aktualisieren" : "Speichern"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
