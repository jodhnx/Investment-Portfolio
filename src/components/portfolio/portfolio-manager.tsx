"use client";

import { useState } from "react";
import {
  Archive,
  Copy,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { getPortfolioIcon } from "@/config/portfolio-icons";
import { PortfolioFormDialog } from "./portfolio-form-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { Portfolio, PortfolioInput } from "@/lib/types";

interface PortfolioManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PortfolioManager({ open, onOpenChange }: PortfolioManagerProps) {
  const portfolios = usePortfolioStore((s) => s.portfolios);
  const updatePortfolio = usePortfolioStore((s) => s.updatePortfolio);
  const deletePortfolio = usePortfolioStore((s) => s.deletePortfolio);
  const duplicatePortfolio = usePortfolioStore((s) => s.duplicatePortfolio);
  const archivePortfolio = usePortfolioStore((s) => s.archivePortfolio);
  const setDefaultPortfolio = usePortfolioStore((s) => s.setDefaultPortfolio);

  const [editTarget, setEditTarget] = useState<Portfolio | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const visible = portfolios.filter((p) => showArchived || !p.archived);

  const handleEdit = (input: PortfolioInput) => {
    if (!editTarget) return;
    updatePortfolio(editTarget.id, input);
    setEditTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deletePortfolio(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Portfolios verwalten</DialogTitle>
            <DialogDescription>
              Erstellen, bearbeiten, duplizieren oder archivieren Sie Ihre Portfolios.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 py-1">
            <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
            <Label htmlFor="show-archived" className="text-sm">
              Archivierte anzeigen
            </Label>
          </div>

          <div className="space-y-2">
            {visible.map((p) => {
              const Icon = getPortfolioIcon(p.icon);
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `${p.color ?? "#2dd4bf"}22`,
                      color: p.color ?? "#2dd4bf",
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.description || p.currency}
                      {p.archived ? " · Archiviert" : ""}
                      {p.isDefault ? " · Standard" : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    {!p.archived && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditTarget(p)}
                          title="Bearbeiten"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => duplicatePortfolio(p.id)}
                          title="Duplizieren"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setDefaultPortfolio(p.id)}
                          title="Als Standard"
                        >
                          <Star className={`h-3.5 w-3.5 ${p.isDefault ? "fill-primary text-primary" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => archivePortfolio(p.id)}
                          title="Archivieren"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(p)}
                      title="Löschen"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <PortfolioFormDialog
        open={Boolean(editTarget)}
        onOpenChange={(v) => !v && setEditTarget(null)}
        portfolio={editTarget}
        onSubmit={handleEdit}
      />

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Portfolio löschen?</DialogTitle>
            <DialogDescription>
              „{deleteTarget?.name}" und alle zugehörigen Assets, Transaktionen und Daten werden
              unwiderruflich gelöscht.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Endgültig löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
