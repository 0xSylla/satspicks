/** BTC price in FCFA (XOF), cached 10 min. CoinGecko in USD with a fixed
 *  USD→XOF rate (XOF is pegged to EUR; ~590/USD), falling back to
 *  BTC_PRICE_XOF or a hardcoded default so the UI always shows a figure. */

const USD_XOF = 590;
const DEFAULT_BTC_XOF = 60_000_000;

let cached: { value: number; at: number } | null = null;

export async function btcPriceXof(): Promise<number> {
  if (cached && Date.now() - cached.at < 10 * 60 * 1000) return cached.value;
  let value = Number(process.env.BTC_PRICE_XOF) || DEFAULT_BTC_XOF;
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
      { signal: AbortSignal.timeout(4000), next: { revalidate: 600 } }
    );
    if (res.ok) {
      const data = (await res.json()) as { bitcoin?: { usd?: number } };
      if (data.bitcoin?.usd) value = Math.round(data.bitcoin.usd * USD_XOF);
    }
  } catch {
    // keep fallback
  }
  cached = { value, at: Date.now() };
  return value;
}

export function satsToFcfa(sats: number, btcXof: number): number {
  return Math.round((sats / 100_000_000) * btcXof);
}

export function fmtFcfa(n: number): string {
  return n.toLocaleString("fr-FR") + " F";
}

export function fmtSats(n: number): string {
  return n.toLocaleString("fr-FR") + " sats";
}
