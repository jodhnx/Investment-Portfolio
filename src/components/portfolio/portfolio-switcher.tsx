"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Plus, Settings2 } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { selectActivePortfolio, selectVisiblePortfolios } from "@/lib/store-selectors";
import { getPortfolioIcon } from "@/config/portfolio-icons";
import { PortfolioFormDialog } from "./portfolio-form-dialog";
import { PortfolioManager } from "./portfolio-manager";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PortfolioInput } from "@/lib/types";

interface PortfolioSwitcherProps {
  compact?: boolean;
  className?: string;
}

export function PortfolioSwitcher({ compact, className }: PortfolioSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  const portfolios = usePortfolioStore(selectVisiblePortfolios);
  const active = usePortfolioStore(selectActivePortfolio);
  const activeId = usePortfolioStore((s) => s.activePortfolioId);
  const setActivePortfolio = usePortfolioStore((s) => s.setActivePortfolio);
  const addPortfolio = usePortfolioStore((s) => s.addPortfolio);

  const ActiveIcon = getPortfolioIcon(active?.icon);
  const accent = active?.color ?? "#2dd4bf";

  const handleCreate = (input: PortfolioInput) => {
    addPortfolio(input);
    setOpen(false);
  };

  if (!portfolios.length) {
    return (
      <>
        <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Portfolio erstellen
        </Button>
        <PortfolioFormDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} />
      </>
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5 text-left transition-colors hover:bg-muted/50",
            compact ? "max-w-[160px]" : "w-full max-w-none",
            className
          )}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${accent}22`, color: accent }}
          >
            <ActiveIcon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium leading-tight">
              {active?.name ?? "Portfolio wählen"}
            </span>
            {!compact && active?.description && (
              <span className="block truncate text-[11px] text-muted-foreground">
                {active.description}
              </span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-2">
          <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Portfolios</p>
          <div className="max-h-64 space-y-0.5 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {portfolios.map((p) => {
                const Icon = getPortfolioIcon(p.icon);
                const selected = p.id === activeId;
                return (
                  <motion.button
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    type="button"
                    onClick={() => {
                      setActivePortfolio(p.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors",
                      selected ? "bg-primary/10" : "hover:bg-muted"
                    )}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${p.color ?? "#2dd4bf"}22`,
                        color: p.color ?? "#2dd4bf",
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{p.name}</span>
                      {p.isDefault && (
                        <span className="text-[10px] text-muted-foreground">Standard</span>
                      )}
                    </span>
                    {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
          <div className="mt-2 flex gap-1 border-t border-border pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 flex-1 justify-start text-xs"
              onClick={() => {
                setOpen(false);
                setCreateOpen(true);
              }}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Neu
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 flex-1 justify-start text-xs"
              onClick={() => {
                setOpen(false);
                setManageOpen(true);
              }}
            >
              <Settings2 className="mr-1 h-3.5 w-3.5" />
              Verwalten
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <PortfolioFormDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} />
      <PortfolioManager open={manageOpen} onOpenChange={setManageOpen} />
    </>
  );
}
