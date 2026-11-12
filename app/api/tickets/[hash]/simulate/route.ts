import { getTicketByHash, markTicketPaid } from "@/lib/db";
import { isDemoMode } from "@/lib/lightning";

/** Demo-mode only: marks a pending ticket as paid, standing in for a real
 *  Lightning settlement so the full flow can be demonstrated offline. */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  if (!isDemoMode())
    return Response.json(
      { error: "simulation disabled outside demo mode" },
      { status: 403 }
    );
  const { hash } = await params;
  const ticket = getTicketByHash(hash);
  if (!ticket) return Response.json({ error: "not found" }, { status: 404 });
  markTicketPaid(hash);
  return Response.json({ status: "paid" });
}
