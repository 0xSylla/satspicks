import { getSubmission, updateSubmission } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/admin";
import { createRaffle } from "@/lib/raffle-service";
import { btcPriceXof } from "@/lib/price";

/** Admin: approve a submission — creates the raffle. The caller may override
 *  ticket_price_sats / min_tickets / max_tickets / deadline; otherwise they
 *  are derived from the owner's minimum proceeds and the live BTC price. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) return unauthorized();
  const { id } = await params;
  const sub = getSubmission(id);
  if (!sub) return Response.json({ error: "not found" }, { status: 404 });
  if (sub.status !== "pending")
    return Response.json({ error: `already ${sub.status}` }, { status: 400 });

  const body = await req.json().catch(() => ({}));

  const btcXof = await btcPriceXof();
  const defaultTicketSats = 10_000;
  const ticketSats = Math.max(
    1,
    Math.floor(Number(body.ticket_price_sats) || defaultTicketSats)
  );
  const ticketFcfa = (ticketSats / 100_000_000) * btcXof;
  // Enough tickets to guarantee the owner's minimum proceeds, +10% platform margin.
  const derivedMin = Math.ceil((sub.min_proceeds_fcfa * 1.1) / ticketFcfa);
  const minTickets = Math.max(
    1,
    Math.floor(Number(body.min_tickets) || derivedMin)
  );
  const maxTickets = Math.max(
    minTickets,
    Math.floor(Number(body.max_tickets) || minTickets * 3)
  );
  const deadline =
    typeof body.deadline === "string" && body.deadline
      ? body.deadline
      : new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);

  const raffle = await createRaffle({
    title: sub.title,
    description: sub.description,
    location: sub.location,
    image_url: sub.image_url,
    value_fcfa: sub.value_fcfa,
    ticket_price_sats: ticketSats,
    min_tickets: minTickets,
    max_tickets: maxTickets,
    deadline,
  });

  updateSubmission(id, { status: "approved", raffle_id: raffle.id });
  return Response.json({ raffle });
}
