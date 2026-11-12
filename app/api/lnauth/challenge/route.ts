import { randomBytes } from "node:crypto";
import { bech32 } from "@scure/base";
import { createLnauthChallenge } from "@/lib/db";

/** LUD-04 LNURL-auth, step 1: issue a challenge the wallet will sign.
 *  The wallet must be able to reach the callback URL over the internet,
 *  so this only completes on a publicly deployed instance (or a tunnel). */
export async function POST(req: Request) {
  const k1 = randomBytes(32).toString("hex");
  createLnauthChallenge(k1);

  const envBase = process.env.NEXT_PUBLIC_BASE_URL;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const base = envBase || `${proto}://${host}`;
  const callback = `${base}/api/lnauth/callback?tag=login&k1=${k1}&action=login`;

  const words = bech32.toWords(new TextEncoder().encode(callback));
  const lnurl = bech32.encode("lnurl", words, 1023).toUpperCase();

  const isLocal =
    base.includes("localhost") || base.includes("127.0.0.1");

  return Response.json({ k1, callback, lnurl, local: isLocal });
}
