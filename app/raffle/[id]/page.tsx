import Link from "next/link";
import { notFound } from "next/navigation";
import { countPaidTickets, getRaffle, getTicket, paidTickets } from "@/lib/db";
import { btcPriceXof, satsToFcfa } from "@/lib/price";
import BuyTicket from "@/components/BuyTicket";
import BlockCountdown from "@/components/BlockCountdown";
import DrawReveal from "@/components/DrawReveal";
import HouseArt from "@/components/HouseArt";
import Countdown from "@/components/Countdown";

export const dynamic = "force-dynamic";

export default async function RafflePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const raffle = getRaffle(id);
  if (!raffle) notFound();

  const paid = countPaidTickets(id);
  const pct = Math.min(100, Math.round((paid / raffle.min_tickets) * 100));
  const winner = raffle.winner_ticket_id
    ? getTicket(raffle.winner_ticket_id)
    : null;
  const btcXof = await btcPriceXof();
  const priceFcfa = satsToFcfa(raffle.ticket_price_sats, btcXof);
  const title = raffle.title.replace(/^\[DEMO\]\s*/, "");

  // Winner index for the reveal animation (position in the sorted list).
  let winnerIdx = 0;
  if (winner) {
    winnerIdx = paidTickets(id).findIndex(
      (t) => t.id === raffle.winner_ticket_id
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/tombolas"
        className="text-sm text-zinc-600 hover:text-zinc-900"
      >
        ← Toutes les tombolas
      </Link>

      <div className="lg:grid lg:grid-cols-[1fr_400px] lg:items-start lg:gap-10">
        {/* -------- Left column: the property + the story -------- */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-lg shadow-lg">
            {raffle.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={raffle.image_url}
                alt={title}
                className="h-48 w-full object-cover lg:h-80"
              />
            ) : (
              <HouseArt className="h-48 w-full lg:h-80" />
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold lg:text-3xl">{title}</h1>
            <p className="text-zinc-600">{raffle.location}</p>
          </div>

          <p className="whitespace-pre-line text-sm leading-relaxed lg:text-base">
            {raffle.description}
          </p>

          {raffle.status === "drawn" &&
            winner &&
            raffle.target_block_height != null &&
            raffle.target_block_hash &&
            raffle.merkle_root && (
              <DrawReveal
                blockHeight={raffle.target_block_height}
                blockHash={raffle.target_block_hash}
                merkleRoot={raffle.merkle_root}
                nTickets={paid}
                winnerIndex={winnerIdx}
                winnerHash={winner.leaf_hash}
                winnerName={winner.buyer_name}
              />
            )}
        </div>

        {/* -------- Right column: numbers + action (sticky on desktop) -------- */}
        <div className="mt-6 space-y-4 lg:sticky lg:top-20 lg:mt-0">
          <div className="space-y-3 rounded-md border border-black/10 bg-white p-5">
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm lg:flex-col lg:gap-y-3">
              <div>
                <p className="text-zinc-600">Valeur estimée</p>
                <p className="tnum font-semibold">
                  {raffle.value_fcfa.toLocaleString("fr-FR")} FCFA
                </p>
              </div>
              <div>
                <p className="text-zinc-600">Prix du ticket</p>
                <p className="tnum font-semibold text-btc-500">
                  {raffle.ticket_price_sats.toLocaleString("fr-FR")} sats{" "}
                  <span className="font-normal text-zinc-600">
                    ≈ {priceFcfa.toLocaleString("fr-FR")} F
                  </span>
                </p>
              </div>
              <div>
                <p className="text-zinc-600">Clôture</p>
                <p className="font-semibold">
                  {raffle.status === "open" ? (
                    <Countdown deadline={raffle.deadline} />
                  ) : (
                    new Date(raffle.deadline).toLocaleDateString("fr-FR")
                  )}
                </p>
              </div>
            </div>
            <div>
              <div className="h-2 overflow-hidden rounded-sm bg-white">
                <div
                  className="h-full bg-teal-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="tnum mt-1 text-xs text-zinc-600">
                {paid} tickets payés. Seuil minimum {raffle.min_tickets},
                maximum {raffle.max_tickets}. Si le seuil n&apos;est pas
                atteint à la clôture, tous les tickets sont remboursés.
              </p>
            </div>
          </div>

          {raffle.status === "open" && (
            <BuyTicket
              raffleId={raffle.id}
              raffleTitle={title}
              priceSats={raffle.ticket_price_sats}
              priceFcfa={priceFcfa}
            />
          )}

          {raffle.status === "closed" && raffle.target_block_height != null && (
            <>
              <BlockCountdown targetHeight={raffle.target_block_height} />
              <div className="rounded-md bg-white p-4 text-xs text-zinc-700">
                Engagement publié avant le tirage (racine de merkle des {paid}{" "}
                tickets) :{" "}
                <code className="break-all">{raffle.merkle_root}</code>
              </div>
            </>
          )}

          <Link
            href={`/verify/${raffle.id}`}
            className="block rounded-md border border-zinc-900 px-4 py-2 text-center text-sm font-medium hover:bg-white"
          >
            🔍 Vérifier le tirage soi-même
          </Link>
        </div>
      </div>
    </div>
  );
}
