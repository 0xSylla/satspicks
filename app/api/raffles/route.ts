import { countPaidTickets, listRaffles } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/admin";
import { createRaffle } from "@/lib/raffle-service";

export async function GET() {
  const raffles = listRaffles().map((r) => ({
    ...r,
    paid_tickets: countPaidTickets(r.id),
  }));
  return Response.json({ raffles });
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  const body = await req.json();
  const required = [
    "title",
    "description",
    "location",
    "value_fcfa",
    "ticket_price_sats",
    "min_tickets",
    "max_tickets",
    "deadline",
  ];
  for (const k of required) {
    if (body[k] === undefined || body[k] === "")
      return Response.json({ error: `missing field: ${k}` }, { status: 400 });
  }
  const raffle = await createRaffle({
    title: String(body.title),
    description: String(body.description),
    location: String(body.location),
    image_url: body.image_url ? String(body.image_url) : null,
    value_fcfa: Number(body.value_fcfa),
    ticket_price_sats: Number(body.ticket_price_sats),
    min_tickets: Number(body.min_tickets),
    max_tickets: Number(body.max_tickets),
    deadline: String(body.deadline),
  });
  return Response.json({ raffle });
}
