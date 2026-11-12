import { getTicketByHash, markTicketPaid } from "@/lib/db";
import { checkInvoicePaid } from "@/lib/lightning";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;
  const ticket = getTicketByHash(hash);
  if (!ticket) return Response.json({ error: "not found" }, { status: 404 });

  if (ticket.status === "pending") {
    const paid = await checkInvoicePaid(hash);
    if (paid) {
      markTicketPaid(hash);
      return Response.json({ status: "paid" });
    }
  }
  return Response.json({ status: ticket.status });
}
