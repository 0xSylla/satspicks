import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import type { Raffle, Submission, Ticket } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

let _db: Database.Database | null = null;

export function db(): Database.Database {
  if (_db) return _db;
  mkdirSync(DATA_DIR, { recursive: true });
  _db = new Database(path.join(DATA_DIR, "satspicks.db"));
  _db.pragma("journal_mode = WAL");
  _db.exec(`
    CREATE TABLE IF NOT EXISTS raffles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      image_url TEXT,
      value_fcfa INTEGER NOT NULL,
      ticket_price_sats INTEGER NOT NULL,
      min_tickets INTEGER NOT NULL,
      max_tickets INTEGER NOT NULL,
      deadline TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      merkle_root TEXT,
      target_block_height INTEGER,
      target_block_hash TEXT,
      winner_ticket_id TEXT,
      nostr_event_created TEXT,
      nostr_event_commit TEXT,
      nostr_event_result TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      raffle_id TEXT NOT NULL REFERENCES raffles(id),
      buyer_name TEXT NOT NULL,
      buyer_contact TEXT NOT NULL,
      payment_hash TEXT NOT NULL,
      leaf_hash TEXT NOT NULL,
      bolt11 TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      paid_at TEXT
    );
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      owner_name TEXT NOT NULL,
      owner_contact TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      value_fcfa INTEGER NOT NULL,
      min_proceeds_fcfa INTEGER NOT NULL,
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      raffle_id TEXT,
      created_at TEXT NOT NULL
    );
  `);
  // Migration: older databases had one ticket per invoice (UNIQUE payment_hash)
  // and no leaf_hash column. Rebuild the table, backfilling leaf = payment hash.
  const cols = _db.prepare("PRAGMA table_info(tickets)").all() as {
    name: string;
  }[];
  if (!cols.some((c) => c.name === "leaf_hash")) {
    _db.exec(`
      ALTER TABLE tickets RENAME TO tickets_old;
      CREATE TABLE tickets (
        id TEXT PRIMARY KEY,
        raffle_id TEXT NOT NULL REFERENCES raffles(id),
        buyer_name TEXT NOT NULL,
        buyer_contact TEXT NOT NULL,
        payment_hash TEXT NOT NULL,
        leaf_hash TEXT NOT NULL,
        bolt11 TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL,
        paid_at TEXT
      );
      INSERT INTO tickets (id, raffle_id, buyer_name, buyer_contact, payment_hash,
        leaf_hash, bolt11, status, created_at, paid_at)
        SELECT id, raffle_id, buyer_name, buyer_contact, payment_hash,
          payment_hash, bolt11, status, created_at, paid_at FROM tickets_old;
      DROP TABLE tickets_old;
    `);
  }
  const cols2 = _db.prepare("PRAGMA table_info(tickets)").all() as {
    name: string;
  }[];
  if (!cols2.some((c) => c.name === "buyer_npub")) {
    _db.exec("ALTER TABLE tickets ADD COLUMN buyer_npub TEXT");
  }
  _db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_leaf ON tickets(leaf_hash);
    CREATE INDEX IF NOT EXISTS idx_tickets_payment ON tickets(payment_hash);
    CREATE INDEX IF NOT EXISTS idx_tickets_raffle ON tickets(raffle_id, status);
    CREATE INDEX IF NOT EXISTS idx_tickets_npub ON tickets(buyer_npub);
  `);
  return _db;
}

export function listRaffles(): Raffle[] {
  return db()
    .prepare("SELECT * FROM raffles ORDER BY created_at DESC")
    .all() as Raffle[];
}

export function getRaffle(id: string): Raffle | undefined {
  return db().prepare("SELECT * FROM raffles WHERE id = ?").get(id) as
    | Raffle
    | undefined;
}

export function countPaidTickets(raffleId: string): number {
  const row = db()
    .prepare(
      "SELECT COUNT(*) AS n FROM tickets WHERE raffle_id = ? AND status = 'paid'"
    )
    .get(raffleId) as { n: number };
  return row.n;
}

export function paidTickets(raffleId: string): Ticket[] {
  return db()
    .prepare(
      "SELECT * FROM tickets WHERE raffle_id = ? AND status = 'paid' ORDER BY leaf_hash ASC"
    )
    .all(raffleId) as Ticket[];
}

export function getTicketsByNpub(npub: string): Ticket[] {
  return db()
    .prepare(
      "SELECT * FROM tickets WHERE buyer_npub = ? AND status = 'paid' ORDER BY created_at DESC, leaf_hash ASC"
    )
    .all(npub) as Ticket[];
}

export function getTicketsByPaymentHash(paymentHash: string): Ticket[] {
  return db()
    .prepare(
      "SELECT * FROM tickets WHERE payment_hash = ? ORDER BY leaf_hash ASC"
    )
    .all(paymentHash) as Ticket[];
}

export function getTicketByHash(paymentHash: string): Ticket | undefined {
  return db()
    .prepare("SELECT * FROM tickets WHERE payment_hash = ? LIMIT 1")
    .get(paymentHash) as Ticket | undefined;
}

export function getTicket(id: string): Ticket | undefined {
  return db().prepare("SELECT * FROM tickets WHERE id = ?").get(id) as
    | Ticket
    | undefined;
}

export function insertRaffle(r: Raffle): void {
  db()
    .prepare(
      `INSERT INTO raffles (id, title, description, location, image_url, value_fcfa,
        ticket_price_sats, min_tickets, max_tickets, deadline, status, created_at)
       VALUES (@id, @title, @description, @location, @image_url, @value_fcfa,
        @ticket_price_sats, @min_tickets, @max_tickets, @deadline, @status, @created_at)`
    )
    .run(r as unknown as Record<string, unknown>);
}

export function insertTicket(t: Ticket): void {
  db()
    .prepare(
      `INSERT INTO tickets (id, raffle_id, buyer_name, buyer_contact, payment_hash,
        leaf_hash, buyer_npub, bolt11, status, created_at, paid_at)
       VALUES (@id, @raffle_id, @buyer_name, @buyer_contact, @payment_hash,
        @leaf_hash, @buyer_npub, @bolt11, @status, @created_at, @paid_at)`
    )
    .run(t as unknown as Record<string, unknown>);
}

export function markTicketPaid(paymentHash: string): void {
  db()
    .prepare(
      "UPDATE tickets SET status = 'paid', paid_at = ? WHERE payment_hash = ? AND status = 'pending'"
    )
    .run(new Date().toISOString(), paymentHash);
}

export function insertSubmission(s: Submission): void {
  db()
    .prepare(
      `INSERT INTO submissions (id, owner_name, owner_contact, title, description,
        location, value_fcfa, min_proceeds_fcfa, image_url, status, raffle_id, created_at)
       VALUES (@id, @owner_name, @owner_contact, @title, @description,
        @location, @value_fcfa, @min_proceeds_fcfa, @image_url, @status, @raffle_id, @created_at)`
    )
    .run(s as unknown as Record<string, unknown>);
}

export function listSubmissions(): Submission[] {
  return db()
    .prepare("SELECT * FROM submissions ORDER BY created_at DESC")
    .all() as Submission[];
}

export function getSubmission(id: string): Submission | undefined {
  return db().prepare("SELECT * FROM submissions WHERE id = ?").get(id) as
    | Submission
    | undefined;
}

export function updateSubmission(
  id: string,
  fields: Partial<Submission>
): void {
  const keys = Object.keys(fields);
  if (keys.length === 0) return;
  const sets = keys.map((k) => `${k} = @${k}`).join(", ");
  db()
    .prepare(`UPDATE submissions SET ${sets} WHERE id = @__id`)
    .run({ ...(fields as Record<string, unknown>), __id: id });
}

export function updateRaffle(id: string, fields: Partial<Raffle>): void {
  const keys = Object.keys(fields);
  if (keys.length === 0) return;
  const sets = keys.map((k) => `${k} = @${k}`).join(", ");
  db()
    .prepare(`UPDATE raffles SET ${sets} WHERE id = @__id`)
    .run({ ...(fields as Record<string, unknown>), __id: id });
}
