import { NextRequest, NextResponse } from "next/server";
import { getStockPrices } from "@/lib/api/yahoo";

export async function POST(request: NextRequest) {
  try {
    const { symbols } = (await request.json()) as { symbols: string[] };
    const prices = await getStockPrices(symbols);
    return NextResponse.json(prices);
  } catch (error) {
    console.error("Stock prices error:", error);
    return NextResponse.json({ error: "Preisabruf fehlgeschlagen" }, { status: 500 });
  }
}
