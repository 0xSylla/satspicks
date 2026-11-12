"use client";

import { nip19 } from "nostr-tools";

/** NIP-07 window.nostr minimal surface. */
interface NostrProvider {
  getPublicKey(): Promise<string>;
}

const KEY = "satspicks_npub";

export function getNpub(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setNpub(npub: string | null): void {
  try {
    if (npub) localStorage.setItem(KEY, npub);
    else localStorage.removeItem(KEY);
  } catch {}
}

export function isValidNpub(s: string): boolean {
  try {
    return (nip19.decode(s.trim()) as { type: string }).type === "npub";
  } catch {
    return false;
  }
}

export function shortNpub(npub: string): string {
  return `${npub.slice(0, 10)}…${npub.slice(-4)}`;
}

/** Connects via a NIP-07 extension (Alby, nos2x…). Throws "no-extension"
 *  when none is installed so the caller can fall back to manual entry. */
export async function connectWithExtension(): Promise<string> {
  const provider = (window as unknown as { nostr?: NostrProvider }).nostr;
  if (!provider?.getPublicKey) throw new Error("no-extension");
  const pubkey = await provider.getPublicKey();
  return nip19.npubEncode(pubkey);
}

/** Full connect flow: extension first, manual npub prompt as fallback.
 *  Returns the npub, or null if the user cancelled. */
export async function connectNostr(): Promise<string | null> {
  try {
    const npub = await connectWithExtension();
    setNpub(npub);
    return npub;
  } catch {
    const manual = window.prompt(
      "Pas d'extension Nostr détectée (Alby, nos2x…).\n" +
        "Collez votre clé publique npub pour vous connecter :"
    );
    if (!manual) return null;
    if (!isValidNpub(manual)) {
      window.alert("Cette clé n'est pas un npub valide.");
      return null;
    }
    const npub = manual.trim();
    setNpub(npub);
    return npub;
  }
}
