import { timingSafeEqual } from "node:crypto";

export function isAdmin(req: Request): boolean {
  const provided = req.headers.get("x-admin-key") ?? "";
  const expected = process.env.ADMIN_KEY ?? "";
  if (!expected || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export function unauthorized(): Response {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}
