"use client";

import { useCallback, useEffect, useState } from "react";

/** Dark terminal-like panel (intentional contrast on the light theme). */
export default function BlockCountdown({
  targetHeight,
}: {
  targetHeight: number;
}) {
  const [tip, setTip] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tip");
      if (res.ok) {
        const data = await res.json();
        setTip(data.height);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const t = setInterval(refresh, 60_000);
    return () => clearInterval(t);
  }, [refresh]);

  const blocksLeft = tip == null ? null : Math.max(0, targetHeight - tip);

  return (
    <div className="rounded-md bg-zinc-950 p-5 text-center text-zinc-100">
      <p className="label">
        Le gagnant sera désigné par le hash du bloc Bitcoin
      </p>
      <p className="tnum mt-2 text-3xl font-bold text-btc-500">
        #{targetHeight.toLocaleString("fr-FR")}
      </p>
      {blocksLeft == null ? (
        <p className="mt-2 text-sm text-zinc-400">
          {loading ? "Hauteur actuelle…" : "Hauteur actuelle indisponible"}
        </p>
      ) : blocksLeft === 0 ? (
        <p className="mt-2 inline-block rounded-sm bg-teal-400/15 px-3 py-1 text-sm font-semibold text-teal-300">
          Bloc miné : le tirage peut être effectué
        </p>
      ) : (
        <p className="tnum mt-2 text-sm text-zinc-400">
          encore <strong className="text-zinc-100">{blocksLeft}</strong> bloc
          {blocksLeft > 1 ? "s" : ""} (~{blocksLeft * 10} min). Personne ne
          peut prédire ce hash
        </p>
      )}
    </div>
  );
}
