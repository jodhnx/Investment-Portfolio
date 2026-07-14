"use client";

import { useMemo, useState, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { Search, Trash2, Plus, Download, Pencil } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import {
  downloadAssetHistoryCsv,
  TX_TYPE_LABELS,
  type EnrichedAssetTransactionRow,
} from "@/lib/asset-calculations";
import type { Position } from "@/lib/types";
import { usePortfolioStore } from "@/store/portfolio-store";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AssetTransactionsTableProps {
  position: Position;
  rows: EnrichedAssetTransactionRow[];
  currency?: string;
  onAdd?: () => void;
}

export function AssetTransactionsTable({
  position,
  rows,
  currency = "EUR",
  onAdd,
}: AssetTransactionsTableProps) {
  const deleteTransaction = usePortfolioStore((s) => s.deleteTransaction);
  const deleteDividend = usePortfolioStore((s) => s.deleteDividend);
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<EnrichedAssetTransactionRow | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const openAdd = () => {
    if (onAdd) onAdd();
    else setAddOpen(true);
  };

  const handleDelete = useCallback(
    (row: EnrichedAssetTransactionRow) => {
      if (!confirm("Eintrag wirklich löschen?")) return;
      if (row.source === "dividend") deleteDividend(position.id, row.id);
      else deleteTransaction(position.id, row.id);
      toast.success("Eintrag gelöscht");
    },
    [deleteDividend, deleteTransaction, position.id]
  );

  const columns = useMemo<ColumnDef<EnrichedAssetTransactionRow>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Datum",
        cell: ({ row }) => (
          <div>
            <p>{format(new Date(row.original.date), "dd.MM.yyyy", { locale: de })}</p>
            <p className="text-xs text-muted-foreground">{row.original.time}</p>
          </div>
        ),
      },
      {
        accessorKey: "actionLabel",
        header: "Aktion",
        cell: ({ row }) => (
          <Badge variant="outline" className="rounded-lg font-normal">
            {row.original.actionLabel}
          </Badge>
        ),
      },
      {
        accessorKey: "type",
        header: "Typ",
        cell: ({ getValue }) => TX_TYPE_LABELS[String(getValue())] ?? String(getValue()),
      },
      {
        accessorKey: "quantity",
        header: "Anzahl",
        cell: ({ getValue, row }) =>
          row.original.type === "DIVIDEND" || row.original.type === "FEE" || row.original.type === "TAX"
            ? "—"
            : formatNumber(Number(getValue())),
      },
      {
        accessorKey: "price",
        header: "Preis/Einheit",
        cell: ({ getValue }) => formatCurrency(Number(getValue()), currency),
      },
      {
        accessorKey: "gross",
        header: "Gesamt",
        cell: ({ getValue }) => formatCurrency(Number(getValue()), currency),
      },
      {
        accessorKey: "fees",
        header: "Gebühren",
        cell: ({ getValue }) => formatCurrency(Number(getValue()), currency),
      },
      {
        accessorKey: "taxes",
        header: "Steuer",
        cell: ({ getValue }) => formatCurrency(Number(getValue()), currency),
      },
      {
        accessorKey: "profitOnTx",
        header: "Gewinn",
        cell: ({ row }) =>
          row.original.profitOnTx != null ? (
            <span className={cn("tabular-nums", row.original.profitOnTx >= 0 ? "text-emerald-500" : "text-red-500")}>
              {formatCurrency(row.original.profitOnTx, currency)}
            </span>
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "holdingsAfter",
        header: "Bestand",
        cell: ({ getValue }) => formatNumber(Number(getValue())),
      },
      {
        accessorKey: "avgPriceAfter",
        header: "Ø Kauf",
        cell: ({ getValue }) => formatCurrency(Number(getValue()), currency),
      },
      {
        accessorKey: "notes",
        header: "Notiz",
        cell: ({ getValue }) => (
          <span className="block max-w-[100px] truncate text-xs text-muted-foreground">
            {String(getValue() ?? "—")}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => setEditRow(row.original)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => handleDelete(row.original)}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [currency, handleDelete]
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const tableRows = table.getRowModel().rows;
  const useVirtual = tableRows.length > 30;

  const virtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 8,
    enabled: useVirtual,
  });

  const handleExport = () => downloadAssetHistoryCsv(rows, position.name, currency);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Transaktionsjournal</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1 rounded-xl" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="h-9 gap-1 rounded-xl" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Hinzufügen
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suchen & filtern…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-11"
        />
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-border/50 md:block">
        <div ref={parentRef} className={cn("overflow-x-auto", useVirtual && "max-h-[480px] overflow-y-auto")}>
          <table className="w-full min-w-[1200px] text-sm">
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="cursor-pointer px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-12 text-center text-muted-foreground">
                    Noch keine Transaktionen.
                  </td>
                </tr>
              ) : useVirtual ? (
                <>
                  {virtualizer.getVirtualItems().length > 0 && (
                    <tr style={{ height: virtualizer.getVirtualItems()[0]?.start ?? 0 }} />
                  )}
                  {virtualizer.getVirtualItems().map((vRow) => {
                    const row = tableRows[vRow.index];
                    return (
                      <tr key={row.id} className="border-b border-border/30 hover:bg-muted/20">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-3 py-2.5">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </>
              ) : (
                tableRows.map((row) => (
                  <tr key={row.id} className="border-b border-border/30 hover:bg-muted/20">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {tableRows.slice(0, 50).map((row) => {
          const r = row.original;
          return (
            <div key={r.id} className="premium-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{r.actionLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(r.date), "dd.MM.yyyy HH:mm", { locale: de })}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditRow(r)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(r)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                <span>Gesamt: {formatCurrency(r.gross, currency)}</span>
                <span>Bestand: {formatNumber(r.holdingsAfter)}</span>
                {r.profitOnTx != null && (
                  <span className={r.profitOnTx >= 0 ? "text-emerald-500" : "text-red-500"}>
                    G/V: {formatCurrency(r.profitOnTx, currency)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TransactionFormDialog open={addOpen} onOpenChange={setAddOpen} defaultPositionId={position.id} />
      <TransactionFormDialog
        open={Boolean(editRow)}
        onOpenChange={(open) => !open && setEditRow(null)}
        defaultPositionId={position.id}
        editRow={editRow}
      />
    </div>
  );
}
