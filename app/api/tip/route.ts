import { currentTipHeight } from "@/lib/bitcoin";

export async function GET() {
  try {
    const height = await currentTipHeight();
    return Response.json({ height });
  } catch {
    return Response.json({ error: "block api unreachable" }, { status: 502 });
  }
}
