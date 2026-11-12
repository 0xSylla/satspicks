import { getRaffle, paidTickets, updateRaffle } from "./db";
import { merkleRoot, winnerIndex } from "./merkle";
import { currentTipHeight, blockHashAt } from "./bitcoin";
import { publishRaffleEvent } from "./nostr";
import { isDemoMode } from "./lightning";

/** In production the draw block is 6 blocks in the future (~1h), so the
 *  commitment provably precedes the randomness. In demo mode we use the
 *  current tip so judges can run the full flow instantly. */
const BLOCK_OFFSET_PROD = 6;

export async function closeRaffle(raffleId: string) {
  const raffle = getRaffle(raffleId);
  if (!raffle) throw new Error("raffle not found");
  if (raffle.status !== "open") throw new Error("raffle is not open");

  const tickets = paidTickets(raffleId); // sorted by leaf_hash ASC
  if (tickets.length === 0) throw new Error("no paid tickets to draw from");

  const root = merkleRoot(tickets.map((t) => t.leaf_hash));
  const tip = await currentTipHeight();
  const target = isDemoMode() ? tip : tip + BLOCK_OFFSET_PROD;

  const nostrId = await publishRaffleEvent("commit", {
    raffle_id: raffleId,
    title: raffle.title,
    merkle_root: root,
    n_tickets: tickets.length,
    target_block_height: target,
  });

  updateRaffle(raffleId, {
    status: "closed",
    merkle_root: root,
    target_block_height: target,
    nostr_event_commit: nostrId,
  });

  return { merkle_root: root, target_block_height: target, n_tickets: tickets.length };
}

export async function drawRaffle(raffleId: string) {
  const raffle = getRaffle(raffleId);
  if (!raffle) throw new Error("raffle not found");
  if (raffle.status !== "closed") throw new Error("raffle is not closed");
  if (!raffle.merkle_root || raffle.target_block_height == null)
    throw new Error("raffle has no commitment");

  const blockHash = await blockHashAt(raffle.target_block_height);
  if (!blockHash)
    throw new Error(
      `target block ${raffle.target_block_height} not mined yet — try again later`
    );

  const tickets = paidTickets(raffleId); // sorted by leaf_hash ASC
  const idx = winnerIndex(blockHash, raffle.merkle_root, tickets.length);
  const winner = tickets[idx];

  const nostrId = await publishRaffleEvent("result", {
    raffle_id: raffleId,
    title: raffle.title,
    block_height: raffle.target_block_height,
    block_hash: blockHash,
    merkle_root: raffle.merkle_root,
    n_tickets: tickets.length,
    winner_index: idx,
    winner_leaf_hash: winner.leaf_hash,
  });

  updateRaffle(raffleId, {
    status: "drawn",
    target_block_hash: blockHash,
    winner_ticket_id: winner.id,
    nostr_event_result: nostrId,
  });

  return {
    block_hash: blockHash,
    winner_index: idx,
    winner_ticket_id: winner.id,
    winner_name: winner.buyer_name,
  };
}
