"use client";

import { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnOrderState,
} from "@tanstack/react-table";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowUpDown, GripVertical, Plus, Search, Trash2 } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
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
import type { ComputedPosition } from "@/lib/types";
import { assetTypeLabel } from "@/hooks/use-price-updater";
import { cn } from "@/lib/utils";
import { selectActivePortfolio } from "@/lib/store-selectors";
import { usePortfolioStore } from "@/store/portfolio-store";
import { AddAssetDialog } from "./add-asset-dialog";
import { TransactionDialog } from "./transaction-dialog";

function SortableHeader({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className="relative border-b border-border bg-muted/50 px-2 py-2 text-left text-xs font-medium text-muted-foreground"
    >
      <div className="flex items-center gap-1">
        <button type="button" className="cursor-grab touch-none" {...attributes} {...listeners}>
          <GripVertical className="h-3 w-3 opacity-40" />
        </button>
        {children}
      </div>
    </th>
  );
}

const defaultColumns: ColumnDef<ComputedPosition>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Asset",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={row.original.logoUrl} />
          <AvatarFallback className="text-[10px]">
            {row.original.symbol.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.symbol}</div>
        </div>
      </div>
    ),
    size: 180,
  },
  {
    id: "type",
    accessorKey: "type",
    header: "Typ",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs">
        {assetTypeLabel(row.original.type)}
      </Badge>
    ),
    size: 90,
  },
  {
    id: "broker",
    accessorKey: "broker",
    header: "Broker",
    cell: ({ getValue }) => getValue() ?? "—",
    size: 100,
  },
  {
    id: "purchaseDate",
    accessorKey: "purchaseDate",
    header: "Kaufdatum",
    cell: ({ getValue }) => {
      const d = getValue() as string | undefined;
      return d ? new Date(d).toLocaleDateString("de-DE") : "—";
    },
    size: 100,
  },
  {
    id: "avgBuyPrice",
    accessorKey: "avgBuyPrice",
    header: "Ø Kaufpreis",
    cell: ({ getValue }) => formatCurrency(getValue() as number),
    size: 110,
  },
  {
    id: "currentPrice",
    accessorKey: "currentPrice",
    header: "Akt. Preis",
    cell: ({ getValue }) => formatCurrency(getValue() as number),
    size: 110,
  },
  {
    id: "quantity",
    accessorKey: "quantity",
    header: "Anzahl",
    cell: ({ getValue }) => formatNumber(getValue() as number),
    size: 90,
  },
  {
    id: "invested",
    accessorKey: "invested",
    header: "Investiert",
    cell: ({ getValue }) => formatCurrency(getValue() as number),
    size: 110,
  },
  {
    id: "currentValue",
    accessorKey: "currentValue",
    header: "Akt. Wert",
    cell: ({ getValue }) => formatCurrency(getValue() as number),
    size: 110,
  },
  {
    id: "profitLoss",
    accessorKey: "profitLoss",
    header: "G/V €",
    cell: ({ row }) => {
      const v = row.original.profitLoss;
      return (
        <span className={cn("tabular-nums", v >= 0 ? "text-green-400" : "text-red-400")}>
          {formatCurrency(v)}
        </span>
      );
    },
    size: 100,
  },
  {
    id: "profitLossPercent",
    accessorKey: "profitLossPercent",
    header: "G/V %",
    cell: ({ row }) => {
      const v = row.original.profitLossPercent;
      return (
        <span className={cn("tabular-nums", v >= 0 ? "text-green-400" : "text-red-400")}>
          {formatPercent(v)}
        </span>
      );
    },
    size: 80,
  },
  {
    id: "fees",
    accessorKey: "fees",
    header: "Gebühren",
    cell: ({ getValue }) => formatCurrency(getValue() as number),
    size: 90,
  },
  {
    id: "notes",
    accessorKey: "notes",
    header: "Notizen",
    cell: ({ getValue }) => (
      <span className="max-w-[120px] truncate text-xs text-muted-foreground">
        {(getValue() as string) ?? "—"}
      </span>
    ),
    size: 120,
  },
];

interface PortfolioTableProps {
  watchlistOnly?: boolean;
}

export function PortfolioTable({ watchlistOnly = false }: PortfolioTableProps) {
  const portfolio = usePortfolioStore(selectActivePortfolio);
  const deletePosition = usePortfolioStore((s) => s.deletePosition);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    defaultColumns.map((c) => c.id!)
  );
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});
  const [txDialog, setTxDialog] = useState<string | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const data = useMemo(() => {
    if (!portfolio) return [];
    return portfolio.positions
      .filter((p) => (watchlistOnly ? p.isWatchlist : !p.isWatchlist))
      .map(computePosition)
      .filter((p) => watchlistOnly || p.quantity > 0 || p.invested > 0);
  }, [portfolio, watchlistOnly]);

  const columns = useMemo(() => defaultColumns, []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnOrder },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const rows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setColumnOrder((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const headerGroup = table.getHeaderGroups()[0];
  const orderedHeaders = columnOrder
    .map((id) => headerGroup?.headers.find((h) => h.column.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <AddAssetDialog watchlist={watchlistOnly} />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div ref={parentRef} className="max-h-[calc(100vh-280px)] overflow-auto">
            <table className="w-full min-w-[1200px] border-collapse">
              <thead className="sticky top-0 z-10">
                <tr>
                  <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                    {orderedHeaders.map((header) => (
                      <SortableHeader key={header!.id} id={header!.column.id}>
                        <button
                          type="button"
                          className="flex items-center gap-1 hover:text-foreground"
                          onClick={header!.column.getToggleSortingHandler()}
                        >
                          {flexRender(header!.column.columnDef.header, header!.getContext())}
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        </button>
                        <div
                          className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            const colId = header!.column.id;
                            const startX = e.clientX;
                            const startWidth = columnSizing[colId] ?? header!.column.getSize();
                            const onMove = (ev: MouseEvent) => {
                              const diff = ev.clientX - startX;
                              setColumnSizing((s) => ({
                                ...s,
                                [colId]: Math.max(60, startWidth + diff),
                              }));
                            };
                            const onUp = () => {
                              document.removeEventListener("mousemove", onMove);
                              document.removeEventListener("mouseup", onUp);
                            };
                            document.addEventListener("mousemove", onMove);
                            document.addEventListener("mouseup", onUp);
                          }}
                        />
                      </SortableHeader>
                    ))}
                  </SortableContext>
                  <th className="border-b border-border bg-muted/50 px-2 py-2 w-24" />
                </tr>
              </thead>
              <tbody style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-border/50 hover:bg-muted/30 absolute w-full"
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {columnOrder.map((colId) => {
                        const cell = row.getAllCells().find((c) => c.column.id === colId);
                        if (!cell) return null;
                        return (
                          <td
                            key={colId}
                            className="px-2 py-2 text-sm tabular-nums"
                            style={{ width: columnSizing[colId] ?? 100 }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                      <td className="px-2 py-2">
                        <div className="flex gap-1">
                          {!watchlistOnly && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setTxDialog(row.original.id)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => deletePosition(row.original.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {watchlistOnly
                  ? "Watchlist ist leer. Füge Assets hinzu, die du beobachten möchtest."
                  : "Noch keine Positionen. Füge dein erstes Asset hinzu."}
              </div>
            )}
          </div>
        </DndContext>
      </div>

      {txDialog && (
        <TransactionDialog
          positionId={txDialog}
          open={!!txDialog}
          onOpenChange={(open) => !open && setTxDialog(null)}
        />
      )}
    </div>
  );
}
