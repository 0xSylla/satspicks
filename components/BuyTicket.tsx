"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import Link from "next/link";
import TicketCard from "./TicketCard";
import { savePurchase, ticketNo } from "@/lib/purchases-client";
import { getNpub } from "@/lib/nostr-client";

type Phase = "form" | "invoice" | "paid";

const QTY_PRESETS = [1, 5, 10];

export default function BuyTicket({
  raffleId,
  raffleTitle,
  priceSats,
  priceFcfa,
}: {
  raffleId: string;
  raffleTitle: string;
  priceSats: number;
  priceFcfa: number;
}) {
  const [phase, setPhase] = useState<Phase>("form");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [qty, setQty] = useState(1);
  const [bolt11, setBolt11] = useState("");
  const [paymentHash, setPaymentHash] = useState("");
  const [leaves, setLeaves] = useState<string[]>([]);
  const [amountSats, setAmountSats] = useState(0);
  const [isDemo, setIsDemo] = useState(false);
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  // Prefill the contact field with the connected Nostr identity.
  useEffect(() => {
    const npub = getNpub();
    if (npub) setContact((c) => c || npub);
  }, []);

  async function buy(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`/api/raffles/${raffleId}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_name: name,
          buyer_contact: contact,
          quantity: qty,
          buyer_npub: getNpub() ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setBolt11(data.bolt11);
      setPaymentHash(data.payment_hash);
      setLeaves(data.leaf_hashes);
      setAmountSats(data.amount_sats);
      setIsDemo(data.demo);
      setQr(await QRCode.toDataURL(data.bolt11, { width: 260, margin: 1 }));
      setPhase("invoice");
      pollRef.current = setInterval(async () => {
        const r = await fetch(`/api/tickets/${data.payment_hash}`);
        const s = await r.json();
        if (s.status === "paid") {
          stopPolling();
          savePurchase({
            payment_hash: data.payment_hash,
            raffle_id: raffleId,
            raffle_title: raffleTitle,
            buyer_name: name,
            leaf_hashes: data.leaf_hashes,
            date: new Date().toISOString(),
          });
          setPhase("paid");
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  async function simulatePayment() {
    await fetch(`/api/tickets/${paymentHash}/simulate`, { method: "POST" });
  }

  function reset() {
    setPhase("form");
    setQty(1);
  }

  if (phase === "paid") {
    return (
      <div className="space-y-3">
        <p className="text-center font-bold text-teal-600">
          {leaves.length > 1
            ? `${leaves.length} tickets payés. Bonne chance, ${name} !`
            : `Ticket payé. Bonne chance, ${name} !`}
        </p>
        <TicketCard
          raffleTitle={raffleTitle}
          buyerName={name}
          paymentHash={leaves[0]}
        />
        {leaves.length > 1 && (
          <details className="rounded-md border border-black/10 bg-white p-4 text-sm">
            <summary className="cursor-pointer font-medium">
              Vos {leaves.length} tickets (empreintes vérifiables)
            </summary>
            <ol className="mt-3 space-y-1 font-mono text-xs text-zinc-600">
              {leaves.map((l) => (
                <li key={l} className="break-all">
                  <span className="font-bold text-zinc-900">
                    N° {ticketNo(l)}
                  </span>{" "}
                  {l}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-zinc-500">
              Chaque empreinte dérive de votre paiement :
              sha256(payment_hash:i). Toutes apparaîtront dans la liste
              publique du tirage.
            </p>
          </details>
        )}
        <button
          onClick={reset}
          className="w-full rounded-md border border-zinc-900 px-4 py-2 text-sm font-medium hover:bg-black/5"
        >
          Acheter d&apos;autres tickets
        </button>
        <p className="text-center text-sm">
          <Link
            href="/mes-tickets"
            className="underline underline-offset-4 hover:text-zinc-900"
          >
            Retrouver tous mes tickets
          </Link>
        </p>
      </div>
    );
  }

  if (phase === "invoice") {
    return (
      <div className="rounded-md border border-black/10 bg-white p-5 text-center">
        <p className="font-semibold">
          Payez{" "}
          <span className="tnum">{amountSats.toLocaleString("fr-FR")}</span>{" "}
          sats
          {leaves.length > 1 && (
            <span className="font-normal text-zinc-600">
              {" "}
              ({leaves.length} tickets)
            </span>
          )}
        </p>
        {qr && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qr}
            alt="QR code de la facture Lightning"
            className="mx-auto mt-3 rounded-md"
          />
        )}
        <p className="mt-2 break-all text-xs text-zinc-400">{bolt11}</p>
        <p className="mt-2 text-sm text-zinc-600">
          Scannez avec n&apos;importe quel wallet Lightning. La page se met à
          jour automatiquement une fois le paiement reçu.
        </p>
        {isDemo && (
          <button
            onClick={simulatePayment}
            className="mt-3 rounded-md bg-btc-500 px-4 py-2 text-sm font-semibold text-black hover:bg-btc-600"
          >
            Simuler le paiement (mode démo)
          </button>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={buy}
      className="space-y-3 rounded-md border border-black/10 bg-white p-5"
    >
      <h2 className="font-semibold">Acheter des tickets</h2>

      <div>
        <span className="block text-sm text-zinc-700">Nombre de tickets</span>
        <div className="mt-1 flex gap-2">
          {QTY_PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setQty(n)}
              className={`tnum flex-1 border px-3 py-2 text-sm font-semibold transition-colors ${
                qty === n
                  ? "border-btc-500 bg-btc-500 text-black"
                  : "border-black/10 hover:bg-black/5"
              }`}
            >
              {n}
            </button>
          ))}
          <input
            type="number"
            min={1}
            max={100}
            value={qty}
            onChange={(e) =>
              setQty(Math.min(100, Math.max(1, Number(e.target.value) || 1)))
            }
            aria-label="Nombre de tickets personnalisé"
            className="tnum w-20 rounded-md border border-black/10 px-2 py-2 text-center text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-zinc-700" htmlFor="buyer-name">
          Votre nom
        </label>
        <input
          id="buyer-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          placeholder="Awa Diop"
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-700" htmlFor="buyer-contact">
          Contact (téléphone, email ou npub Nostr)
        </label>
        <input
          id="buyer-contact"
          required
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          placeholder="+221 77 ... / npub1..."
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="tnum w-full rounded-md bg-btc-500 px-4 py-2.5 font-semibold text-black hover:bg-btc-600"
      >
        Payer {(priceSats * qty).toLocaleString("fr-FR")} sats
        <span className="font-normal">
          {" "}
          (≈ {(priceFcfa * qty).toLocaleString("fr-FR")} F)
        </span>
      </button>
    </form>
  );
}
