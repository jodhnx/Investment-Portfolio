"use client";

import { useMemo, useState } from "react";
import { Plus, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePortfolioStore } from "@/store/portfolio-store";
import { selectActivePortfolio } from "@/lib/store-selectors";
import { computeCashFlowStats } from "@/lib/cash-flow-calculations";
import { formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

export default function CapitalPage() {
  const portfolio = usePortfolioStore(selectActivePortfolio);
  const addCashFlow = usePortfolioStore((s) => s.addCashFlow);
  const deleteCashFlow = usePortfolioStore((s) => s.deleteCashFlow);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"DEPOSIT" | "WITHDRAWAL">("DEPOSIT");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const stats = useMemo(
    () => (portfolio ? computeCashFlowStats(portfolio) : null),
    [portfolio]
  );

  const flows = portfolio?.cashFlows ?? [];

  const handleAdd = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Bitte gültigen Betrag eingeben");
      return;
    }
    addCashFlow({
      type,
      amount: amt,
      date: new Date(date).toISOString(),
      category: category.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    toast.success(type === "DEPOSIT" ? "Einzahlung gespeichert" : "Auszahlung gespeichert");
    setOpen(false);
    setAmount("");
    setCategory("");
    setNotes("");
  };

  if (!portfolio) {
    return (
      <div className="py-16 text-center">
        <Link href="/onboarding" className="text-primary hover:underline">Onboarding starten</Link>
      </div>
    );
  }

  const kpis = stats
    ? [
        { label: "Gesamt eingezahlt", value: stats.totalDeposits, icon: ArrowDownCircle },
        { label: "Gesamt ausgezahlt", value: stats.totalWithdrawals, icon: ArrowUpCircle },
        { label: "Freies Kapital", value: stats.availableCapital },
        { label: "Investiert", value: stats.investedCapital },
        { label: "Nicht investiert", value: stats.uninvestedCapital },
        { label: "Gesamtportfolio", value: stats.totalPortfolio },
      ]
    : [];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kapital</h2>
          <p className="text-sm text-muted-foreground">
            Einzahlungen, Auszahlungen und Kapitalübersicht
          </p>
        </div>
        <Button className="h-11 gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Ein-/Auszahlung
        </Button>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        {kpis.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-border/60 bg-card/80">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{label}</p>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
              </div>
              <p className="mt-1 text-lg font-bold tabular-nums">
                {formatCurrency(value, portfolio.currency)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Kapitalbewegungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3">Datum</th>
                  <th className="py-2 pr-3">Typ</th>
                  <th className="py-2 pr-3">Betrag</th>
                  <th className="py-2 pr-3">Kategorie</th>
                  <th className="py-2 pr-3">Notiz</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {flows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Noch keine Ein- oder Auszahlungen
                    </td>
                  </tr>
                ) : (
                  [...flows]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((f) => (
                      <tr key={f.id} className="border-b border-border/50">
                        <td className="py-2.5 pr-3">
                          {format(new Date(f.date), "dd.MM.yyyy", { locale: de })}
                        </td>
                        <td className="py-2.5 pr-3">
                          <Badge variant={f.type === "DEPOSIT" ? "default" : "secondary"}>
                            {f.type === "DEPOSIT" ? "Einzahlung" : "Auszahlung"}
                          </Badge>
                        </td>
                        <td
                          className={cn(
                            "py-2.5 pr-3 tabular-nums font-medium",
                            f.type === "DEPOSIT" ? "text-emerald-500" : "text-red-500"
                          )}
                        >
                          {f.type === "DEPOSIT" ? "+" : "−"}
                          {formatCurrency(f.amount, portfolio.currency)}
                        </td>
                        <td className="py-2.5 pr-3">{f.category ?? "—"}</td>
                        <td className="max-w-[140px] truncate py-2.5 pr-3 text-muted-foreground">
                          {f.notes ?? "—"}
                        </td>
                        <td className="py-2.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => {
                              deleteCashFlow(f.id);
                              toast.success("Eintrag gelöscht");
                            }}
                          >
                            Löschen
                          </Button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ein- oder Auszahlung</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Typ</Label>
              <Select value={type} onValueChange={(v) => v && setType(v as typeof type)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEPOSIT">Einzahlung</SelectItem>
                  <SelectItem value="WITHDRAWAL">Auszahlung</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Betrag</Label>
              <Input type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Gehalt, Sparplan…" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Datum</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Notiz</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} className="h-11" />
            </div>
            <Button className="h-11 w-full" onClick={handleAdd}>
              Speichern
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
