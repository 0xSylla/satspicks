/**
 * Independent draw verifier — recomputes a raffle's winner from public data,
 * without trusting the platform's stored result.
 *
 * Usage:
 *   npm run verify -- <raffle-id> [--base http://localhost:3000]
 *
 * It fetches GET /api/raffles/<id>/verify (public), recomputes the merkle
 * root from the ticket list, re-fetches the block hash from mempool.space,
 * and recomputes the winner index.
 */
import { merkleRoot, winnerIndex } from "../lib/merkle";

const args = process.argv.slice(2).filter((a) => a !== "--");
const id = args.find((a) => !a.startsWith("--"));
const baseIdx = args.indexOf("--base");
const base = baseIdx >= 0 ? args[baseIdx + 1] : "http://localhost:3000";

if (!id) {
  console.error("Usage: npm run verify -- <raffle-id> [--base <url>]");
  process.exit(1);
}

async function main(id: string) {
const res = await fetch(`${base}/api/raffles/${id}/verify`);
if (!res.ok) {
  console.error(`API error: ${res.status}`);
  process.exit(1);
}
const data = (await res.json()) as {
  title: string;
  status: string;
  ticket_leaves: string[];
  committed_merkle_root: string | null;
  target_block_height: number | null;
  stored_winner_leaf: string | null;
};

console.log(`Raffle: ${data.title} (${data.status})`);
console.log(`Tickets: ${data.ticket_leaves.length}`);

const root = merkleRoot(data.ticket_leaves);
console.log(`Recomputed merkle root: ${root}`);
console.log(`Committed merkle root:  ${data.committed_merkle_root}`);
if (data.committed_merkle_root && root !== data.committed_merkle_root) {
  console.error("✗ MERKLE ROOT MISMATCH — the ticket list was tampered with.");
  process.exit(1);
}

if (data.target_block_height == null) {
  console.log("Raffle not closed yet — nothing more to verify.");
  process.exit(0);
}

const { blockHashAt } = await import("../lib/bitcoin");
const blockHash = await blockHashAt(data.target_block_height);
if (!blockHash) {
  console.error(`Block ${data.target_block_height} is not mined yet.`);
  process.exit(1);
}
console.log(`Block ${data.target_block_height} hash (independent source): ${blockHash}`);

const idx = winnerIndex(blockHash, root, data.ticket_leaves.length);
const winner = data.ticket_leaves[idx];
console.log(`Recomputed winner index: ${idx}`);
console.log(`Recomputed winner ticket: ${winner}`);
console.log(`Platform-stored winner:   ${data.stored_winner_leaf}`);

if (data.stored_winner_leaf) {
  if (winner === data.stored_winner_leaf) {
    console.log("✓ VERIFIED — the draw is fair and matches the commitment.");
  } else {
    console.error("✗ WINNER MISMATCH — the platform's result is wrong!");
    process.exit(1);
  }
}
}

void main(id);
