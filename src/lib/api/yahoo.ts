const YAHOO_BASE = "https://query1.finance.yahoo.com/v1/finance";

export async function searchStocks(query: string) {
  if (!query.trim()) return [];

  const res = await fetch(
    `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`,
    {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 300 },
    }
  );
  if (!res.ok) return [];

  const data = await res.json();
  return (data.quotes ?? [])
    .filter(
      (q: { quoteType?: string }) =>
        q.quoteType === "EQUITY" || q.quoteType === "ETF"
    )
    .slice(0, 10)
    .map(
      (q: {
        symbol: string;
        shortname?: string;
        longname?: string;
        quoteType?: string;
      }) => ({
        id: q.symbol,
        name: q.longname ?? q.shortname ?? q.symbol,
        symbol: q.symbol,
        type: q.quoteType === "ETF" ? ("ETF" as const) : ("STOCK" as const),
        currency: "USD",
      })
    );
}

export async function getStockPrices(symbols: string[]) {
  if (!symbols.length) return {};

  const result: Record<
    string,
    { price: number; change24h?: number; changePercent24h?: number }
  > = {};

  for (const symbol of symbols) {
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
        {
          headers: { "User-Agent": "Mozilla/5.0" },
          next: { revalidate: 120 },
        }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const meta = data.chart?.result?.[0]?.meta;
      if (!meta) continue;
      result[symbol] = {
        price: meta.regularMarketPrice ?? 0,
        change24h: meta.regularMarketChange ?? 0,
        changePercent24h: meta.regularMarketChangePercent ?? 0,
      };
    } catch {
      // skip failed symbol
    }
  }
  return result;
}

export async function getExchangeRate(from = "USD", to = "EUR") {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${from}${to}=X?interval=1d&range=1d`,
    {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 3600 },
    }
  );
  if (!res.ok) return 1;
  const data = await res.json();
  return data.chart?.result?.[0]?.meta?.regularMarketPrice ?? 1;
}
