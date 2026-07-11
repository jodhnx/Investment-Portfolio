import { NextRequest, NextResponse } from "next/server";
import { getCryptoPrices, getGoldPrice } from "@/lib/api/coingecko";

export async function POST(request: NextRequest) {
  try {
    const { ids } = (await request.json()) as { ids: string[] };
    const prices = await getCryptoPrices(ids);

    if (ids.includes("gold")) {
      const goldPrice = await getGoldPrice();
      if (goldPrice) {
        prices.gold = { price: goldPrice / 31.1035 }; // € pro Gramm
      }
    }

    return NextResponse.json(prices);
  } catch (error) {
    console.error("Crypto prices error:", error);
    return NextResponse.json({ error: "Preisabruf fehlgeschlagen" }, { status: 500 });
  }
}
