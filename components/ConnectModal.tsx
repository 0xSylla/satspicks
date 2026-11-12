"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import {
  connectWithExtension,
  isValidNpub,
  setNpub,
} from "@/lib/nostr-client";

type View = "menu" | "lnurl";

/** Connection popup: Lightning wallet app (LNURL-auth), NIP-07 browser
 *  extension, or manual npub entry. */
export default function ConnectModal({
  open,
  onClose,
  onConnected,
}: {
  open: boolean;
  onClose: () => void;
  onConnected: (npub: string) => void;
}) {
  const [view, setView] = useState<View>("menu");
  const [manual, setManual] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [qr, setQr] = useState("");
  const [lnurl, setLnurl] = useState("");
  const [isLocal, setIsLocal] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // Stop polling whenever the modal closes or leaves the QR view.
    if ((!open || view !== "lnurl") && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [open, view]);

  if (!open || !mounted) return null;

  async function startLnurl() {
    setError("");
    setView("lnurl");
    try {
      const res = await fetch("/api/lnauth/challenge", { method: "POST" });
      const data = await res.json();
      setLnurl(data.lnurl);
      setIsLocal(data.local);
      setQr(
        await QRCode.toDataURL(`lightning:${data.lnurl}`, {
          width: 240,
          margin: 1,
        })
      );
      pollRef.current = setInterval(async () => {
        const r = await fetch(`/api/lnauth/status?k1=${data.k1}`);
        if (!r.ok) return;
        const s = await r.json();
        if (!s.pending && s.npub) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setNpub(s.npub);
          onConnected(s.npub);
        }
      }, 2000);
    } catch {
      setError("Impossible de générer le défi de connexion.");
    }
  }

  async function viaExtension() {
    setError("");
    setBusy(true);
    try {
      const npub = await connectWithExtension();
      setNpub(npub);
      onConnected(npub);
    } catch {
      setError(
        "Aucune extension Nostr détectée. Installez Alby ou nos2x, ou saisissez votre npub ci-dessous."
      );
    } finally {
      setBusy(false);
    }
  }

  function viaManual(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const npub = manual.trim();
    if (!isValidNpub(npub)) {
      setError("Cette clé n'est pas un npub valide (npub1…).");
      return;
    }
    setNpub(npub);
    onConnected(npub);
  }

  // Portal to <body>: the sticky header's backdrop-blur creates a containing
  // block that would otherwise trap this fixed overlay inside the navbar.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-black/10 bg-white p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Connexion"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="label !text-btc-600">Connexion</p>
            <h2 className="mt-1 text-xl font-bold">
              {view === "lnurl"
                ? "Scannez avec votre wallet"
                : "Connectez-vous sans mot de passe"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="px-2 text-xl text-zinc-400 hover:text-zinc-900"
          >
            ×
          </button>
        </div>

        {view === "lnurl" ? (
          <div className="mt-4 text-center">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="QR LNURL-auth" className="mx-auto" />
            ) : (
              <p className="py-10 text-sm text-zinc-500">Génération…</p>
            )}
            <p className="mt-3 text-sm text-zinc-600">
              Ouvrez votre app Lightning (Phoenix, Wallet of Satoshi, Zeus…)
              et scannez. La connexion est automatique.
            </p>
            {isLocal && (
              <p className="mt-3 border border-btc-500/40 bg-btc-500/10 p-3 text-left text-xs text-zinc-700">
                Instance locale : votre téléphone ne peut pas joindre
                localhost. Cette méthode fonctionne sur le site déployé (ou
                via un tunnel type ngrok).
              </p>
            )}
            {lnurl && (
              <p className="tnum mt-3 break-all text-[10px] text-zinc-400">
                {lnurl}
              </p>
            )}
            <button
              onClick={() => setView("menu")}
              className="mt-4 text-sm text-zinc-600 underline underline-offset-4"
            >
              ← Autres méthodes
            </button>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-zinc-600">
              Votre wallet est votre compte : il paie vos tickets et vous
              identifie pour les retrouver partout.
            </p>

            <button
              onClick={startLnurl}
              className="mt-5 w-full bg-btc-500 px-4 py-3 font-semibold text-black hover:bg-btc-600"
            >
              Scanner avec mon app wallet
            </button>
            <p className="mt-1 text-center text-xs text-zinc-500">
              LNURL-auth : Phoenix, Wallet of Satoshi, Zeus, Breez…
            </p>

            <button
              onClick={viaExtension}
              disabled={busy}
              className="mt-4 w-full border border-zinc-900 px-4 py-3 font-semibold hover:bg-black/5 disabled:opacity-50"
            >
              {busy ? "Connexion…" : "Extension navigateur (Nostr)"}
            </button>
            <p className="mt-1 text-center text-xs text-zinc-500">
              NIP-07 : Alby, nos2x…
            </p>

            <div className="mt-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-black/10" />
              <span className="label">ou</span>
              <span className="h-px flex-1 bg-black/10" />
            </div>

            <form onSubmit={viaManual} className="mt-4">
              <label
                className="block text-sm text-zinc-700"
                htmlFor="npub-input"
              >
                Saisir ma clé publique manuellement
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="npub-input"
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  placeholder="npub1…"
                  className="tnum flex-1 rounded-md border border-black/10 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
                >
                  Valider
                </button>
              </div>
            </form>
          </>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>,
    document.body
  );
}
