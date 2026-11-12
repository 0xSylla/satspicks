"use client";

import { useEffect, useState } from "react";
import { getNpub, setNpub, shortNpub } from "@/lib/nostr-client";
import ConnectModal from "./ConnectModal";

/** Navbar wallet login: opens the connect popup (extension or manual npub). */
export default function NostrLogin() {
  const [npub, setLocal] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLocal(getNpub());
  }, []);

  function disconnect() {
    setNpub(null);
    setLocal(null);
  }

  if (npub) {
    return (
      <button
        onClick={disconnect}
        title={`${npub} : cliquer pour se déconnecter`}
        className="label whitespace-nowrap transition-colors hover:!text-zinc-900"
      >
        {shortNpub(npub)} ×
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="label whitespace-nowrap !text-zinc-900 transition-colors hover:!text-btc-600"
      >
        Connecter
      </button>
      <ConnectModal
        open={open}
        onClose={() => setOpen(false)}
        onConnected={(n) => {
          setLocal(n);
          setOpen(false);
        }}
      />
    </>
  );
}
