"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import { selectActivePortfolio } from "@/lib/store-selectors";
import { usePortfolioStore } from "@/store/portfolio-store";
import type { TransactionType } from "@/lib/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";

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
  { value: "CUSTOM", label: "Sonstige" },
];

type TxRow = {
  id: string;
  assetName: string;
  type: TransactionType;
  quantity: number;
  price: number;
  fees: number;
  date: string;
};

export default function TransactionsPage() {
  const portfolio = usePortfolioStore(selectActivePortfolio);
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const data = useMemo<TxRow[]>(() => {
    if (!portfolio) return [];
    return portfolio.positions
      .filter((p) => !p.isWatchlist)
      .flatMap((p) =>
        p.transactions.map((t) => ({
          id: t.id,
          assetName: p.name,
          type: t.type,
          quantity: t.quantity,
          price: t.price,
          fees: t.fees,
          date: t.date,
        }))
      );
  }, [portfolio]);

  const columns = useMemo<ColumnDef<TxRow>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Datum",
        cell: ({ getValue }) => format(new Date(String(getValue())), "dd.MM.yyyy", { locale: de }),
      },
      { accessorKey: "assetName", header: "Asset" },
      {
        accessorKey: "type",
        header: "Art",
        cell: ({ getValue }) => {
          const t = TX_TYPES.find((x) => x.value === getValue());
          return <Badge variant="secondary">{t?.label ?? String(getValue())}</Badge>;
        },
      },
      {
        accessorKey: "quantity",
        header: "Menge",
        cell: ({ getValue }) => formatNumber(Number(getValue())),
      },
      {
        accessorKey: "price",
        header: "Preis / Betrag",
        cell: ({ getValue }) => formatCurrency(Number(getValue()), portfolio?.currency),
      },
      {
        accessorKey: "fees",
        header: "Gebühren",
        cell: ({ getValue }) => formatCurrency(Number(getValue()), portfolio?.currency),
      },
    ],
    [portfolio?.currency]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const hasAssets = (portfolio?.positions.filter((p) => !p.isWatchlist).length ?? 0) > 0;

  if (!portfolio) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <Link href="/onboarding" className="text-primary hover:underline">
          Onboarding starten
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transaktionen</h2>
          <p className="text-sm text-muted-foreground">
            Käufe, Verkäufe, Dividenden, Gebühren und Steuern
          </p>
        </div>
        <Button className="h-11 gap-2" onClick={() => setDialogOpen(true)} disabled={!hasAssets}>
          <Plus className="h-4 w-4" />
          Transaktion
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suchen…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-11 pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="cursor-pointer border-b border-border bg-muted/50 px-3 py-3 text-left text-xs font-medium text-muted-foreground"
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-muted-foreground">
                  {hasAssets ? "Noch keine Transaktionen" : "Lege zuerst ein Asset an"}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border/50 hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TransactionFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
