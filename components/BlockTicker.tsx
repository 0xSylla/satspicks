"use client";

import { useEffect, useState } from "react";

/** Live Bitcoin tip height in the navbar — the product's heartbeat.
 *  Renders nothing until the first successful fetch. */
export default function BlockTicker() {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    async function tick() {
      try {
        const res = await fetch("/api/tip");
        if (res.ok && alive) {
          const data = await res.json();
          setHeight(data.height);
        }
      } catch {}
    }
    void tick();
    const t = setInterval(tick, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (height == null) return null;

  return (
    <span className="label flex items-center gap-2 whitespace-nowrap">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-sm bg-btc-500 opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-sm bg-btc-500" />
      </span>
      bloc <span className="!text-zinc-900">#{height.toLocaleString("fr-FR")}</span>
    </span>
  );
}
