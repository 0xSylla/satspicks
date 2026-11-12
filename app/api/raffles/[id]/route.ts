import { countPaidTickets, getRaffle, getTicket } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const raffle = getRaffle(id);
  if (!raffle) return Response.json({ error: "not found" }, { status: 404 });
  const winner = raffle.winner_ticket_id ? getTicket(raffle.winner_ticket_id) : null;
  return Response.json({
    raffle,
    paid_tickets: countPaidTickets(id),
    winner: winner
      ? { name: winner.buyer_name, leaf_hash: winner.leaf_hash }
      : null,
  });
}
