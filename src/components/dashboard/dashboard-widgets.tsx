"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatsCards } from "./stats-cards";
import { PortfolioChart } from "./portfolio-chart";
import { AllocationChart } from "./allocation-chart";
import { TopMovers } from "./top-movers";
import { RecentTransactions } from "./recent-transactions";
import { QuickActions } from "./quick-actions";
import { MonthlyPerformance } from "./monthly-performance";
import type { DashboardStats, Portfolio, PortfolioSnapshot } from "@/lib/types";
import { cn } from "@/lib/utils";

export type WidgetId =
  | "stats"
  | "chart"
  | "allocation"
  | "winners"
  | "losers"
  | "recent"
  | "monthly"
  | "quick";

const WIDGET_META: Record<WidgetId, { label: string; default: boolean; span?: string }> = {
  stats: { label: "Kennzahlen", default: true, span: "col-span-full" },
  chart: { label: "Portfolioentwicklung", default: true, span: "lg:col-span-2" },
  allocation: { label: "Assetverteilung", default: true, span: "lg:col-span-1" },
  winners: { label: "Top Gewinner", default: true },
  losers: { label: "Top Verlierer", default: true },
  recent: { label: "Letzte Transaktionen", default: true, span: "lg:col-span-2" },
  monthly: { label: "Monatsperformance", default: true },
  quick: { label: "Schnellzugriff", default: true },
};

const DEFAULT_ORDER: WidgetId[] = [
  "stats",
  "chart",
  "allocation",
  "winners",
  "losers",
  "recent",
  "monthly",
  "quick",
];

function loadLayout(portfolioId: string) {
  if (typeof window === "undefined") return { order: DEFAULT_ORDER, hidden: [] as WidgetId[] };
  try {
    const raw = localStorage.getItem(`dashboard-layout-${portfolioId}`);
    if (!raw) return { order: DEFAULT_ORDER, hidden: [] as WidgetId[] };
    return JSON.parse(raw) as { order: WidgetId[]; hidden: WidgetId[] };
  } catch {
    return { order: DEFAULT_ORDER, hidden: [] as WidgetId[] };
  }
}

function SortableWidget({
  id,
  children,
}: {
  id: WidgetId;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative",
        WIDGET_META[id].span,
        isDragging && "z-10 opacity-90"
      )}
    >
      <button
        type="button"
        className="absolute right-2 top-2 z-10 flex h-8 w-8 cursor-grab items-center justify-center rounded-lg bg-background/80 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 touch-none"
        {...attributes}
        {...listeners}
        aria-label="Widget verschieben"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      {children}
    </div>
  );
}

interface DashboardWidgetsProps {
  portfolio: Portfolio;
  stats: DashboardStats;
  snapshots: PortfolioSnapshot[];
}

export function DashboardWidgets({ portfolio, stats, snapshots }: DashboardWidgetsProps) {
  const [order, setOrder] = useState<WidgetId[]>(DEFAULT_ORDER);
  const [hidden, setHidden] = useState<WidgetId[]>([]);

  useEffect(() => {
    const layout = loadLayout(portfolio.id);
    setOrder(layout.order);
    setHidden(layout.hidden);
  }, [portfolio.id]);

  const persist = useCallback(
    (nextOrder: WidgetId[], nextHidden: WidgetId[]) => {
      localStorage.setItem(
        `dashboard-layout-${portfolio.id}`,
        JSON.stringify({ order: nextOrder, hidden: nextHidden })
      );
    },
    [portfolio.id]
  );

  const visibleOrder = useMemo(
    () => order.filter((id) => !hidden.includes(id)),
    [order, hidden]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id as WidgetId);
    const newIndex = order.indexOf(over.id as WidgetId);
    const next = arrayMove(order, oldIndex, newIndex);
    setOrder(next);
    persist(next, hidden);
  };

  const toggleWidget = (id: WidgetId) => {
    const next = hidden.includes(id) ? hidden.filter((h) => h !== id) : [...hidden, id];
    setHidden(next);
    persist(order, next);
  };

  const renderWidget = (id: WidgetId) => {
    switch (id) {
      case "stats":
        return <StatsCards stats={stats} currency={portfolio.currency} />;
      case "chart":
        return (
          <PortfolioChart
            snapshots={snapshots}
            currentValue={stats.totalValue}
            invested={stats.totalInvested}
            currency={portfolio.currency}
          />
        );
      case "allocation":
        return <AllocationChart portfolio={portfolio} />;
      case "winners":
        return <TopMovers portfolio={portfolio} mode="winners" currency={portfolio.currency} />;
      case "losers":
        return <TopMovers portfolio={portfolio} mode="losers" currency={portfolio.currency} />;
      case "recent":
        return <RecentTransactions portfolio={portfolio} currency={portfolio.currency} />;
      case "monthly":
        return <MonthlyPerformance snapshots={snapshots} currency={portfolio.currency} />;
      case "quick":
        return <QuickActions />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted">
            <Settings2 className="h-4 w-4" />
            Widgets
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {(Object.keys(WIDGET_META) as WidgetId[]).map((id) => (
              <DropdownMenuCheckboxItem
                key={id}
                checked={!hidden.includes(id)}
                onCheckedChange={() => toggleWidget(id)}
              >
                {WIDGET_META[id].label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={visibleOrder} strategy={rectSortingStrategy}>
          <div className="grid gap-4 lg:grid-cols-3">
            {visibleOrder.map((id) => (
              <SortableWidget key={id} id={id}>
                {renderWidget(id)}
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
