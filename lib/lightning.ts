import { randomBytes } from "node:crypto";

export interface Invoice {
  payment_hash: string;
  bolt11: string;
  demo: boolean;
}

export function isDemoMode(): boolean {
  if (process.env.DEMO_MODE === "false") return false;
  // Demo by default unless a real LNbits backend is configured.
  return !(process.env.LNBITS_URL && process.env.LNBITS_INVOICE_KEY);
}

export async function createInvoice(
  amountSats: number,
  memo: string
): Promise<Invoice> {
  if (isDemoMode()) {
    const hash = randomBytes(32).toString("hex");
    return {
      payment_hash: hash,
      // Clearly-fake invoice string: demo mode only, never payable.
      bolt11: `lnbcrt${amountSats}n1demo${hash.slice(0, 40)}`,
      demo: true,
    };
  }
  const res = await fetch(`${process.env.LNBITS_URL}/api/v1/payments`, {
    method: "POST",
    headers: {
      "X-Api-Key": process.env.LNBITS_INVOICE_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ out: false, amount: amountSats, memo }),
  });
  if (!res.ok) {
    throw new Error(`LNbits invoice creation failed: ${res.status}`);
  }
  const data = (await res.json()) as {
    payment_hash: string;
    payment_request?: string;
    bolt11?: string;
  };
  return {
    payment_hash: data.payment_hash,
    bolt11: data.payment_request ?? data.bolt11 ?? "",
    demo: false,
  };
}

/** Returns true when the invoice is settled. In demo mode, payment is
 *  settled via the explicit simulate endpoint instead. */
export async function checkInvoicePaid(paymentHash: string): Promise<boolean> {
  if (isDemoMode()) return false;
  const res = await fetch(
    `${process.env.LNBITS_URL}/api/v1/payments/${paymentHash}`,
    { headers: { "X-Api-Key": process.env.LNBITS_INVOICE_KEY! } }
  );
  if (!res.ok) return false;
  const data = (await res.json()) as { paid?: boolean };
  return data.paid === true;
}
