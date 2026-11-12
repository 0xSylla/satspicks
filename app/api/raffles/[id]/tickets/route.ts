import { randomUUID } from "node:crypto";
import { nip19 } from "nostr-tools";
import { countPaidTickets, getRaffle, insertTicket } from "@/lib/db";
import { createInvoice } from "@/lib/lightning";
import { batchLeaf } from "@/lib/merkle";
import type { Ticket } from "@/lib/types";

const MAX_PER_PURCHASE = 100;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const raffle = getRaffle(id);
  if (!raffle) return Response.json({ error: "not found" }, { status: 404 });
  if (raffle.status !== "open")
    return Response.json({ error: "raffle is not open" }, { status: 400 });

  const body = await req.json();
  const name = String(body.buyer_name ?? "").trim().slice(0, 100);
  const contact = String(body.buyer_contact ?? "").trim().slice(0, 200);
  if (!name || !contact)
    return Response.json(
      { error: "buyer_name and buyer_contact are required" },
      { status: 400 }
    );

  let buyerNpub: string | null = null;
  if (typeof body.buyer_npub === "string" && body.buyer_npub.trim()) {
    try {
      if ((nip19.decode(body.buyer_npub.trim()) as { type: string }).type === "npub")
        buyerNpub = body.buyer_npub.trim();
    } catch {
      // invalid npub: ignore rather than fail the purchase
    }
  }

  const quantity = Math.min(
    MAX_PER_PURCHASE,
    Math.max(1, Math.floor(Number(body.quantity) || 1))
  );
  const remaining = raffle.max_tickets - countPaidTickets(id);
  if (remaining <= 0)
    return Response.json({ error: "sold out" }, { status: 400 });
  if (quantity > remaining)
    return Response.json(
      { error: `only ${remaining} tickets left` },
      { status: 400 }
    );

  const amountSats = raffle.ticket_price_sats * quantity;
  const invoice = await createInvoice(
    amountSats,
    `SamaKeur ${quantity} ticket${quantity > 1 ? "s" : ""} — ${raffle.title}`
  );

  // One Lightning payment, N verifiable leaves: a single ticket uses the
  // payment hash itself; a batch derives leaf_i = sha256(payment_hash:i).
  const leaves =
    quantity === 1
      ? [invoice.payment_hash]
      : Array.from({ length: quantity }, (_, i) =>
          batchLeaf(invoice.payment_hash, i)
        );

  const now = new Date().toISOString();
  for (const leaf of leaves) {
    const ticket: Ticket = {
      id: randomUUID(),
      raffle_id: id,
      buyer_name: name,
      buyer_contact: contact,
      payment_hash: invoice.payment_hash,
      leaf_hash: leaf,
      buyer_npub: buyerNpub,
      bolt11: invoice.bolt11,
      status: "pending",
      created_at: now,
      paid_at: null,
    };
    insertTicket(ticket);
  }

  return Response.json({
    payment_hash: invoice.payment_hash,
    bolt11: invoice.bolt11,
    amount_sats: amountSats,
    quantity,
    leaf_hashes: leaves,
    demo: invoice.demo,
  });
}
