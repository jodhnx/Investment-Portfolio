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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePortfolioStore } from "@/store/portfolio-store";

interface TransactionDialogProps {
  positionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDialog({
  positionId,
  open,
  onOpenChange,
}: TransactionDialogProps) {
  const addTransaction = usePortfolioStore((s) => s.addTransaction);
  const position = usePortfolioStore((s) =>
    s.getActivePortfolio()?.positions.find((p) => p.id === positionId)
  );

  const [type, setType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [fees, setFees] = useState("0");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = () => {
    if (!quantity || !price) return;
    addTransaction(positionId, {
      type,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      fees: parseFloat(fees) || 0,
      date: new Date(date).toISOString(),
    });
    onOpenChange(false);
    setQuantity("");
    setPrice("");
    setFees("0");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Transaktion – {position?.name ?? "Position"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={type} onValueChange={(v) => setType(v as "BUY" | "SELL")}>
          <TabsList className="w-full">
            <TabsTrigger value="BUY" className="flex-1">Kauf</TabsTrigger>
            <TabsTrigger value="SELL" className="flex-1">Verkauf</TabsTrigger>
          </TabsList>
          <TabsContent value={type} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Menge</Label>
                <Input
                  type="number"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div>
                <Label>Preis (€)</Label>
                <Input
                  type="number"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Gebühren (€)</Label>
                <Input
                  type="number"
                  step="any"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                />
              </div>
              <div>
                <Label>Datum</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <Button className="w-full" onClick={handleSubmit}>
              {type === "BUY" ? "Kauf speichern" : "Verkauf speichern"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
