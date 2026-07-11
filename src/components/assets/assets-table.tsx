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
import { Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  computePosition,
} from "@/lib/calculations";
import { getAssetMeta, getDisplayNotes } from "@/lib/asset-meta";
import type { ComputedPosition } from "@/lib/types";
import { cn } from "@/lib/utils";
import { selectActivePortfolio } from "@/lib/store-selectors";
import { usePortfolioStore } from "@/store/portfolio-store";
import { CustomAssetDialog } from "@/components/assets/custom-asset-dialog";

export function AssetsTable() {
  const portfolio = usePortfolioStore(selectActivePortfolio);
  const deletePosition = usePortfolioStore((s) => s.deletePosition);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const data = useMemo(() => {
    if (!portfolio) return [];
    return portfolio.positions
      .filter((p) => !p.isWatchlist)
      .map((p) => {
        const computed = computePosition(p);
        const meta = getAssetMeta(p.notes);
        const cat = portfolio.categories.find((c) => c.id === p.categoryId);
        return {
          ...computed,
          categoryName: meta.customCategory ?? cat?.name ?? "—",
          displayNotes: getDisplayNotes(p.notes),
        };
      });
  }, [portfolio]);

  const columns = useMemo<ColumnDef<ComputedPosition & { categoryName: string; displayNotes: string }>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Asset",
        cell: ({ row }) => (
          <div className="flex min-w-[140px] items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={row.original.logoUrl} />
              <AvatarFallback style={{ backgroundColor: row.original.color }}>
                {row.original.symbol.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{row.original.name}</div>
              <div className="text-xs text-muted-foreground">{row.original.symbol}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "categoryName",
        header: "Kategorie",
        cell: ({ getValue }) => <Badge variant="secondary">{String(getValue())}</Badge>,
      },
      {
        accessorKey: "quantity",
        header: "Anzahl",
        cell: ({ getValue }) => formatNumber(Number(getValue())),
      },
      {
        accessorKey: "avgBuyPrice",
        header: "Ø Kauf",
        cell: ({ getValue }) => formatCurrency(Number(getValue()), portfolio?.currency),
      },
      {
        accessorKey: "currentPrice",
        header: "Kurs",
        cell: ({ getValue }) => formatCurrency(Number(getValue()), portfolio?.currency),
      },
      {
        accessorKey: "invested",
        header: "Investiert",
        cell: ({ getValue }) => formatCurrency(Number(getValue()), portfolio?.currency),
      },
      {
        accessorKey: "currentValue",
        header: "Wert",
        cell: ({ getValue }) => formatCurrency(Number(getValue()), portfolio?.currency),
      },
      {
        accessorKey: "profitLoss",
        header: "G/V",
        cell: ({ row }) => (
          <span className={cn("tabular-nums", row.original.profitLoss >= 0 ? "text-emerald-500" : "text-red-500")}>
            {formatCurrency(row.original.profitLoss, portfolio?.currency)}
          </span>
        ),
      },
      {
        accessorKey: "profitLossPercent",
        header: "ROI %",
        cell: ({ row }) => (
          <span className={cn("tabular-nums", row.original.profitLossPercent >= 0 ? "text-emerald-500" : "text-red-500")}>
            {formatPercent(row.original.profitLossPercent)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-destructive"
            onClick={() => deletePosition(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [portfolio?.currency, deletePosition]
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

  if (!portfolio) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Assets suchen…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-11 pl-9"
          />
        </div>
        <CustomAssetDialog />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[900px] text-sm">
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
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-border/50 hover:bg-muted/30">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
