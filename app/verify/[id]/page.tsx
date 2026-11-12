import Link from "next/link";
import { notFound } from "next/navigation";
import { getRaffle, paidTickets } from "@/lib/db";
import { merkleRoot, winnerIndex, sha256Hex } from "@/lib/merkle";
import VerifyClient from "@/components/VerifyClient";

export const dynamic = "force-dynamic";

function Step({
  n,
  done,
  title,
  children,
}: {
  n: number;
  done: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-sm font-bold ${
          done ? "bg-teal-700 text-white" : "bg-white text-zinc-600"
        }`}
      >
        {done ? "✓" : n}
      </span>
      <div className="min-w-0 pb-5">
        <p className="font-semibold">{title}</p>
        <div className="mt-1 text-sm text-zinc-700">{children}</div>
      </div>
    </li>
  );
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const raffle = getRaffle(id);
  if (!raffle) notFound();

  const tickets = paidTickets(id);
  const hashes = tickets.map((t) => t.leaf_hash);
  const root = hashes.length > 0 ? merkleRoot(hashes) : null;
  const rootMatches = root !== null && root === raffle.merkle_root;

  let winner: { index: number; hash: string; combined: string } | null = null;
  if (raffle.target_block_hash && root && hashes.length > 0) {
    const idx = winnerIndex(raffle.target_block_hash, root, hashes.length);
    winner = {
      index: idx,
      hash: hashes[idx],
      combined: sha256Hex(
        raffle.target_block_hash.toLowerCase() + root.toLowerCase()
      ),
    };
  }

  const committed = raffle.merkle_root !== null;
  const blockMined = raffle.target_block_hash !== null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/raffle/${id}`}
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← Retour à la tombola
        </Link>
        <h1 className="mt-2 text-2xl font-bold">
          Un tirage que personne ne peut truquer
        </h1>
        <p className="text-sm text-zinc-600">
          {raffle.title.replace(/^\[DEMO\]\s*/, "")}. Voici les 4 étapes,
          toutes vérifiables publiquement.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
      <ol className="rounded-md border border-black/10 bg-white p-5 lg:p-6">
        <Step n={1} done={hashes.length > 0} title="Les tickets sont publics">
          Chaque ticket payé a une empreinte unique : le payment hash Lightning, ou une empreinte qui en dérive pour les achats de plusieurs tickets.{" "}
          <strong className="tnum">{hashes.length}</strong> tickets, liste
          complète en bas de page. Le vôtre doit y figurer.
        </Step>
        <Step n={2} done={committed} title="L'engagement avant le tirage">
          Les tickets sont scellés dans une empreinte unique (racine de
          merkle), publiée <em>avant</em> que le bloc du tirage n&apos;existe
          {raffle.nostr_event_commit ? ", y compris sur Nostr" : ""}.
          {committed && (
            <code className="mt-1 block break-all text-xs">
              {raffle.merkle_root}
            </code>
          )}
          {committed &&
            (rootMatches ? (
              <span className="font-semibold text-teal-600">
                ✓ La liste actuelle correspond à l&apos;engagement.
              </span>
            ) : (
              <span className="font-semibold text-red-600">
                ✗ La liste ne correspond plus : tirage invalide !
              </span>
            ))}
        </Step>
        <Step n={3} done={blockMined} title="Le hasard vient de Bitcoin">
          Le gagnant dépend du hash du bloc{" "}
          <strong className="tnum">
            #{raffle.target_block_height?.toLocaleString("fr-FR") ?? "—"}
          </strong>
          . Ni nous, ni un participant, ni un mineur ne peut le choisir.
          {blockMined && (
            <>
              <code className="mt-1 block break-all text-xs">
                {raffle.target_block_hash}
              </code>
              <a
                className="underline"
                href={`https://mempool.space/block/${raffle.target_block_hash}`}
                target="_blank"
                rel="noreferrer"
              >
                voir ce bloc sur mempool.space ↗
              </a>
            </>
          )}
        </Step>
        <Step n={4} done={winner !== null} title="Un simple calcul désigne le gagnant">
          <code>winner = sha256(bloc + racine) mod n_tickets</code>
          {winner && (
            <p className="tnum mt-1">
              → index <strong>{winner.index}</strong> sur {hashes.length} :
              ticket n°{winner.index + 1}
              <code className="block break-all text-xs">{winner.hash}</code>
            </p>
          )}
        </Step>
      </ol>

      <div className="mt-6 space-y-6 lg:mt-0">
      <VerifyClient
        hashes={hashes}
        committedRoot={raffle.merkle_root}
        blockHash={raffle.target_block_hash}
        storedWinnerHash={winner ? winner.hash : null}
      />

      <details className="rounded-md border border-black/10 bg-white p-5 text-sm">
        <summary className="cursor-pointer font-semibold">
          Détails techniques : liste des {hashes.length} tickets et formule
        </summary>
        <p className="mt-3 text-zinc-700">
          Merkle : empreintes des tickets triées par ordre croissant (achat simple : payment hash ; achat multiple : sha256(payment_hash + ':' + i)), paires hachées{" "}
          <code>sha256(hexGauche + hexDroite)</code>, nœud impair dupliqué.
          Vérification hors plateforme : <code>npm run verify -- {id}</code> ou{" "}
          <code>GET /api/raffles/{id}/verify</code>.
        </p>
        {winner && (
          <p className="mt-2 break-all text-zinc-700">
            sha256(bloc + racine) = <code className="text-xs">{winner.combined}</code>
          </p>
        )}
        <ol className="mt-3 list-decimal space-y-1 break-all pl-8 font-mono text-xs text-zinc-700">
          {hashes.map((h, i) => (
            <li
              key={h}
              className={
                winner && i === winner.index
                  ? "font-bold text-teal-600"
                  : undefined
              }
            >
              {h}
            </li>
          ))}
        </ol>
      </details>
      </div>
      </div>
    </div>
  );
}
