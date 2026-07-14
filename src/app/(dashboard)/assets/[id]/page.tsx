"use client";

import { useMemo, useState, Suspense } from "react";
import { useParams, notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { usePortfolioStore } from "@/store/portfolio-store";
import { selectActivePortfolio } from "@/lib/store-selectors";
import { useAssetHistory } from "@/hooks/use-asset-history";
import { getAssetMeta } from "@/lib/asset-meta";
import { AssetDetailHeader } from "@/components/assets/asset-detail-header";
import { AssetTransactionsTable } from "@/components/assets/asset-transactions-table";
import { AssetTimeline } from "@/components/assets/asset-timeline";
import { AssetMetricsSections } from "@/components/assets/asset-metrics-sections";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const AssetChartsPanel = dynamic(
  () => import("@/components/assets/asset-charts-panel").then((m) => m.AssetChartsPanel),
  {
    loading: () => <Skeleton className="h-[480px] w-full rounded-2xl" />,
    ssr: false,
  }
);

function AssetDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = params.id as string;
  const hydrated = usePortfolioStore((s) => s.hydrated);
  const portfolio = usePortfolioStore(selectActivePortfolio);
  const [txOpen, setTxOpen] = useState(false);
  const [tab, setTab] = useState("journal");

  const position = useMemo(
    () => portfolio?.positions.find((p) => p.id === assetId && !p.isWatchlist),
    [portfolio, assetId]
  );

  const history = useAssetHistory(position);

  if (!hydrated) return <AssetDetailSkeleton />;

  if (!portfolio || !position || !history) {
    notFound();
  }

  const meta = getAssetMeta(position.notes);
  const categoryName =
    meta.customCategory ??
    portfolio.categories.find((c) => c.id === position.categoryId)?.name ??
    position.type;
  const currency = meta.currency ?? portfolio.currency;

  return (
    <div className="space-y-8 pb-8">
      <AssetDetailHeader
        position={position}
        categoryName={categoryName}
        currency={currency}
        history={history}
        onAddTransaction={() => setTxOpen(true)}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-10 w-full justify-start overflow-x-auto rounded-xl bg-muted/50 p-1">
          <TabsTrigger value="journal" className="rounded-lg">Journal</TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-lg">Timeline</TabsTrigger>
          <TabsTrigger value="charts" className="rounded-lg">Diagramme</TabsTrigger>
          <TabsTrigger value="metrics" className="rounded-lg">Kennzahlen</TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="mt-6">
          <AssetTransactionsTable
            position={position}
            rows={history.rows}
            currency={currency}
            onAdd={() => setTxOpen(true)}
          />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <AssetTimeline events={history.timeline} currency={currency} />
        </TabsContent>

        <TabsContent value="charts" className="mt-6">
          <Suspense fallback={<Skeleton className="h-[480px] rounded-2xl" />}>
            <AssetChartsPanel data={history.charts} currency={currency} />
          </Suspense>
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <AssetMetricsSections metrics={history.metrics} capital={history.capital} currency={currency} />
        </TabsContent>
      </Tabs>

      <TransactionFormDialog open={txOpen} onOpenChange={setTxOpen} defaultPositionId={position.id} />
    </div>
  );
}
