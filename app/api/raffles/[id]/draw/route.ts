import { isAdmin, unauthorized } from "@/lib/admin";
import { drawRaffle } from "@/lib/draw";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) return unauthorized();
  const { id } = await params;
  try {
    const result = await drawRaffle(id);
    return Response.json(result);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "draw failed" },
      { status: 400 }
    );
  }
}
