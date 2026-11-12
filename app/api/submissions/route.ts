import { randomUUID } from "node:crypto";
import { insertSubmission, listSubmissions } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/admin";
import type { Submission } from "@/lib/types";

/** Public: a property owner proposes their asset for a raffle. */
export async function POST(req: Request) {
  const body = await req.json();
  const required = [
    "owner_name",
    "owner_contact",
    "title",
    "description",
    "location",
    "value_fcfa",
    "min_proceeds_fcfa",
  ];
  for (const k of required) {
    if (body[k] === undefined || String(body[k]).trim() === "")
      return Response.json({ error: `missing field: ${k}` }, { status: 400 });
  }
  const valueFcfa = Math.floor(Number(body.value_fcfa));
  const minProceeds = Math.floor(Number(body.min_proceeds_fcfa));
  if (!Number.isFinite(valueFcfa) || valueFcfa <= 0)
    return Response.json({ error: "invalid value_fcfa" }, { status: 400 });
  if (
    !Number.isFinite(minProceeds) ||
    minProceeds <= 0 ||
    minProceeds > valueFcfa * 2
  )
    return Response.json({ error: "invalid min_proceeds_fcfa" }, { status: 400 });

  const submission: Submission = {
    id: randomUUID(),
    owner_name: String(body.owner_name).trim().slice(0, 100),
    owner_contact: String(body.owner_contact).trim().slice(0, 200),
    title: String(body.title).trim().slice(0, 200),
    description: String(body.description).trim().slice(0, 5000),
    location: String(body.location).trim().slice(0, 200),
    value_fcfa: valueFcfa,
    min_proceeds_fcfa: minProceeds,
    image_url: body.image_url ? String(body.image_url).slice(0, 1000) : null,
    status: "pending",
    raffle_id: null,
    created_at: new Date().toISOString(),
  };
  insertSubmission(submission);
  return Response.json({ submission_id: submission.id });
}

/** Admin: review queue. */
export async function GET(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  return Response.json({ submissions: listSubmissions() });
}
