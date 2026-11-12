/** Client-side purchase memory: the buyer's tickets, kept in localStorage on
 *  their own device. The payment hash receipt can always restore them. */

export interface StoredPurchase {
  payment_hash: string;
  raffle_id: string;
  raffle_title: string;
  buyer_name: string;
  leaf_hashes: string[];
  date: string;
}

const KEY = "samakeur_purchases";

export function loadPurchases(): StoredPurchase[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePurchase(p: StoredPurchase): void {
  try {
    const all = loadPurchases().filter(
      (x) => x.payment_hash !== p.payment_hash
    );
    all.unshift(p);
    localStorage.setItem(KEY, JSON.stringify(all.slice(0, 100)));
  } catch {}
}

export function ticketNo(leaf: string): string {
  return (parseInt(leaf.slice(0, 8), 16) % 100000).toString().padStart(5, "0");
}
