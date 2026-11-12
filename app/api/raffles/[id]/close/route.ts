import { isAdmin, unauthorized } from "@/lib/admin";
import { closeRaffle } from "@/lib/draw";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) return unauthorized();
  const { id } = await params;
  try {
    const result = await closeRaffle(id);
    return Response.json(result);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "close failed" },
      { status: 400 }
    );
  }
}
