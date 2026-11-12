import Link from "next/link";
import HeroRotator from "@/components/HeroRotator";
import HeroArt from "@/components/HeroArt";
import Reveal from "@/components/Reveal";

export default function Landing() {
  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="py-14 sm:py-24 lg:grid lg:grid-cols-[1fr_380px] lg:items-center lg:gap-12">
        <HeroRotator lang="en" />
        <HeroArt className="hidden w-full lg:block" />
      </section>

      {/* ============ THE PROBLEM ============ */}
      <Reveal as="section" className="border-t border-black/10 py-16">
        <p className="label !text-btc-600">The problem</p>
        <div className="mt-8 grid gap-10 lg:grid-cols-[320px_1fr]">
          <h2 className="text-2xl font-bold leading-snug tracking-tight">
            Selling property in Dakar is an obstacle course.
          </h2>
          <div className="divide-y divide-black/10 border-t border-black/10 lg:border-t-0">
            {[
              [
                "01",
                "Years to sell",
                "Finding one buyer able to pay 35 million FCFA in cash, on an illiquid market. Properties sit idle.",
              ],
              [
                "02",
                "Fraud and opacity",
                "Double sales, fake land titles, unverifiable middlemen. Trust is expensive.",
              ],
              [
                "03",
                "Ownership out of reach",
                "For most people, a down payment on a house will stay out of reach for a lifetime.",
              ],
            ].map(([n, title, body]) => (
              <div
                key={n}
                className="grid gap-2 py-5 sm:grid-cols-[64px_200px_1fr]"
              >
                <span className="tnum text-zinc-400">{n}</span>
                <p className="font-semibold">{title}</p>
                <p className="text-sm leading-relaxed text-zinc-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ============ THE SOLUTION ============ */}
      <Reveal as="section" className="border-t border-black/10 py-16">
        <p className="label !text-btc-600">The solution</p>
        <div className="mt-8 grid gap-10 lg:grid-cols-[320px_1fr]">
          <h2 className="text-2xl font-bold leading-snug tracking-tight">
            A raffle where nobody has to trust anybody.
          </h2>
          <div className="divide-y divide-black/10 border-t border-black/10 lg:border-t-0">
            {[
              [
                "01",
                "Sold in 30 days",
                "The seller sets the minimum amount they want to receive. Thousands of tickets replace the single buyer nobody can find. If the threshold is not reached, everyone is refunded.",
              ],
              [
                "02",
                "Impossible to rig",
                "The ticket list is public and sealed before the draw; the randomness comes from the hash of a future Bitcoin block. The land title is verified and held in escrow by a notary.",
              ],
              [
                "03",
                "Open to everyone",
                "Tickets from 1,000 F, paid in seconds from any phone with a Lightning wallet. No bank account, no paperwork.",
              ],
            ].map(([n, title, body]) => (
              <div
                key={n}
                className="grid gap-2 py-5 sm:grid-cols-[64px_200px_1fr]"
              >
                <span className="tnum text-zinc-400">{n}</span>
                <p className="font-semibold">{title}</p>
                <p className="text-sm leading-relaxed text-zinc-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ============ HOW IT WORKS ============ */}
      <Reveal as="section" className="border-t border-black/10 py-16">
        <p className="label">How it works</p>
        <div className="mt-8 grid gap-px overflow-hidden border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "01",
              "Pick a property",
              "Verified value, land title deposited with a partner notary.",
            ],
            [
              "02",
              "Buy your tickets",
              "From 1,000 F, paid over Lightning from any wallet. No bank account needed.",
            ],
            [
              "03",
              "A block draws the winner",
              "The winner is set by the hash of a future Bitcoin block, unpredictable for everyone.",
            ],
            [
              "04",
              "Keys at the notary",
              "The winner signs at the notary. Threshold not reached: everyone gets refunded.",
            ],
          ].map(([n, title, body]) => (
            <div
              key={n}
              className="bg-white p-6 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <span className="tnum text-sm text-btc-500">{n}</span>
              <p className="mt-3 font-semibold">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {body}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/tombolas"
            className="inline-block bg-btc-500 px-6 py-3 font-semibold text-black hover:bg-btc-600"
          >
            Try my luck
          </Link>
        </div>
      </Reveal>

      {/* ============ THE PROOF ============ */}
      <Reveal as="section" id="preuve" className="border-t border-black/10 py-16">
        <p className="label">Provable fairness</p>
        <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-tight">
          A draw that even we cannot rig.
        </h2>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="divide-y divide-black/10">
            {[
              [
                "Public commitment",
                "Before the draw, the sealed ticket list (merkle root) is published, including on Nostr, a network we do not control.",
              ],
              [
                "Bitcoin randomness",
                "The winner depends on the hash of a future block, produced by global mining. Trying to manipulate it is economically unviable.",
              ],
              [
                "Verifiable at home",
                "Your phone reruns the full computation on each raffle's Verify page. Zero trust required.",
              ],
            ].map(([title, body]) => (
              <div
                key={title}
                className="grid gap-2 py-5 sm:grid-cols-[220px_1fr]"
              >
                <p className="font-semibold">{title}</p>
                <p className="text-sm leading-relaxed text-zinc-600">{body}</p>
              </div>
            ))}
          </div>
          <div className="h-fit border border-black/10 bg-white p-5">
            <p className="label">The draw formula</p>
            <code className="tnum mt-3 block text-sm leading-relaxed text-btc-500">
              winner =
              <br />
              &nbsp;&nbsp;sha256(block_hash
              <br />
              &nbsp;&nbsp;+ ticket_merkle_root)
              <br />
              &nbsp;&nbsp;mod ticket_count
            </code>
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Two public inputs, one standard hash function, one modulo.
              Recomputable by anyone, on any machine.
            </p>
          </div>
        </div>
      </Reveal>

      {/* ============ FAQ ============ */}
      <Reveal as="section" className="border-t border-black/10 py-16">
        <p className="label">Frequently asked questions</p>
        <div className="mt-6 divide-y divide-black/10 border-y border-black/10">
          {[
            [
              "I don't own any bitcoin. How do I buy a ticket?",
              "Install a free Lightning wallet (Phoenix, Wallet of Satoshi…), top it up in FCFA through a local exchange service, scan the ticket's QR code. The payment takes a second.",
            ],
            [
              "What if the minimum threshold isn't reached?",
              "The raffle is cancelled and every participant is refunded in sats. The seller is never forced to let their property go for less.",
            ],
            [
              "How do I check the draw is honest?",
              "Every raffle has a Verify page: the public ticket list, the commitment published before the draw, the Bitcoin block used, and a button that reruns the whole computation in your own browser.",
            ],
            [
              "Who transfers the house to the winner?",
              "A notary. The land title is verified and held in escrow before the raffle opens; the draw designates the buyer, the notary executes the sale like any other transaction.",
            ],
            [
              "Are my tickets recorded on the blockchain?",
              "Payments go through Lightning, Bitcoin's fast layer: instant, nearly free, off-chain. What is anchored to the blockchain is the draw: the sealed ticket list is published beforehand, and the winner depends on the hash of a future Bitcoin block. Your Lightning receipt proves your entry, and the public ticket list lets anyone check nothing was added or removed.",
            ],
          ].map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between font-medium">
                {q}
                <span className="text-zinc-500 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
                {a}
              </p>
            </details>
          ))}
        </div>
      </Reveal>

      {/* ============ FINAL CTA ============ */}
      <Reveal as="section" className="border-t border-black/10 py-16">
        <p className="tnum text-btc-500">suba, sama kër: tomorrow, my home</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          The next draw is already written
          <br />
          into the future of the blockchain.
        </h2>
        <Link
          href="/tombolas"
          className="mt-7 inline-block bg-btc-500 px-8 py-3.5 font-semibold text-black hover:bg-btc-600"
        >
          Try my luck
        </Link>
      </Reveal>
    </div>
  );
}
