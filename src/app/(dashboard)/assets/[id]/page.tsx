"use client";

import { useMemo } from "react";
import { useParams, notFound } from "next/navigation";
import { motion } from "framer-motion";
import { usePortfolioStore } from "@/store/portfolio-store";
import { selectActivePortfolio } from "@/lib/store-selectors";
import { getAssetMeta } from "@/lib/asset-meta";
import { AssetDetailHeader } from "@/components/assets/asset-detail-header";
import { AssetPriceChart } from "@/components/assets/asset-price-chart";
import { AssetTransactionsTable } from "@/components/assets/asset-transactions-table";
import { AssetSummaryGrid } from "@/components/assets/asset-summary-grid";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = params.id as string;
  const hydrated = usePortfolioStore((s) => s.hydrated);
  const portfolio = usePortfolioStore(selectActivePortfolio);

  const position = useMemo(
    () => portfolio?.positions.find((p) => p.id === assetId && !p.isWatchlist),
    [portfolio, assetId]
  );

  if (!hydrated) return <DashboardSkeleton />;

  if (!portfolio || !position) {
    notFound();
  }

  const meta = getAssetMeta(position.notes);
  const categoryName =
    meta.customCategory ??
    portfolio.categories.find((c) => c.id === position.categoryId)?.name ??
    position.type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-8"
    >
      <AssetDetailHeader
        position={position}
        categoryName={categoryName}
        currency={meta.currency ?? portfolio.currency}
      />
      <AssetPriceChart position={position} currency={portfolio.currency} />
      <AssetTransactionsTable position={position} currency={portfolio.currency} />
      <AssetSummaryGrid position={position} currency={portfolio.currency} />
    </motion.div>
  );
}
