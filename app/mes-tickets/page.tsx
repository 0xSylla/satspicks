"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  loadPurchases,
  savePurchase,
  ticketNo,
  type StoredPurchase,
} from "@/lib/purchases-client";
import { getNpub, shortNpub } from "@/lib/nostr-client";
import ConnectModal from "@/components/ConnectModal";

interface RaffleInfo {
  status: string;
  winner_leaf: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  open: "Tombola en cours",
  closed: "Tirage en attente",
  drawn: "Tirage effectué",
  refunded: "Remboursée",
};

export default function MesTicketsPage() {
  const [purchases, setPurchases] = useState<StoredPurchase[]>([]);
  const [raffles, setRaffles] = useState<Record<string, RaffleInfo>>({});
  const [npub, setNpubState] = useState<string | null>(null);
  const [recoverHash, setRecoverHash] = useState("");
  const [recoverMsg, setRecoverMsg] = useState("");

  useEffect(() => {
    const stored = loadPurchases();
    setPurchases(stored);
    const connected = getNpub();
    setNpubState(connected);

    // Status of locally known raffles.
    const ids = [...new Set(stored.map((p) => p.raffle_id))];
    ids.forEach(async (id) => {
      try {
        const res = await fetch(`/api/raffles/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        setRaffles((r) => ({
          ...r,
          [id]: {
            status: data.raffle.status,
            winner_leaf: data.winner?.leaf_hash ?? null,
          },
        }));
      } catch {}
    });

    // Tickets bound to the connected wallet, from any device.
    if (connected) {
      void (async () => {
        try {
          const res = await fetch(
            `/api/my-tickets?npub=${encodeURIComponent(connected)}`
          );
          if (!res.ok) return;
          const data = await res.json();
          const remote: StoredPurchase[] = data.purchases.map(
            (p: {
              payment_hash: string;
              raffle_id: string;
              raffle_title: string;
              raffle_status: string;
              winner_leaf: string | null;
              buyer_name: string;
              leaf_hashes: string[];
              date: string;
            }) => {
              setRaffles((r) => ({
                ...r,
                [p.raffle_id]: {
                  status: p.raffle_status,
                  winner_leaf: p.winner_leaf,
                },
              }));
              return {
                payment_hash: p.payment_hash,
                raffle_id: p.raffle_id,
                raffle_title: p.raffle_title,
                buyer_name: p.buyer_name,
                leaf_hashes: p.leaf_hashes,
                date: p.date,
              };
            }
          );
          setPurchases((local) => {
            const seen = new Set(remote.map((p) => p.payment_hash));
            return [...remote, ...local.filter((p) => !seen.has(p.payment_hash))];
          });
        } catch {}
      })();
    }
  }, []);

  const [connectOpen, setConnectOpen] = useState(false);

  async function recover(e: React.FormEvent) {
    e.preventDefault();
    setRecoverMsg("");
    const hash = recoverHash.trim().toLowerCase();
    const res = await fetch(`/api/purchases/${hash}`);
    if (!res.ok) {
      setRecoverMsg("Aucun achat trouvé pour ce reçu.");
      return;
    }
    const data = await res.json();
    if (data.status !== "paid") {
      setRecoverMsg("Cet achat n'a pas été payé.");
      return;
    }
    savePurchase({
      payment_hash: data.payment_hash,
      raffle_id: data.raffle?.id ?? "",
      raffle_title: data.raffle?.title ?? "Tombola",
      buyer_name: data.buyer_name,
      leaf_hashes: data.leaf_hashes,
      date: new Date().toISOString(),
    });
    setPurchases(loadPurchases());
    setRecoverHash("");
    setRecoverMsg("Achat retrouvé et ajouté à vos tickets.");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Mes tickets</h1>
        {npub ? (
          <p className="mt-1 text-sm text-zinc-600">
            Connecté : <span className="tnum">{shortNpub(npub)}</span>. Vos
            tickets liés à cette identité Nostr apparaissent sur tous vos
            appareils.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap items-center gap-3 border border-black/10 bg-white p-4">
            <p className="text-sm text-zinc-600">
              Connectez votre wallet Nostr (Alby, nos2x…) pour retrouver vos
              tickets sur tous vos appareils.
            </p>
            <button
              onClick={() => setConnectOpen(true)}
              className="bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
            >
              Connecter mon wallet
            </button>
          </div>
        )}
      </div>

      <ConnectModal
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        onConnected={() => window.location.reload()}
      />

      {purchases.length === 0 ? (
        <div className="border border-black/10 bg-white p-6 text-sm text-zinc-600">
          Aucun ticket sur cet appareil pour l&apos;instant.{" "}
          <Link href="/tombolas" className="font-semibold text-zinc-900 underline underline-offset-4">
            Voir les tombolas en cours
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((p) => {
            const info = raffles[p.raffle_id];
            const won =
              info?.winner_leaf != null &&
              p.leaf_hashes.includes(info.winner_leaf);
            return (
              <div
                key={p.payment_hash}
                className="border border-black/10 bg-white p-5"
              >
                {won && (
                  <p className="mb-3 bg-btc-500 px-3 py-2 text-center font-bold text-black">
                    Vous avez gagné cette tombola !
                  </p>
                )}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {p.raffle_title.replace(/^\[DEMO\]\s*/, "")}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {p.leaf_hashes.length} ticket
                      {p.leaf_hashes.length > 1 ? "s" : ""} · {p.buyer_name} ·{" "}
                      {new Date(p.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span className="label">
                    {info ? STATUS_LABEL[info.status] ?? info.status : "…"}
                  </span>
                </div>
                <div className="tnum mt-3 flex flex-wrap gap-2">
                  {p.leaf_hashes.map((l) => (
                    <span
                      key={l}
                      className={`border px-2 py-1 text-xs font-semibold ${
                        info?.winner_leaf === l
                          ? "border-btc-500 bg-btc-500 text-black"
                          : "border-black/10"
                      }`}
                      title={l}
                    >
                      N° {ticketNo(l)}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <Link
                    href={`/raffle/${p.raffle_id}`}
                    className="underline underline-offset-4 hover:text-zinc-900"
                  >
                    Voir la tombola
                  </Link>
                  <Link
                    href={`/verify/${p.raffle_id}`}
                    className="underline underline-offset-4 hover:text-zinc-900"
                  >
                    Vérifier le tirage
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form
        onSubmit={recover}
        className="border border-black/10 bg-white p-5"
      >
        <h2 className="font-semibold">Retrouver un achat</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Collez le reçu (payment hash) montré lors de votre achat.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            value={recoverHash}
            onChange={(e) => setRecoverHash(e.target.value)}
            placeholder="ex. 747742db003f…"
            className="tnum flex-1 rounded-md border border-black/10 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            Retrouver
          </button>
        </div>
        {recoverMsg && (
          <p className="mt-2 text-sm text-zinc-600">{recoverMsg}</p>
        )}
      </form>
    </div>
  );
}
