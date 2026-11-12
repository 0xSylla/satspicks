import { finalizeEvent, nip19 } from "nostr-tools";
import { SimplePool } from "nostr-tools/pool";

const DEFAULT_RELAYS = ["wss://relay.damus.io", "wss://nos.lol"];

function relays(): string[] {
  const env = process.env.NOSTR_RELAYS;
  return env ? env.split(",").map((r) => r.trim()) : DEFAULT_RELAYS;
}

function secretKey(): Uint8Array | null {
  const nsec = process.env.NOSTR_NSEC;
  if (!nsec) return null;
  try {
    const decoded = nip19.decode(nsec);
    if (decoded.type !== "nsec") return null;
    return decoded.data as Uint8Array;
  } catch {
    return null;
  }
}

/**
 * Best-effort publication of a raffle lifecycle event to public relays.
 * Returns the nostr event id, or null when no key is configured or all
 * relays fail. Never throws — transparency publication must not block the
 * payment/draw flow.
 */
export async function publishRaffleEvent(
  kindLabel: "created" | "commit" | "result",
  payload: Record<string, unknown>
): Promise<string | null> {
  const sk = secretKey();
  if (!sk) return null;
  try {
    const event = finalizeEvent(
      {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ["t", "satspicks"],
          ["t", `satspicks-${kindLabel}`],
        ],
        content: JSON.stringify({ app: "satspicks", type: kindLabel, ...payload }),
      },
      sk
    );
    const pool = new SimplePool();
    const pubs = pool.publish(relays(), event);
    // Wait at most 4s for one relay to accept; don't block the request longer.
    await Promise.race([
      Promise.any(pubs),
      new Promise((resolve) => setTimeout(resolve, 4000)),
    ]).catch(() => {});
    pool.close(relays());
    return event.id;
  } catch {
    return null;
  }
}
