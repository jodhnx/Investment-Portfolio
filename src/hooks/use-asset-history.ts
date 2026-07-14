"use client";

import { useMemo } from "react";
import type { Position } from "@/lib/types";
import {
  buildAssetChartData,
  buildEnrichedAssetHistory,
  computeAssetCapitalOverview,
  computeAssetDetailSummary,
  computeExtendedAssetMetrics,
  type AssetCapitalOverview,
  type AssetChartPoint,
  type AssetDetailSummary,
  type EnrichedAssetTransactionRow,
  type ExtendedAssetMetrics,
} from "@/lib/asset-calculations";
import { computePosition } from "@/lib/calculations";

export interface AssetHistoryData {
  computed: ReturnType<typeof computePosition>;
  summary: AssetDetailSummary;
  metrics: ExtendedAssetMetrics;
  capital: AssetCapitalOverview;
  rows: EnrichedAssetTransactionRow[];
  timeline: EnrichedAssetTransactionRow[];
  charts: AssetChartPoint[];
}

export function useAssetHistory(position: Position | undefined): AssetHistoryData | null {
  return useMemo(() => {
    if (!position) return null;

    const rows = buildEnrichedAssetHistory(position);
    return {
      computed: computePosition(position),
      summary: computeAssetDetailSummary(position),
      metrics: computeExtendedAssetMetrics(position),
      capital: computeAssetCapitalOverview(position),
      rows,
      timeline: [...rows].reverse(),
      charts: buildAssetChartData(position),
    };
  }, [
    position?.id,
    position?.transactions,
    position?.dividends,
    position?.currentPrice,
    position?.updatedAt,
  ]);
}
