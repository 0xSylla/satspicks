/** Esplora-compatible block APIs, tried in order. mempool.space and
 *  blockstream.info expose the same endpoints; some networks block one
 *  of them, so we fall back. */
function apiBases(): string[] {
  const bases = [
    "https://blockstream.info/api",
    "https://mempool.space/api",
  ];
  const env = process.env.MEMPOOL_API;
  if (env && !bases.includes(env)) bases.unshift(env);
  return bases;
}

async function fetchFirst(path: string): Promise<Response> {
  let lastErr: unknown = null;
  for (const base of apiBases()) {
    try {
      const res = await fetch(`${base}${path}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok || res.status === 404) return res;
      lastErr = new Error(`${base}${path} -> ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(
    `all block APIs failed for ${path}: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`
  );
}

export async function currentTipHeight(): Promise<number> {
  const res = await fetchFirst("/blocks/tip/height");
  return Number(await res.text());
}

/** Returns the block hash at a height, or null if the block is not mined yet. */
export async function blockHashAt(height: number): Promise<string | null> {
  const res = await fetchFirst(`/block-height/${height}`);
  if (res.status === 404) return null;
  return (await res.text()).trim();
}
