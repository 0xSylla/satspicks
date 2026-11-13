# satsPicks — Demo video script (3 min, Devpost)

Footage: `demo-video/satspicks-demo.mp4` (1:16, screen capture of the full
flow). Record your voice over it with OBS / CapCut / Descript. Timings below
match the footage; shift them a few seconds if needed. Speak at a calm pace:
the English narration is ~140 words/min.

Structure required by the judges: problem → solution → impact → next steps.

---

## 0:00–0:20 — Hook & problem (over the landing hero, typewriter playing)

**EN narration:**
> "Selling a house in Dakar can take years. You need one buyer with thirty-five
> million francs in cash, on a market full of fake titles and middlemen. And
> for most people, owning a home will never happen. This is satsPicks: become
> a homeowner for the price of a ticket."

**FR :**
> « Vendre une maison à Dakar peut prendre des années : il faut UN acheteur
> avec 35 millions cash, sur un marché miné par les faux titres. Et pour la
> majorité, devenir propriétaire n'arrivera jamais. Voici satsPicks : devenez
> propriétaire pour le prix d'un ticket. »

## 0:20–0:35 — The solution in one sentence (landing scroll: problem/solution/how-it-works sections)

**EN:**
> "A property owner lists their house as a raffle. Thousands of tickets from
> one thousand francs, paid with any Lightning wallet. The seller gets the
> price they set, one participant gets the keys, and the draw is anchored in
> the Bitcoin blockchain, so nobody — not even us — can rig it."

**FR :**
> « Un propriétaire met son bien en tombola. Des milliers de tickets dès
> 1 000 F, payés avec n'importe quel wallet Lightning. Le vendeur touche son
> prix, un participant repart avec les clés, et le tirage est ancré dans la
> blockchain Bitcoin : personne, pas même nous, ne peut tricher. »

## 0:35–0:52 — Buying tickets (raffle page: quantity 5, Lightning QR, collectible ticket)

**EN:**
> "Here's Awa buying five tickets for a villa in Almadies. One Lightning
> invoice covers all five — she scans it with Phoenix or Wallet of Satoshi, no
> bank account, no sign-up. Her payment receipt IS her ticket: each one gets a
> verifiable fingerprint derived from the payment hash."

**FR :**
> « Awa achète cinq tickets pour une villa aux Almadies. Une seule facture
> Lightning couvre les cinq, scannée avec n'importe quel wallet — pas de
> compte bancaire. Son reçu de paiement EST son ticket : chacun reçoit une
> empreinte vérifiable dérivée du payment hash. »

## 0:52–1:05 — Commitment & draw (admin: close → merkle root → draw)

**EN:**
> "When the raffle closes, every ticket is sealed into a merkle root,
> published on Nostr BEFORE the draw block exists. Then Bitcoin does the rest:
> the winner is simply sha-256 of the block hash plus that root, modulo the
> number of tickets."

**FR :**
> « À la clôture, tous les tickets sont scellés dans une racine de merkle,
> publiée sur Nostr AVANT que le bloc du tirage n'existe. Puis Bitcoin fait le
> reste : le gagnant, c'est sha-256 du hash de bloc plus cette racine, modulo
> le nombre de tickets. »

## 1:05–1:20 — The reveal (animated draw: block → root → winner + confetti)

**EN:**
> "Watch the draw happen, step by step: a real mainnet block gets mined, its
> hash meets the sealed ticket list… and Awa wins. No random-number black box.
> Just public math."

**FR :**
> « Regardez le tirage se dérouler : un vrai bloc mainnet est miné, son hash
> rencontre la liste scellée… et Awa gagne. Pas de boîte noire : des maths
> publiques. »

## 1:20–1:40 — Verification (verify page: 4-step explainer, "recompute in my browser", green checks)

**EN:**
> "And here's our favorite feature: don't trust us. Every raffle has a Verify
> page — the full ticket list, the commitment, the block on mempool.space, and
> one button that re-runs the entire computation in YOUR browser with
> WebCrypto. Green checks mean the draw is provably fair."

**FR :**
> « Et notre fonctionnalité préférée : ne nous croyez pas. Chaque tombola a sa
> page Vérifier — liste des tickets, engagement, bloc sur mempool.space, et un
> bouton qui refait TOUT le calcul dans votre navigateur. Coches vertes =
> tirage prouvablement équitable. »

## 1:40–2:10 — Impact & how it's built (closing landing shot, then talk over a slide or the GitHub README)

**EN:**
> "satsPicks turns dead capital into liquid markets for West African property
> owners, and gives first-time buyers a real shot at ownership — with a stack
> that is one hundred percent Bitcoin: Lightning for payments, a block hash
> for randomness, Nostr for transparency and wallet login, LNURL-auth so your
> wallet is literally your account. It's live at satspicks.vercel.app,
> open-source on GitHub, and the whole demo you just saw runs with one
> command."

**FR :**
> « satsPicks rend liquide le capital immobilier dormant d'Afrique de l'Ouest
> et donne aux premiers acheteurs une vraie chance d'accéder à la propriété —
> avec une stack 100% Bitcoin : Lightning pour les paiements, hash de bloc
> pour le hasard, Nostr pour la transparence et le login, LNURL-auth pour que
> votre wallet soit littéralement votre compte. C'est en ligne sur
> satspicks.vercel.app, open-source sur GitHub, et toute la démo tourne en une
> commande. »

## 2:10–2:40 — Next steps & close (slide or face camera)

**EN:**
> "Next: hold invoices so refunds are trustless, notary escrow onboarding,
> USSD tickets for feature phones, and a compliant launch structure with local
> partners. The draw tech is ready today. Suba, sama kër — tomorrow, my home.
> Thank you."

**FR :**
> « La suite : hold invoices pour des remboursements sans confiance,
> l'onboarding notaire, les tickets USSD pour les téléphones simples, et une
> structure de lancement conforme avec des partenaires locaux. La techno de
> tirage, elle, est prête aujourd'hui. Suba, sama kër. Merci. »

---

## Recording tips

- **Voice-over**: play `satspicks-demo.mp4` muted in OBS, record mic on top;
  or import both into CapCut and nudge clips to match your pace.
- The footage is 1:16; the script is ~2:40. Freeze (or slow to 0.5×) the
  verify-page section and the final landing shot to fill, or film yourself
  for the intro (0:00–0:20) and outro (2:10–2:40).
- Re-generate fresh footage any time: `node scripts/record-demo.mjs` (server
  on :3100; stage a new open raffle first — see scripts/.demo-raffle-id).
- Live demo alternative for the jury: everything shown also works on
  https://satspicks.vercel.app (including LNURL-auth with a real phone
  wallet, which the local recording cannot show).

## Submission checklist (deadline Nov 20, 20:00 UTC)

- [ ] Repo public: `gh repo edit 0xSylla/satspicks --visibility public --accept-visibility-change-consequences`
- [ ] Video uploaded (YouTube unlisted works for Devpost)
- [ ] Devpost form: copy from SUBMISSION.md, add repo + live URL + video
- [ ] "Build in public": one post (X/Nostr) with the link and a clip of the draw animation
