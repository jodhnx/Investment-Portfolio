import { NextRequest, NextResponse } from "next/server";
import { searchCrypto } from "@/lib/api/coingecko";
import { searchStocks } from "@/lib/api/yahoo";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const type = request.nextUrl.searchParams.get("type") ?? "all";

  if (!q.trim()) {
    return NextResponse.json([]);
  }

  try {
    const results = [];

    if (type === "all" || type === "crypto") {
      const crypto = await searchCrypto(q);
      results.push(...crypto);
    }

    if (type === "all" || type === "stock" || type === "etf") {
      const stocks = await searchStocks(q);
      results.push(...stocks);
    }

    // Gold/Silber statische Einträge bei passender Suche
    const lower = q.toLowerCase();
    if (
      (type === "all" || type === "gold") &&
      (lower.includes("gold") || lower.includes("xau"))
    ) {
      results.push({
        id: "gold",
        name: "Gold (XAU)",
        symbol: "XAU",
        type: "GOLD",
        currency: "EUR",
      });
    }
    if (
      (type === "all" || type === "silver") &&
      (lower.includes("silber") || lower.includes("silver") || lower.includes("xag"))
    ) {
      results.push({
        id: "silver",
        name: "Silber (XAG)",
        symbol: "XAG",
        type: "SILVER",
        currency: "EUR",
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Suche fehlgeschlagen" },
      { status: 500 }
    );
  }
}
