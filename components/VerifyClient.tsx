"use client";

import { useState } from "react";
import {
  merkleRootBrowser,
  winnerIndexBrowser,
} from "@/lib/merkle-client";

type Result = {
  root: string;
  rootOk: boolean;
  index: number | null;
  winnerHash: string | null;
  winnerOk: boolean | null;
};

/** "Don't trust us — your phone can check": recomputes the merkle root and
 *  winner locally with WebCrypto, from the public inputs shown on the page. */
export default function VerifyClient({
  hashes,
  committedRoot,
  blockHash,
  storedWinnerHash,
}: {
  hashes: string[];
  committedRoot: string | null;
  blockHash: string | null;
  storedWinnerHash: string | null;
}) {
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const root = await merkleRootBrowser(hashes);
      let index: number | null = null;
      let winnerHash: string | null = null;
      if (blockHash && hashes.length > 0) {
        index = await winnerIndexBrowser(blockHash, root, hashes.length);
        winnerHash = hashes[index];
      }
      setResult({
        root,
        rootOk: committedRoot !== null && root === committedRoot,
        index,
        winnerHash,
        winnerOk:
          winnerHash && storedWinnerHash ? winnerHash === storedWinnerHash : null,
      });
    } finally {
      setBusy(false);
    }
  }

  if (hashes.length === 0) return null;

  return (
    <div className="rounded-md border-2 border-dashed border-teal-600/40 bg-white p-5 text-sm">
      <h2 className="font-semibold">Ne nous croyez pas sur parole</h2>
      <p className="mt-1 text-zinc-700">
        Votre navigateur peut refaire tout le calcul localement (WebCrypto),
        sans rien demander à nos serveurs.
      </p>
      <button
        onClick={run}
        disabled={busy}
        className="mt-3 rounded-md bg-teal-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Calcul…" : "🔐 Recalculer dans mon navigateur"}
      </button>

      {result && (
        <div className="mt-4 space-y-2 fade-up">
          <p className="break-all">
            Racine recalculée ici : <code className="text-xs">{result.root}</code>
          </p>
          <p>
            {result.rootOk ? (
              <span className="font-semibold text-teal-600">
                ✓ Identique à la racine engagée avant le tirage
              </span>
            ) : committedRoot ? (
              <span className="font-semibold text-red-600">
                ✗ Différente de la racine engagée : tirage invalide !
              </span>
            ) : (
              <span className="text-zinc-600">
                (pas encore de racine engagée : tombola ouverte)
              </span>
            )}
          </p>
          {result.index !== null && (
            <p className="break-all">
              Gagnant recalculé ici : ticket n°{result.index + 1} :{" "}
              <code className="text-xs">{result.winnerHash}</code>{" "}
              {result.winnerOk === true && (
                <span className="font-semibold text-teal-600">
                  ✓ identique au résultat officiel
                </span>
              )}
              {result.winnerOk === false && (
                <span className="font-semibold text-red-600">
                  ✗ différent du résultat officiel !
                </span>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
