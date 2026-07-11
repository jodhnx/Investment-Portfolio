const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export async function searchCrypto(query: string) {
  if (!query.trim()) return [];

  const res = await fetch(
    `${COINGECKO_BASE}/search?query=${encodeURIComponent(query)}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) return [];

  const data = await res.json();
  const coins = (data.coins ?? []).slice(0, 10);

  if (coins.length === 0) return [];

  const ids = coins.map((c: { id: string }) => c.id).join(",");
  const priceRes = await fetch(
    `${COINGECKO_BASE}/simple/price?ids=${ids}&vs_currencies=eur,usd&include_24hr_change=true`,
    { next: { revalidate: 60 } }
  );
  const prices = priceRes.ok ? await priceRes.json() : {};

  return coins.map(
    (c: {
      id: string;
      name: string;
      symbol: string;
      thumb: string;
    }) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol.toUpperCase(),
      type: "CRYPTO" as const,
      logoUrl: c.thumb,
      currentPrice: prices[c.id]?.eur ?? prices[c.id]?.usd,
      currency: prices[c.id]?.eur ? "EUR" : "USD",
    })
  );
}

export async function getCryptoPrices(ids: string[]) {
  if (!ids.length) return {};
  const res = await fetch(
    `${COINGECKO_BASE}/simple/price?ids=${ids.join(",")}&vs_currencies=eur&include_24hr_change=true`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return {};

  const data = await res.json();
  const result: Record<
    string,
    { price: number; change24h?: number; changePercent24h?: number }
  > = {};

  for (const [id, val] of Object.entries(data)) {
    const v = val as { eur: number; eur_24h_change?: number };
    result[id] = {
      price: v.eur,
      changePercent24h: v.eur_24h_change,
      change24h: v.eur_24h_change
        ? (v.eur * v.eur_24h_change) / (100 + v.eur_24h_change)
        : 0,
    };
  }
  return result;
}

export async function getGoldPrice() {
  const res = await fetch(
    `${COINGECKO_BASE}/simple/price?ids=gold&vs_currencies=eur&include_24hr_change=true`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.gold?.eur ?? null;
}
