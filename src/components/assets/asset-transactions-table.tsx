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
  type RowSelectionState,
} from "@tanstack/react-table";
import { Search, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import {
  buildAssetTransactionRows,
  TX_TYPE_LABELS,
  type AssetTransactionRow,
} from "@/lib/asset-calculations";
import type { Position } from "@/lib/types";
import { usePortfolioStore } from "@/store/portfolio-store";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { toast } from "sonner";

interface AssetTransactionsTableProps {
  position: Position;
  currency?: string;
}

export function AssetTransactionsTable({ position, currency = "EUR" }: AssetTransactionsTableProps) {
  const deleteTransaction = usePortfolioStore((s) => s.deleteTransaction);
  const deleteDividend = usePortfolioStore((s) => s.deleteDividend);
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [addOpen, setAddOpen] = useState(false);

  const data = useMemo(() => buildAssetTransactionRows(position), [position]);

  const handleDelete = (row: AssetTransactionRow) => {
    if (row.source === "dividend") {
      deleteDividend(position.id, row.id);
    } else {
      deleteTransaction(position.id, row.id);
    }
    toast.success("Eintrag gelöscht");
  };

  const columns = useMemo<ColumnDef<AssetTransactionRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Alle auswählen"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Zeile auswählen"
          />
        ),
        size: 40,
      },
      {
        accessorKey: "date",
        header: "Datum",
        cell: ({ getValue }) =>
          format(new Date(String(getValue())), "dd.MM.yyyy", { locale: de }),
      },
      {
        accessorKey: "type",
        header: "Typ",
        cell: ({ getValue }) => (
          <Badge variant="secondary">{TX_TYPE_LABELS[String(getValue())] ?? String(getValue())}</Badge>
        ),
      },
      {
        accessorKey: "quantity",
        header: "Anzahl",
        cell: ({ getValue, row }) =>
          row.original.type === "DIVIDEND" ? "—" : formatNumber(Number(getValue())),
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
        accessorKey: "net",
        header: "Netto",
        cell: ({ row }) => (
          <span className={row.original.net >= 0 ? "text-emerald-500" : "text-red-500"}>
            {formatCurrency(row.original.net, currency)}
          </span>
        ),
      },
      {
        accessorKey: "notes",
        header: "Notiz",
        cell: ({ getValue }) => (
          <span className="max-w-[120px] truncate text-xs text-muted-foreground">
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
              className="h-8 w-8"
              onClick={() => handleDelete(row.original)}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [currency, position.id, deleteTransaction, deleteDividend]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleBulkDelete = () => {
    const selected = table.getFilteredSelectedRowModel().rows;
    if (!selected.length) return;
    for (const row of selected) {
      handleDelete(row.original);
    }
    setRowSelection({});
    toast.success(`${selected.length} Einträge gelöscht`);
  };

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Transaktionen</h3>
        <div className="flex gap-2">
          {selectedCount > 0 && (
            <Button variant="destructive" size="sm" className="h-9" onClick={handleBulkDelete}>
              {selectedCount} löschen
            </Button>
          )}
          <Button size="sm" className="h-9 gap-1" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Hinzufügen
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filtern…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-10 pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="cursor-pointer border-b border-border bg-muted/50 px-2 py-2.5 text-left text-xs font-medium text-muted-foreground"
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
                <td colSpan={columns.length} className="px-3 py-10 text-center text-muted-foreground">
                  Noch keine Transaktionen – füge Käufe oder Verkäufe hinzu.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/50 hover:bg-muted/30 data-[state=selected]:bg-muted/50"
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-2 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TransactionFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultPositionId={position.id}
      />
    </div>
  );
}
