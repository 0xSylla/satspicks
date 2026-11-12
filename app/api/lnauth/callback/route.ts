import { secp256k1 } from "@noble/curves/secp256k1.js";
import { getLnauth, setLnauthPubkey } from "@/lib/db";

/** LUD-04 LNURL-auth, step 2: the WALLET calls this endpoint with its
 *  domain-specific linking key and a DER signature of k1. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const k1 = url.searchParams.get("k1") ?? "";
  const sig = url.searchParams.get("sig") ?? "";
  const key = url.searchParams.get("key") ?? "";

  if (!/^[0-9a-f]{64}$/i.test(k1) || !sig || !/^[0-9a-f]{66}$/i.test(key))
    return Response.json(
      { status: "ERROR", reason: "invalid parameters" },
      { status: 400 }
    );

  const session = getLnauth(k1.toLowerCase());
  if (!session)
    return Response.json(
      { status: "ERROR", reason: "unknown or expired k1" },
      { status: 400 }
    );

  let valid = false;
  try {
    // Wallets sign the raw 32-byte k1 as the digest, DER-encoded (LUD-04).
    const signature = secp256k1.Signature.fromBytes(
      Buffer.from(sig, "hex"),
      "der"
    );
    valid = secp256k1.verify(
      signature.toBytes("compact"),
      Buffer.from(k1, "hex"),
      Buffer.from(key, "hex"),
      { prehash: false }
    );
  } catch {
    valid = false;
  }
  if (!valid)
    return Response.json(
      { status: "ERROR", reason: "invalid signature" },
      { status: 400 }
    );

  setLnauthPubkey(k1.toLowerCase(), key.toLowerCase());
  return Response.json({ status: "OK" });
}
