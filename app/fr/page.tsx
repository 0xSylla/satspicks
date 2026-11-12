import Link from "next/link";
import HeroRotator from "@/components/HeroRotator";
import HeroArt from "@/components/HeroArt";
import Reveal from "@/components/Reveal";

export default function Landing() {
  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="py-14 sm:py-24 lg:grid lg:grid-cols-[1fr_380px] lg:items-center lg:gap-12">
        <HeroRotator />
        <HeroArt className="hidden w-full lg:block" />
      </section>

      {/* ============ LE PROBLÈME ============ */}
      <Reveal as="section" className="border-t border-black/10 py-16">
        <p className="label !text-btc-600">Le problème</p>
        <div className="mt-8 grid gap-10 lg:grid-cols-[320px_1fr]">
        <h2 className="text-2xl font-bold leading-snug tracking-tight">
          Vendre un bien à Dakar est un parcours du combattant.
        </h2>
        <div className="divide-y divide-black/10 border-t border-black/10 lg:border-t-0">
          {[
            [
              "01",
              "Des années pour vendre",
              "Trouver un acheteur capable de payer 35 millions cash, sur un marché illiquide. Les biens dorment.",
            ],
            [
              "02",
              "Fraude et opacité",
              "Doubles ventes, faux titres, intermédiaires invérifiables. La confiance coûte cher.",
            ],
            [
              "03",
              "La propriété inaccessible",
              "Pour la majorité, l'apport d'une maison restera hors de portée toute une vie.",
            ],
          ].map(([n, title, body]) => (
            <div key={n} className="grid gap-2 py-5 sm:grid-cols-[64px_200px_1fr]">
              <span className="tnum text-zinc-400">{n}</span>
              <p className="font-semibold">{title}</p>
              <p className="text-sm leading-relaxed text-zinc-600">{body}</p>
            </div>
          ))}
        </div>
        </div>
      </Reveal>

      {/* ============ LA SOLUTION ============ */}
      <Reveal as="section" className="border-t border-black/10 py-16">
        <p className="label !text-btc-600">La solution</p>
        <div className="mt-8 grid gap-10 lg:grid-cols-[320px_1fr]">
          <h2 className="text-2xl font-bold leading-snug tracking-tight">
            Une tombola où personne n&apos;a besoin de faire confiance à
            personne.
          </h2>
          <div className="divide-y divide-black/10 border-t border-black/10 lg:border-t-0">
            {[
              [
                "01",
                "Vendu en 30 jours",
                "Le vendeur fixe le montant minimum qu'il veut toucher. Des milliers de tickets remplacent l'acheteur unique introuvable. Si le seuil n'est pas atteint, tout le monde est remboursé.",
              ],
              [
                "02",
                "Impossible à truquer",
                "La liste des tickets est publique et scellée avant le tirage ; le hasard vient du hash d'un bloc Bitcoin futur. Le titre foncier est vérifié et séquestré chez un notaire.",
              ],
              [
                "03",
                "Ouvert à tous",
                "Un ticket dès 1 000 F, payé en quelques secondes depuis n'importe quel téléphone avec un wallet Lightning. Pas de compte bancaire, pas de paperasse.",
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

      {/* ============ COMMENT ÇA MARCHE ============ */}
      <Reveal as="section" className="border-t border-black/10 py-16">
        <p className="label">Comment ça marche</p>
        <div className="mt-8 grid gap-px overflow-hidden border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "01",
              "Choisissez un bien",
              "Valeur vérifiée, titre foncier déposé chez un notaire partenaire.",
            ],
            [
              "02",
              "Achetez vos tickets",
              "Dès 1 000 F, payés en Lightning depuis n'importe quel wallet. Pas de compte bancaire.",
            ],
            [
              "03",
              "Le bloc tire au sort",
              "Le gagnant est désigné par le hash d'un bloc Bitcoin futur, imprévisible pour tous.",
            ],
            [
              "04",
              "Les clés chez le notaire",
              "Le gagnant signe chez le notaire. Seuil non atteint : tout le monde est remboursé.",
            ],
          ].map(([n, title, body]) => (
            <div key={n} className="bg-white p-6 transition-transform duration-200 hover:-translate-y-0.5">
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
            Tenter ma chance
          </Link>
        </div>
      </Reveal>

      {/* ============ LA PREUVE ============ */}
      <Reveal as="section" id="preuve" className="border-t border-black/10 py-16">
        <p className="label">Équité prouvable</p>
        <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-tight">
          Un tirage que même nous ne pouvons pas truquer.
        </h2>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="divide-y divide-black/10">
            {[
              [
                "Engagement public",
                "Avant le tirage, la liste scellée des tickets (racine de merkle) est publiée, y compris sur Nostr, un réseau que nous ne contrôlons pas.",
              ],
              [
                "Hasard de Bitcoin",
                "Le gagnant dépend du hash d'un bloc futur, produit par le minage mondial. Essayer de le manipuler est économiquement non viable.",
              ],
              [
                "Vérifiable chez vous",
                "Votre téléphone refait le calcul complet sur la page « Vérifier » de chaque tombola. Zéro confiance requise.",
              ],
            ].map(([title, body]) => (
              <div key={title} className="grid gap-2 py-5 sm:grid-cols-[220px_1fr]">
                <p className="font-semibold">{title}</p>
                <p className="text-sm leading-relaxed text-zinc-600">{body}</p>
              </div>
            ))}
          </div>
          <div className="h-fit border border-black/10 bg-white p-5">
            <p className="label">La formule du tirage</p>
            <code className="tnum mt-3 block text-sm leading-relaxed text-btc-500">
              gagnant =
              <br />
              &nbsp;&nbsp;sha256(hash_du_bloc
              <br />
              &nbsp;&nbsp;+ racine_des_tickets)
              <br />
              &nbsp;&nbsp;mod nombre_de_tickets
            </code>
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Deux entrées publiques, une fonction de hachage standard, un
              modulo. Recalculable par n&apos;importe qui, sur n&apos;importe
              quelle machine.
            </p>
          </div>
        </div>
      </Reveal>

      {/* ============ FAQ ============ */}
      <Reveal as="section" className="border-t border-black/10 py-16">
        <p className="label">Questions fréquentes</p>
        <div className="mt-6 divide-y divide-black/10 border-y border-black/10">
          {[
            [
              "Je n'ai pas de bitcoins. Comment j'achète un ticket ?",
              "Installez un wallet Lightning gratuit (Phoenix, Wallet of Satoshi…), rechargez-le en FCFA via un service local d'échange, scannez le QR du ticket. Le paiement prend une seconde.",
            ],
            [
              "Et si le seuil minimum n'est pas atteint ?",
              "La tombola est annulée et chaque participant est remboursé en sats. Le vendeur n'est jamais forcé de brader son bien.",
            ],
            [
              "Comment je vérifie que le tirage est honnête ?",
              "Chaque tombola a une page « Vérifier » : la liste publique des tickets, l'engagement publié avant le tirage, le bloc Bitcoin utilisé, et un bouton qui refait tout le calcul dans votre propre navigateur.",
            ],
            [
              "Qui transfère la maison au gagnant ?",
              "Un notaire. Le titre foncier est vérifié et séquestré avant l'ouverture de la tombola ; le tirage désigne l'acheteur, le notaire exécute la vente comme pour n'importe quelle transaction.",
            ],
            [
              "Mes tickets sont-ils enregistrés sur la blockchain ?",
              "Le paiement passe par Lightning, la couche rapide de Bitcoin : instantané, quasi gratuit, hors chaîne. Ce qui est ancré dans la blockchain, c'est le tirage : la liste scellée des tickets est publiée avant, et le gagnant dépend du hash d'un bloc Bitcoin futur. Votre reçu Lightning prouve votre participation, et la liste publique des tickets permet à chacun de vérifier que rien n'a été ajouté ou retiré.",
            ],
          ].map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between font-medium">
                {q}
                <span className="text-zinc-500 group-open:rotate-45 transition-transform">
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

      {/* ============ CTA FINAL ============ */}
      <Reveal as="section" className="border-t border-black/10 py-16">
        <p className="tnum text-btc-500">des sats aujourd'hui, les clés demain</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Le prochain tirage est déjà inscrit
          <br />
          dans le futur de la blockchain.
        </h2>
        <Link
          href="/tombolas"
          className="mt-7 inline-block bg-btc-500 px-8 py-3.5 font-semibold text-black hover:bg-btc-600"
        >
          Tenter ma chance
        </Link>
      </Reveal>
    </div>
  );
}
