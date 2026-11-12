import { getRaffle, paidTickets, getTicket } from "@/lib/db";
import { merkleRoot, winnerIndex, sha256Hex } from "@/lib/merkle";

/** Public verification data: everything anyone needs to recompute the draw
 *  independently (ticket leaves, merkle root, block hash, winner index). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const raffle = getRaffle(id);
  if (!raffle) return Response.json({ error: "not found" }, { status: 404 });

  const tickets = paidTickets(id);
  const leaves = tickets.map((t) => t.leaf_hash);
  const recomputedRoot = leaves.length > 0 ? merkleRoot(leaves) : null;

  let recomputedWinner: {
    index: number;
    leaf_hash: string;
    combined_hash: string;
  } | null = null;
  if (raffle.target_block_hash && recomputedRoot && leaves.length > 0) {
    const idx = winnerIndex(
      raffle.target_block_hash,
      recomputedRoot,
      leaves.length
    );
    recomputedWinner = {
      index: idx,
      leaf_hash: leaves[idx],
      combined_hash: sha256Hex(
        raffle.target_block_hash.toLowerCase() + recomputedRoot.toLowerCase()
      ),
    };
  }

  const winnerTicket = raffle.winner_ticket_id
    ? getTicket(raffle.winner_ticket_id)
    : null;

  return Response.json({
    raffle_id: raffle.id,
    title: raffle.title,
    status: raffle.status,
    ticket_leaves: leaves,
    committed_merkle_root: raffle.merkle_root,
    recomputed_merkle_root: recomputedRoot,
    target_block_height: raffle.target_block_height,
    target_block_hash: raffle.target_block_hash,
    stored_winner_leaf: winnerTicket?.leaf_hash ?? null,
    recomputed_winner: recomputedWinner,
    nostr: {
      created: raffle.nostr_event_created,
      commit: raffle.nostr_event_commit,
      result: raffle.nostr_event_result,
    },
    formula:
      "leaf = payment_hash (single purchase) or sha256(payment_hash + ':' + i) (multi-ticket purchase); merkle over leaves sorted ASC, pairs sha256(hexLeft+hexRight), odd node duplicated; winner_index = sha256(block_hash + merkle_root) mod n_tickets",
  });
}
