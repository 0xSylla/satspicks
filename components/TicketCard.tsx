"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** Collectible-looking raffle ticket shown after payment. The ticket number
 *  is derived from the payment hash (cosmetic); the hash itself is the real,
 *  verifiable proof of participation. */
export default function TicketCard({
  raffleTitle,
  buyerName,
  paymentHash,
}: {
  raffleTitle: string;
  buyerName: string;
  paymentHash: string;
}) {
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const ticketNo = (parseInt(paymentHash.slice(0, 8), 16) % 100000)
    .toString()
    .padStart(5, "0");

  useEffect(() => {
    QRCode.toDataURL(paymentHash, { width: 140, margin: 1 }).then(setQr);
  }, [paymentHash]);

  async function share() {
    const text =
      `🎟️ J'ai mon ticket n°${ticketNo} pour « ${raffleTitle} » sur SamaKeur !\n` +
      `Tirage prouvablement équitable, ancré dans la blockchain Bitcoin. Lightning\n` +
      `Preuve : ${paymentHash}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Mon ticket SamaKeur", text });
        return;
      }
      throw new Error("no web share");
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  }

  return (
    <div className="space-y-3">
      <div className="ticket-notch overflow-hidden rounded-md bg-zinc-100 text-zinc-900 shadow-lg ring-1 ring-black/10">
        <div className="wax-border h-2" />
        <div className="flex items-center gap-4 p-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-zinc-600">
              Ticket de tombola SamaKeur
            </p>
            <p className="tnum text-3xl font-extrabold text-terra-500">
              N° {ticketNo}
            </p>
            <p className="truncate text-sm font-medium">{raffleTitle}</p>
            <p className="text-sm text-zinc-600">{buyerName}</p>
            <p className="mt-1 break-all font-mono text-[9px] text-zinc-600">
              {paymentHash}
            </p>
          </div>
          {qr && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qr}
              alt="QR du payment hash"
              className="h-24 w-24 shrink-0 rounded-lg"
            />
          )}
        </div>
        <div className="wax-border h-2" />
      </div>
      <button
        onClick={share}
        className="w-full rounded-md border border-zinc-900 px-4 py-2 text-sm font-medium hover:bg-white"
      >
        {copied ? "Copié !" : "📣 Partager mon ticket"}
      </button>
      <p className="text-xs text-zinc-600">
        Ce payment hash est votre preuve : il apparaîtra dans la liste publique
        des tickets et dans l&apos;arbre de merkle du tirage.
      </p>
    </div>
  );
}
