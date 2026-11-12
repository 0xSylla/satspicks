import { nip19 } from "nostr-tools";
import { getLnauth } from "@/lib/db";

/** LUD-04 LNURL-auth, step 3: the BROWSER polls until the wallet has
 *  signed. The linking key (secp256k1, same curve as Nostr) becomes the
 *  user's identity, exposed as an npub (x-only coordinate). */
export async function GET(req: Request) {
  const k1 = new URL(req.url).searchParams.get("k1") ?? "";
  if (!/^[0-9a-f]{64}$/i.test(k1))
    return Response.json({ error: "invalid k1" }, { status: 400 });
  const session = getLnauth(k1.toLowerCase());
  if (!session) return Response.json({ error: "unknown k1" }, { status: 404 });
  if (!session.pubkey) return Response.json({ pending: true });
  // Compressed pubkey (33 bytes hex) -> x-only (32 bytes) -> npub.
  const xonly = session.pubkey.slice(2);
  return Response.json({ pending: false, npub: nip19.npubEncode(xonly) });
}
