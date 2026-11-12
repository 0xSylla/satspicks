import { randomUUID } from "node:crypto";
import { insertRaffle, updateRaffle } from "./db";
import { publishRaffleEvent } from "./nostr";
import type { Raffle } from "./types";

export interface RaffleInput {
  title: string;
  description: string;
  location: string;
  image_url?: string | null;
  value_fcfa: number;
  ticket_price_sats: number;
  min_tickets: number;
  max_tickets: number;
  deadline: string;
}

/** Creates a raffle and publishes its birth on Nostr (best-effort). */
export async function createRaffle(input: RaffleInput): Promise<Raffle> {
  const raffle: Raffle = {
    id: randomUUID(),
    title: input.title.slice(0, 200),
    description: input.description.slice(0, 5000),
    location: input.location.slice(0, 200),
    image_url: input.image_url ? input.image_url.slice(0, 1000) : null,
    value_fcfa: Math.max(1, Math.floor(input.value_fcfa)),
    ticket_price_sats: Math.max(1, Math.floor(input.ticket_price_sats)),
    min_tickets: Math.max(1, Math.floor(input.min_tickets)),
    max_tickets: Math.max(1, Math.floor(input.max_tickets)),
    deadline: input.deadline,
    status: "open",
    merkle_root: null,
    target_block_height: null,
    target_block_hash: null,
    winner_ticket_id: null,
    nostr_event_created: null,
    nostr_event_commit: null,
    nostr_event_result: null,
    created_at: new Date().toISOString(),
  };
  insertRaffle(raffle);
  const nostrId = await publishRaffleEvent("created", {
    raffle_id: raffle.id,
    title: raffle.title,
    location: raffle.location,
    ticket_price_sats: raffle.ticket_price_sats,
    min_tickets: raffle.min_tickets,
    max_tickets: raffle.max_tickets,
    deadline: raffle.deadline,
  });
  if (nostrId) {
    updateRaffle(raffle.id, { nostr_event_created: nostrId });
    raffle.nostr_event_created = nostrId;
  }
  return raffle;
}
