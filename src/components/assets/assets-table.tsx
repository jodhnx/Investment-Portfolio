"use client";

import Link from "next/link";
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
import { ChevronRight, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
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

type AssetRow = ComputedPosition & { categoryName: string; displayNotes: string };

export function AssetsTable() {
  const portfolio = usePortfolioStore(selectActivePortfolio);
  const deletePosition = usePortfolioStore((s) => s.deletePosition);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const data = useMemo((): AssetRow[] => {
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

  const columns = useMemo<ColumnDef<AssetRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Asset",
        cell: ({ row }) => (
          <Link
            href={`/assets/${row.original.id}`}
            className="flex min-w-[140px] items-center gap-3 rounded-xl transition-opacity hover:opacity-80"
          >
            <Avatar className="h-10 w-10 ring-2 ring-border/50">
              <AvatarImage src={row.original.logoUrl} />
              <AvatarFallback style={{ backgroundColor: row.original.color }}>
                {row.original.symbol.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{row.original.name}</div>
              <div className="text-xs text-muted-foreground">{row.original.symbol}</div>
            </div>
          </Link>
        ),
      },
      {
        accessorKey: "currentValue",
        header: "Wert",
        cell: ({ row }) => (
          <div>
            <p className="font-medium tabular-nums">
              {formatCurrency(row.original.currentValue, portfolio?.currency)}
            </p>
            <p
              className={cn(
                "text-xs tabular-nums",
                row.original.profitLoss >= 0 ? "text-emerald-500" : "text-red-500"
              )}
            >
              {formatPercent(row.original.profitLossPercent)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "quantity",
        header: "Anzahl",
        cell: ({ getValue }) => formatNumber(Number(getValue())),
      },
      {
        accessorKey: "profitLoss",
        header: "G/V",
        cell: ({ row }) => (
          <span className={cn("tabular-nums font-medium", row.original.profitLoss >= 0 ? "text-emerald-500" : "text-red-500")}>
            {formatCurrency(row.original.profitLoss, portfolio?.currency)}
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
            className="h-10 w-10 rounded-xl text-destructive"
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

  const rows = table.getRowModel().rows;

  if (!portfolio) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Assets" description="Alle Positionen in deinem Portfolio" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Suchen…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-11"
          />
        </div>
        <CustomAssetDialog />
      </div>

      {/* Mobile: Karten */}
      <div className="space-y-3 md:hidden">
        {rows.length === 0 ? (
          <div className="premium-card p-8 text-center text-sm text-muted-foreground">
            Noch keine Assets — lege dein erstes an.
          </div>
        ) : (
          rows.map((row) => {
            const asset = row.original;
            return (
              <Link
                key={row.id}
                href={`/assets/${asset.id}`}
                className="premium-card flex items-center gap-4 p-4 active:scale-[0.99]"
              >
                <Avatar className="h-12 w-12 ring-2 ring-border/50">
                  <AvatarImage src={asset.logoUrl} />
                  <AvatarFallback style={{ backgroundColor: asset.color }}>
                    {asset.symbol.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">{asset.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">
                    {formatCurrency(asset.currentValue, portfolio.currency)}
                  </p>
                  <p
                    className={cn(
                      "text-xs tabular-nums",
                      asset.profitLoss >= 0 ? "text-emerald-500" : "text-red-500"
                    )}
                  >
                    {formatPercent(asset.profitLossPercent)}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </Link>
            );
          })
        )}
      </div>

      {/* Desktop: Tabelle */}
      <div className="hidden overflow-hidden rounded-2xl border border-border/50 md:block">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border/50 bg-muted/30">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="cursor-pointer px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border/30 transition-colors hover:bg-muted/20">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-4">
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
