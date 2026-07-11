"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { selectActivePortfolio } from "@/lib/store-selectors";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { cn } from "@/lib/utils";

export function TransactionFab() {
  const [open, setOpen] = useState(false);
  const portfolio = usePortfolioStore(selectActivePortfolio);
  const hasAssets = (portfolio?.positions.filter((p) => !p.isWatchlist).length ?? 0) > 0;

  if (!hasAssets) return null;

  return (
    <>
      <AnimatePresence>
        <motion.button
          type="button"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 0.92 }}
          className={cn(
            "fixed z-50 flex h-14 w-14 items-center justify-center rounded-full",
            "bg-primary text-primary-foreground shadow-lg shadow-primary/25",
            "bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 md:hidden"
          )}
          onClick={() => setOpen(true)}
          aria-label="Neue Transaktion"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      </AnimatePresence>
      <TransactionFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
