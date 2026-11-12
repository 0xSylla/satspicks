# Devpost submission draft — satsPicks

## Tagline
Win a home with sats: provably-fair real-estate raffles on Bitcoin, Lightning and Nostr.

## Inspiration
Selling land or a house in Senegal can take years: illiquid markets, title
fraud, and buyers who can't finance the full price. In the UK, homeowners
have started raffling their houses instead of selling them. We asked: what
would that look like if the trust problem — "is the draw rigged?" — was
solved by Bitcoin itself?

## What it does
satsPicks lets a property owner sell through a raffle: thousands of tickets at
~1000 FCFA each, paid with any Lightning wallet. The winner is picked by
`sha256(bitcoin_block_hash + merkle_root_of_tickets) mod n_tickets` — the
ticket set is committed and published on Nostr *before* the target block is
mined, so neither the platform nor a participant can cheat. Anyone can
re-verify the draw with public data: an in-app verification page, a public
API, and a standalone CLI verifier. If the minimum ticket threshold isn't
reached, everyone is refunded.

## How we built it
Next.js 15 + SQLite; LNbits for Lightning invoices (pluggable — a demo
backend lets judges run the full flow with zero infrastructure, and
`docker compose up` brings a real LNbits); block hashes from
mempool.space/blockstream.info with fallback; nostr-tools for publishing the
raffle lifecycle (created → commitment → result) to public relays.

## Challenges
- Getting trustless randomness without a VRF: we use commit-reveal against a
  future Bitcoin block hash, with the commitment published on Nostr.
- Making it demoable offline for judging while keeping the cryptography real:
  demo mode simulates only the payment settlement; the merkle commitment,
  block-hash randomness and verification math are identical in both modes.

## Accomplishments
A complete, working end-to-end flow — buy ticket → Lightning invoice → commit
→ draw from a real mainnet block → independent verification passing — in a
mobile-first UI designed for low bandwidth.

## What we learned
Provable fairness is a UX feature: the verification page explains the math in
four steps a non-technical buyer can follow.

## What's next
Notary escrow of the deed before a raffle opens; automatic Lightning refunds
(hold invoices); USSD/SMS tickets for feature phones; legal structuring
(LONASE partnership or skill-competition model); Wolof localization.

## Built with
nextjs, typescript, sqlite, lightning, lnbits, bitcoin, nostr, tailwind

## Demo video outline (3 min)
1. (0:00) The problem: selling property in Dakar — slow, fraud-prone, illiquid.
2. (0:30) Buy a ticket: scan the Lightning QR, instant confirmation.
3. (1:10) Close the raffle: show the merkle commitment + Nostr note.
4. (1:40) Draw: the winner comes from Bitcoin block N's hash — show the block
   on mempool.space.
5. (2:10) Verify: run `npm run verify` live — recomputed winner matches.
6. (2:40) Impact + next steps: notary escrow, refunds, USSD tickets.
