import { nip19 } from "nostr-tools";
import { getRaffle, getTicket, getTicketsByNpub } from "@/lib/db";
import type { Ticket } from "@/lib/types";

/** Tickets bound to a Nostr identity, grouped by purchase. The data returned
 *  (leaves, raffle, first name) is already public in the draw's ticket list;
 *  contact details are never exposed. Roadmap: NIP-98 signed-request auth. */
export async function GET(req: Request) {
  const npub = new URL(req.url).searchParams.get("npub")?.trim() ?? "";
  try {
    if ((nip19.decode(npub) as { type: string }).type !== "npub") throw new Error();
  } catch {
    return Response.json({ error: "invalid npub" }, { status: 400 });
  }

  const tickets = getTicketsByNpub(npub);
  const byPurchase = new Map<string, Ticket[]>();
  for (const t of tickets) {
    const list = byPurchase.get(t.payment_hash) ?? [];
    list.push(t);
    byPurchase.set(t.payment_hash, list);
  }

  const purchases = [...byPurchase.entries()].map(([paymentHash, rows]) => {
    const raffle = getRaffle(rows[0].raffle_id);
    const winner = raffle?.winner_ticket_id
      ? getTicket(raffle.winner_ticket_id)
      : null;
    return {
      payment_hash: paymentHash,
      raffle_id: rows[0].raffle_id,
      raffle_title: raffle?.title ?? "Tombola",
      raffle_status: raffle?.status ?? "open",
      winner_leaf: winner?.leaf_hash ?? null,
      buyer_name: rows[0].buyer_name,
      leaf_hashes: rows.map((r) => r.leaf_hash).sort(),
      date: rows[0].created_at,
    };
  });

  return Response.json({ npub, purchases });
}
