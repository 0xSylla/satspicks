/**
 * Records the full satsPicks demo flow as a video with a scripted browser.
 * Usage: node scripts/record-demo.mjs  (server must run on :3100)
 * Output: demo-video/<hash>.webm
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const BASE = "http://localhost:3100";
const ADMIN = "dev-admin-key-123";
const RAFFLE_ID = readFileSync("scripts/.demo-raffle-id", "utf8").trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  recordVideo: { dir: "demo-video", size: { width: 1600, height: 900 } },
});
const page = await ctx.newPage();

async function smoothScroll(px, step = 120, pause = 40) {
  for (let done = 0; done < px; done += step) {
    await page.mouse.wheel(0, step);
    await sleep(pause);
  }
}

console.log("scene 1: landing (EN) + typewriter hero");
await page.goto(BASE, { waitUntil: "networkidle" });
await sleep(7000); // typewriter types the buyer headline
await smoothScroll(700);
await sleep(2600); // the problem
await smoothScroll(750);
await sleep(2600); // the solution
await smoothScroll(800);
await sleep(2600); // how it works
await smoothScroll(800);
await sleep(3000); // provable fairness + formula

console.log("scene 2: raffle page + buying 5 tickets");
await page.goto(`${BASE}/raffle/${RAFFLE_ID}`, { waitUntil: "networkidle" });
await sleep(2800);
await page.click('button:has-text("5")');
await sleep(600);
await page.fill("#buyer-name", "Awa Diop");
await sleep(400);
await page.fill("#buyer-contact", "+221 77 123 45 67");
await sleep(900);
await page.click('button[type="submit"]');
await page.waitForSelector('img[alt*="QR"]', { timeout: 15000 });
await sleep(3200); // Lightning invoice + QR on screen
await page.click('button:has-text("Simuler le paiement")');
await page.waitForSelector("text=Bonne chance", { timeout: 15000 });
await sleep(3500); // collectible ticket

console.log("scene 3: admin close (commitment) + draw");
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
await sleep(1200);
await page.fill("#admin-key", ADMIN);
await sleep(1500);
await page.click('button:has-text("Clôturer (commit)")');
await page.waitForSelector("text=merkle_root", { timeout: 20000 });
await sleep(2800); // commitment visible
await page.click('button:has-text("Tirer au sort")');
await page.waitForSelector("text=winner", { timeout: 30000 });
await sleep(2200);

console.log("scene 4: the animated draw reveal");
await page.goto(`${BASE}/raffle/${RAFFLE_ID}`, { waitUntil: "networkidle" });
await sleep(10000); // 4 animated steps + confetti

console.log("scene 5: public verification");
await page.goto(`${BASE}/verify/${RAFFLE_ID}`, { waitUntil: "networkidle" });
await sleep(3000);
await page.click('button:has-text("Recalculer dans mon navigateur")');
await sleep(3500); // WebCrypto recompute + green checks
await smoothScroll(500);
await sleep(2500);

console.log("scene 6: closing shot on the landing");
await page.goto(BASE, { waitUntil: "networkidle" });
await sleep(5000);

await ctx.close();
const video = await page.video().path();
console.log("VIDEO:", video);
await browser.close();
