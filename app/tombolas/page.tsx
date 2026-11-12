import Link from "next/link";
import { countPaidTickets, listRaffles } from "@/lib/db";
import { btcPriceXof, satsToFcfa } from "@/lib/price";
import HouseArt from "@/components/HouseArt";
import Countdown from "@/components/Countdown";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  open: "En cours",
  closed: "Tirage en attente",
  drawn: "Tirée",
  refunded: "Remboursée",
};

export default async function Home() {
  const raffles = listRaffles();
  const btcXof = await btcPriceXof();

  // Featured: the open raffle closest to its minimum threshold.
  const withPaid = raffles.map((r) => ({ r, paid: countPaidTickets(r.id) }));
  const open = withPaid.filter(({ r }) => r.status === "open");
  const featured =
    open.sort((a, b) => b.paid / b.r.min_tickets - a.paid / a.r.min_tickets)[0] ??
    withPaid[0];
  const rest = withPaid.filter((x) => x !== featured);

  return (
    <div className="space-y-8">
      {!featured ? (
        <section className="rounded-md bg-white text-zinc-900 p-6">
          <h1 className="text-2xl font-bold">
            Gagnez une maison.{" "}
            <span className="text-btc-500">Un ticket en sats.</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Aucune tombola pour l&apos;instant. Lancez{" "}
            <code>npm run seed</code> ou créez-en une depuis la page Admin.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-lg bg-white text-zinc-900 shadow-xl">
          <div className="wax-border h-2" />
          <div className="lg:grid lg:grid-cols-2">
          <div className="relative h-52 sm:h-64 lg:h-full lg:min-h-[380px]">
            {featured.r.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.r.image_url}
                alt={featured.r.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
              />
            ) : (
              <HouseArt className="absolute inset-0 h-full w-full" />
            )}
            <span className="absolute left-4 top-4 rounded-sm bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-900">
              {STATUS_LABEL[featured.r.status]}
            </span>
          </div>
          <div className="space-y-4 p-6 lg:p-8">
            <div>
              <h1 className="text-2xl font-bold leading-tight">
                {featured.r.title.replace(/^\[DEMO\]\s*/, "")}
              </h1>
              <p className="text-sm text-zinc-600">{featured.r.location}</p>
            </div>
            <p className="text-sm">
              Valeur estimée :{" "}
              <strong className="tnum">
                {featured.r.value_fcfa.toLocaleString("fr-FR")} FCFA
              </strong>
            </p>
            <div>
              <div className="h-3 overflow-hidden rounded-sm bg-black/10">
                <div
                  className="h-full rounded-sm bg-btc-500 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (featured.paid / featured.r.min_tickets) * 100
                      )
                    )}%`,
                  }}
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-xs text-zinc-600">
                <span className="tnum">
                  {featured.paid} / {featured.r.min_tickets} tickets (seuil
                  min.)
                </span>
                {featured.r.status === "open" && (
                  <Countdown deadline={featured.r.deadline} />
                )}
              </div>
            </div>
            <Link
              href={`/raffle/${featured.r.id}`}
              className="block rounded-md bg-btc-500 px-5 py-3.5 text-center font-bold text-black hover:bg-btc-600"
            >
              Tenter ma chance :{" "}
              <span className="tnum">
                {featured.r.ticket_price_sats.toLocaleString("fr-FR")} sats
              </span>
              <span className="block text-xs font-normal opacity-90">
                ≈{" "}
                {satsToFcfa(
                  featured.r.ticket_price_sats,
                  btcXof
                ).toLocaleString("fr-FR")}{" "}
                FCFA, payable avec n&apos;importe quel wallet Lightning
              </span>
            </Link>
            <p className="text-center text-xs text-zinc-600">
              🔍 Tirage vérifiable par tous, ancré dans un bloc Bitcoin.
              Remboursement intégral si le seuil n&apos;est pas atteint
            </p>
          </div>
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-zinc-700">Autres tombolas</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map(({ r, paid }) => (
              <li
                key={r.id}
                className="flex flex-col gap-2 rounded-md border border-black/10 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-snug">
                    {r.title.replace(/^\[DEMO\]\s*/, "")}
                  </h3>
                  <span className="shrink-0 rounded-sm bg-white px-2 py-0.5 text-xs text-zinc-700">
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-600">{r.location}</p>
                <div className="mt-auto flex items-center justify-between text-sm">
                  <span className="tnum font-semibold text-btc-500">
                    {r.ticket_price_sats.toLocaleString("fr-FR")} sats
                    <span className="block text-xs font-normal text-zinc-600">
                      ≈ {satsToFcfa(r.ticket_price_sats, btcXof).toLocaleString("fr-FR")} F,{" "}
                      {paid} tickets
                    </span>
                  </span>
                  <Link
                    href={`/raffle/${r.id}`}
                    className="rounded-md bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-black/10"
                  >
                    Voir
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-3 lg:gap-4">
        {[
          [
            "Payez en sats",
            "Un ticket depuis 1 000 F, avec n'importe quel wallet Lightning. Pas de compte bancaire requis.",
          ],
          [
            " Hasard de Bitcoin",
            "Le gagnant est désigné par le hash d'un bloc Bitcoin futur. Personne ne peut tricher, pas même nous.",
          ],
          [
            "🔍 Vérifiez vous-même",
            "Liste des tickets publique, engagement avant tirage, recalcul possible sur votre propre téléphone.",
          ],
        ].map(([title, body]) => (
          <div
            key={title}
            className="rounded-md border border-black/10 bg-white p-4"
          >
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm text-zinc-700">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
