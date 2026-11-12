import { getRaffle, getTicketsByPaymentHash } from "@/lib/db";

/** Look up a purchase by its Lightning payment hash (the buyer's receipt).
 *  Returns only data that is already public or belongs to the receipt holder;
 *  the contact detail is never exposed. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;
  if (!/^[0-9a-f]{64}$/i.test(hash))
    return Response.json({ error: "invalid payment hash" }, { status: 400 });
  const tickets = getTicketsByPaymentHash(hash.toLowerCase());
  if (tickets.length === 0)
    return Response.json({ error: "not found" }, { status: 404 });
  const raffle = getRaffle(tickets[0].raffle_id);
  return Response.json({
    payment_hash: hash.toLowerCase(),
    buyer_name: tickets[0].buyer_name,
    status: tickets[0].status,
    leaf_hashes: tickets.map((t) => t.leaf_hash),
    raffle: raffle
      ? { id: raffle.id, title: raffle.title, status: raffle.status }
      : null,
  });
}
