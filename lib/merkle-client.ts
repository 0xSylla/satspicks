/** Browser-side (WebCrypto) reimplementation of the draw math, so the
 *  verification page can recompute everything on the visitor's own device. */

export async function sha256HexBrowser(data: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(data)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function merkleRootBrowser(leaves: string[]): Promise<string> {
  if (leaves.length === 0) return sha256HexBrowser("empty");
  let level = leaves.map((l) => l.toLowerCase());
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = i + 1 < level.length ? level[i + 1] : left;
      next.push(await sha256HexBrowser(left + right));
    }
    level = next;
  }
  return level[0];
}

export async function winnerIndexBrowser(
  blockHash: string,
  root: string,
  nTickets: number
): Promise<number> {
  const h = await sha256HexBrowser(
    blockHash.toLowerCase() + root.toLowerCase()
  );
  return Number(BigInt("0x" + h) % BigInt(nTickets));
}
