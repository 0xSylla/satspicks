# SamaKeur — Provably-Fair Real-Estate Raffles on Bitcoin

> *Sama kër* means "my home" in Wolof.

Selling a plot of land or a house in Senegal (and much of West Africa) is an
obstacle course: illiquid markets, months of searching for a single buyer who
can pay the full price, title fraud, opaque middlemen. Meanwhile, most people
can never save enough for a down payment.

**SamaKeur lets a seller liquify a property through a raffle**: thousands of
low-price tickets paid in sats over Lightning, and a winner picked by a
**provably fair draw anchored in a Bitcoin block hash**, verifiable by
anyone, without trusting the platform.

Built for the [Dakar Bitcoin Hack 2026](https://dakar-bitcoin-hack-2026.devpost.com/) (BTrust / Dakar Bitcoin Days).

## Why Bitcoin makes this better

| Classic web2 raffle (Omaze, Raffall…) | SamaKeur |
|---|---|
| Trust the operator's RNG | `winner = sha256(block_hash ‖ merkle_root) mod n`: randomness comes from Bitcoin's proof-of-work |
| Operator can add ghost tickets after the fact | Ticket set is committed (merkle root) **before** the target block exists, and published on Nostr |
| Needs a bank card | Any Lightning wallet, tickets from ~1,000 FCFA |
| Account + password | No accounts: your Lightning receipt is your ticket, your Nostr key is your identity |

## How the draw works

1. Every paid ticket has a unique **leaf**: the Lightning payment hash for a
   single purchase, or `sha256(payment_hash + ":" + i)` for each ticket of a
   multi-ticket purchase (one invoice can buy up to 100 tickets).
2. At close, leaves are sorted ascending and hashed into a **merkle tree**;
   the root is stored and published on Nostr **before** the draw. A target
   Bitcoin block height is chosen (current tip + 6 in production).
3. Once the target block is mined:
   `winner_index = sha256(block_hash + merkle_root) mod n_tickets`.
4. Anyone can re-verify with public data only: the in-app Verify page (which
   also reruns the math client-side with WebCrypto),
   `GET /api/raffles/<id>/verify`, or `npm run verify -- <raffle-id>`,
   cross-checking the block hash on mempool.space / blockstream.info.

If the minimum ticket threshold isn't reached by the deadline, all tickets
are refunded (Lightning refunds: roadmap item, see below).

## Features

- **Buyer flow**: pick a raffle, buy 1–100 tickets with one Lightning
  invoice (QR + auto-polling), get a collectible ticket with a shareable
  receipt.
- **My tickets**: purchases are remembered on the device, recoverable on any
  device with the payment-hash receipt, or bound to a **Nostr identity**
  (NIP-07 wallet login with manual npub fallback). Winner detection included.
- **Seller flow**: public submission form with a live floor-price
  calculator; admin approves and the raffle is created with parameters
  derived from the seller's minimum proceeds and the live BTC price.
- **Draw day**: live block countdown, then an animated step-by-step reveal
  of the proof (block hash → committed root → winner), with the lifecycle
  (created / commitment / result) published to public Nostr relays.
- **Bilingual landing**: English by default at `/`, French at `/fr`.

## Quickstart (demo mode — no Lightning node needed)

```bash
npm install
cp .env.example .env     # set ADMIN_KEY
npm run seed             # inserts a demo raffle
npm run dev              # http://localhost:3000
```

Demo happy path: open a raffle → buy tickets → click **"Simuler le
paiement"** → go to `/admin`, enter your `ADMIN_KEY` → **Clôturer (commit)**
→ **Tirer au sort** → open the raffle's **Verify** page, or run:

```bash
npm run verify -- <raffle-id>
```

> Demo mode uses simulated invoices and the current Bitcoin tip as the draw
> block, so the whole flow runs in under a minute. The block hash and the
> verification math are **real** in both modes.

## Real Lightning mode (LNbits)

```bash
docker compose up -d     # LNbits with FakeWallet backend on :5000
```

Create a wallet in the LNbits UI, then in `.env`:

```
DEMO_MODE=false
LNBITS_URL=http://localhost:5000
LNBITS_INVOICE_KEY=<your invoice/read key>
```

Invoices are now real BOLT11s created and settled through LNbits. Point
`LNBITS_URL` at any LNbits instance for production. In this mode the draw
block is **tip + 6** (~1 hour), so the commitment provably precedes the
randomness.

## Nostr

- **Transparency**: with `NOSTR_NSEC` set (`npm run seed -- --gen-nsec`),
  raffle creation, the merkle commitment and the final result are published
  as signed notes (tag `#samakeur`) to public relays.
- **Identity**: buyers can connect a NIP-07 wallet (Alby, nos2x…) or paste
  their npub; tickets are bound to it and retrievable from any device via
  `GET /api/my-tickets?npub=…`.

## Architecture

```
app/                    Next.js 15 (App Router)
  page.tsx              landing (EN), fr/ (FR)
  tombolas/             raffle listing
  raffle/[id]/          detail + Lightning checkout (quantity, QR, polling)
  verify/[id]/          public verification page (client-side recompute)
  mes-tickets/          buyer's tickets (device + Nostr identity)
  proposer/             seller submission form
  admin/                review queue + create / close / draw (x-admin-key)
  api/                  REST endpoints
lib/
  lightning.ts          LNbits client + demo backend (pluggable)
  merkle.ts             sha256 merkle tree, batch leaves, winner formula
  bitcoin.ts            block hashes via Esplora APIs with fallback
  nostr.ts              best-effort relay publishing (nostr-tools)
  nostr-client.ts       NIP-07 login helpers
  draw.ts               close (commit) + draw logic
  db.ts                 SQLite (better-sqlite3, WAL, auto-migrations)
scripts/
  seed.ts               demo data + Nostr keygen
  verify.ts             independent, out-of-band draw verifier
```

## Security notes (threat model)

- **Rigged draw** → prevented by commit-before-randomness: the merkle root
  is fixed and published (Nostr) before the target block exists. A miner
  willing to re-roll the draw must discard a full block reward, which is
  economically unviable at raffle scale; for very large prizes, derive the
  seed from N consecutive blocks.
- **Why not a VRF?** Chainlink-style VRFs live on EVM chains and add an
  oracle trust assumption; the Bitcoin block hash is a public randomness
  beacon verifiable with a plain sha256. drand mixing is on the roadmap for
  belt-and-braces.
- **Ghost / removed tickets** → any participant can check their leaf is in
  the public list; the recomputed root must match the commitment.
- **Admin endpoints** → constant-time key comparison, no session state.
- **Payments** → handled by LNbits; the app never touches private keys. The
  simulate endpoint is hard-disabled outside demo mode.
- **Privacy** → contact details are never exposed by any public API; ticket
  lookup requires the payment-hash receipt.

## Honest limitations & roadmap

- **Legal**: raffles/games of chance are regulated (in Senegal, LONASE holds
  a monopoly). This prototype is a technology demonstration; a real launch
  needs a compliant structure (partnership or skill-competition model, as UK
  house raffles did).
- **Title transfer stays off-chain**: the draw designates the winner; a
  notary executes the deed, with the title held in escrow before opening.
- **Refunds**: automatic Lightning refunds below the threshold are specified
  but not yet wired (hold invoices / LNURL-withdraw).
- Next: NIP-98 signed-request auth, LNURL-auth, notary onboarding flow,
  USSD/SMS tickets for feature phones, DLC-based payout escrow.

## License

MIT — built in public for the Dakar Bitcoin Hack 2026.
