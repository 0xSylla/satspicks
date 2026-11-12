"use client";

import { useEffect, useMemo, useState } from "react";

const COLORS = ["#f7931a", "#0d9488", "#e07f06", "#18181b", "#fbbf24"];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: `${(i * 137.5) % 100}%`,
        background: COLORS[i % COLORS.length],
        animationDuration: `${2.4 + ((i * 7) % 20) / 10}s`,
        animationDelay: `${((i * 13) % 15) / 10}s`,
      })),
    []
  );
  return (
    <>
      {pieces.map((style, i) => (
        <span key={i} className="confetti" style={style} />
      ))}
    </>
  );
}

/** Deliberately dark, terminal-like panel on the light theme: this is the
 *  Bitcoin moment of the product and it should read like machinery. */
export default function DrawReveal({
  blockHeight,
  blockHash,
  merkleRoot,
  nTickets,
  winnerIndex,
  winnerHash,
  winnerName,
}: {
  blockHeight: number;
  blockHash: string;
  merkleRoot: string;
  nTickets: number;
  winnerIndex: number;
  winnerHash: string;
  winnerName: string;
}) {
  const [step, setStep] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    setStep(0);
    const timers = [1, 2, 3, 4].map((s) =>
      setTimeout(() => setStep(s), s * 1100)
    );
    return () => timers.forEach(clearTimeout);
  }, [run]);

  const short = (h: string) => `${h.slice(0, 10)}…${h.slice(-8)}`;

  return (
    <div className="relative space-y-3 overflow-hidden rounded-md bg-zinc-950 p-5 text-zinc-100">
      {step >= 4 && <Confetti />}

      <p className="label">Tirage vérifiable, bloc par bloc</p>

      {step >= 1 && (
        <div className="fade-up rounded-sm border border-white/10 p-3 text-sm">
          <p className="text-zinc-400">
            Bloc{" "}
            <span className="tnum">#{blockHeight.toLocaleString("fr-FR")}</span>{" "}
            miné. Hash (blockchain Bitcoin) :
          </p>
          <p className="tnum break-all text-xs text-btc-500">
            {short(blockHash)}
          </p>
        </div>
      )}

      {step >= 2 && (
        <div className="fade-up rounded-sm border border-white/10 p-3 text-sm">
          <p className="text-zinc-400">
            + Racine de merkle des {nTickets} tickets, engagée{" "}
            <strong className="text-zinc-100">avant</strong> le bloc :
          </p>
          <p className="tnum break-all text-xs text-teal-400">
            {short(merkleRoot)}
          </p>
        </div>
      )}

      {step >= 3 && (
        <div className="fade-up rounded-sm border border-white/10 p-3 text-sm">
          <p className="text-zinc-400">
            = sha256(bloc + racine) mod {nTickets} →{" "}
            <span className="tnum text-xl font-bold text-zinc-100">
              ticket n°{winnerIndex + 1}
            </span>
          </p>
        </div>
      )}

      {step >= 4 && (
        <div className="fade-up rounded-sm bg-btc-500 p-4 text-center text-black">
          <p className="text-2xl font-extrabold">{winnerName}</p>
          <p className="tnum mt-1 break-all text-[10px]">{winnerHash}</p>
        </div>
      )}

      {step >= 4 && (
        <button
          onClick={() => setRun((r) => r + 1)}
          className="text-xs text-zinc-400 underline underline-offset-4"
        >
          Rejouer l&apos;animation
        </button>
      )}
    </div>
  );
}
