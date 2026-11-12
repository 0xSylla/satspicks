/**
 * Seeds a demo raffle. Usage:
 *   npm run seed              -> inserts the demo raffle
 *   npm run seed -- --gen-nsec -> prints a fresh Nostr key pair for .env
 */
import { randomUUID } from "node:crypto";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { insertRaffle, listRaffles } from "../lib/db";

if (process.argv.includes("--gen-nsec")) {
  const sk = generateSecretKey();
  console.log("NOSTR_NSEC=" + nip19.nsecEncode(sk));
  console.log("npub (public): " + nip19.npubEncode(getPublicKey(sk)));
  process.exit(0);
}

const existing = listRaffles();
if (existing.some((r) => r.title.startsWith("[DEMO]"))) {
  console.log("Demo raffle already seeded. Nothing to do.");
  process.exit(0);
}

insertRaffle({
  id: randomUUID(),
  title: "[DEMO] Villa 3 chambres — Keur Massar",
  description:
    "Villa de 3 chambres sur un terrain de 200 m² à Keur Massar, Dakar. " +
    "Titre foncier vérifié par notaire partenaire (démo). " +
    "Le gagnant est désigné par un tirage prouvablement équitable ancré " +
    "dans un bloc Bitcoin ; si le seuil minimum de tickets n'est pas " +
    "atteint, tous les participants sont remboursés via Lightning.",
  location: "Keur Massar, Dakar, Sénégal",
  image_url: null,
  value_fcfa: 35_000_000,
  ticket_price_sats: 10_000,
  min_tickets: 5,
  max_tickets: 5_000,
  deadline: "2026-12-31",
  status: "open",
  merkle_root: null,
  target_block_height: null,
  target_block_hash: null,
  winner_ticket_id: null,
  nostr_event_created: null,
  nostr_event_commit: null,
  nostr_event_result: null,
  created_at: new Date().toISOString(),
});

console.log("✅ Demo raffle seeded. Run `npm run dev` and open http://localhost:3000");
