import { createHash } from "node:crypto";

export function sha256Hex(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex");
}

/**
 * Merkle root over hex leaves (lowercase), pairs hashed as sha256(left + right)
 * over the concatenated hex strings. Odd levels duplicate the last node.
 * Leaves MUST be sorted ascending before calling — sorting is part of the
 * public verification procedure.
 */
export function merkleRoot(leaves: string[]): string {
  if (leaves.length === 0) return sha256Hex("empty");
  let level = leaves.map((l) => l.toLowerCase());
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = i + 1 < level.length ? level[i + 1] : left;
      next.push(sha256Hex(left + right));
    }
    level = next;
  }
  return level[0];
}

/** Leaf for ticket i of a multi-ticket purchase: one Lightning payment can
 *  back several tickets, each with a distinct, publicly recomputable leaf.
 *  Single-ticket purchases use the payment hash itself as leaf. */
export function batchLeaf(paymentHash: string, index: number): string {
  return sha256Hex(`${paymentHash.toLowerCase()}:${index}`);
}

/** winnerIndex = sha256(blockHash + merkleRoot) mod nTickets */
export function winnerIndex(
  blockHash: string,
  root: string,
  nTickets: number
): number {
  const h = sha256Hex(blockHash.toLowerCase() + root.toLowerCase());
  return Number(BigInt("0x" + h) % BigInt(nTickets));
}
