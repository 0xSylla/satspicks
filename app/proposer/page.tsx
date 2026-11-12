import Link from "next/link";
import { btcPriceXof } from "@/lib/price";
import SubmitProperty from "@/components/SubmitProperty";

export const dynamic = "force-dynamic";

export default async function ProposerPage() {
  const btcXof = await btcPriceXof();
  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900">
          ← Accueil
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Proposer mon bien</h1>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-zinc-700">
          Vendez votre terrain, villa ou appartement en semaines plutôt
          qu&apos;en années. Vous fixez le montant minimum que vous voulez
          toucher ; s&apos;il n&apos;est pas atteint, la tombola est annulée et
          les participants remboursés. Vous ne bradez jamais votre bien.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[340px_1fr] lg:items-start lg:gap-10">
        <ol className="grid gap-3 text-sm sm:grid-cols-3 lg:sticky lg:top-20 lg:grid-cols-1">
          {[
            ["1. Vous proposez", "Ce formulaire, 2 minutes, gratuit."],
            [
              "2. On vérifie ensemble",
              "Titre foncier contrôlé et séquestré chez un notaire partenaire, estimation contradictoire.",
            ],
            [
              "3. La tombola est lancée",
              "Tickets en Lightning, tirage vérifiable par tous, vente notariée au gagnant.",
            ],
          ].map(([t, b]) => (
            <li key={t} className="rounded-md bg-white p-4">
              <p className="font-semibold">{t}</p>
              <p className="mt-1 text-zinc-700">{b}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 lg:mt-0">
          <SubmitProperty btcXof={btcXof} />
        </div>
      </div>
    </div>
  );
}
