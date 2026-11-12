"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  connectWithExtension,
  isValidNpub,
  setNpub,
} from "@/lib/nostr-client";

/** Connection popup: NIP-07 wallet extension, or manual npub entry. */
export default function ConnectModal({
  open,
  onClose,
  onConnected,
}: {
  open: boolean;
  onClose: () => void;
  onConnected: (npub: string) => void;
}) {
  const [manual, setManual] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

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
              Connectez votre identité Nostr
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
        <p className="mt-2 text-sm text-zinc-600">
          Pas de compte, pas de mot de passe : votre clé publique Nostr suffit
          pour retrouver vos tickets sur tous vos appareils.
        </p>

        <button
          onClick={viaExtension}
          disabled={busy}
          className="mt-5 w-full bg-btc-500 px-4 py-3 font-semibold text-black hover:bg-btc-600 disabled:opacity-50"
        >
          {busy ? "Connexion…" : "Se connecter avec mon wallet"}
        </button>
        <p className="mt-1 text-center text-xs text-zinc-500">
          via une extension NIP-07 : Alby, nos2x…
        </p>

        <div className="mt-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-black/10" />
          <span className="label">ou</span>
          <span className="h-px flex-1 bg-black/10" />
        </div>

        <form onSubmit={viaManual} className="mt-4">
          <label className="block text-sm text-zinc-700" htmlFor="npub-input">
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

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>,
    document.body
  );
}
