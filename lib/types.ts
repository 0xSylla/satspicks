export type RaffleStatus = "open" | "closed" | "drawn" | "refunded";

export interface Raffle {
  id: string;
  title: string;
  description: string;
  location: string;
  image_url: string | null;
  value_fcfa: number;
  ticket_price_sats: number;
  min_tickets: number;
  max_tickets: number;
  deadline: string; // ISO date
  status: RaffleStatus;
  merkle_root: string | null;
  target_block_height: number | null;
  target_block_hash: string | null;
  winner_ticket_id: string | null;
  nostr_event_created: string | null;
  nostr_event_commit: string | null;
  nostr_event_result: string | null;
  created_at: string;
}

export type TicketStatus = "pending" | "paid";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface Submission {
  id: string;
  owner_name: string;
  owner_contact: string;
  title: string;
  description: string;
  location: string;
  value_fcfa: number;
  min_proceeds_fcfa: number;
  image_url: string | null;
  status: SubmissionStatus;
  raffle_id: string | null;
  created_at: string;
}

export interface Ticket {
  id: string;
  raffle_id: string;
  buyer_name: string;
  buyer_contact: string;
  payment_hash: string;
  /** Merkle leaf: payment_hash for single purchases,
   *  sha256(payment_hash + ":" + i) for multi-ticket purchases. */
  leaf_hash: string;
  /** Nostr identity of the buyer when they connected a wallet (npub1…). */
  buyer_npub: string | null;
  bolt11: string;
  status: TicketStatus;
  created_at: string;
  paid_at: string | null;
}
