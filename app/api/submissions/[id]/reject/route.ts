import { getSubmission, updateSubmission } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/admin";

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
  updateSubmission(id, { status: "rejected" });
  return Response.json({ ok: true });
}
