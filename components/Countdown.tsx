"use client";

import { useEffect, useState } from "react";

function remaining(deadline: string) {
  const ms = new Date(deadline + "T23:59:59").getTime() - Date.now();
  if (ms <= 0) return null;
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return { d, h, m };
}

export default function Countdown({ deadline }: { deadline: string }) {
  const [left, setLeft] = useState<ReturnType<typeof remaining>>(null);

  useEffect(() => {
    setLeft(remaining(deadline));
    const t = setInterval(() => setLeft(remaining(deadline)), 30_000);
    return () => clearInterval(t);
  }, [deadline]);

  if (!left) return <span>clôture imminente</span>;
  return (
    <span className="tnum">
      {left.d > 0 && `${left.d} j `}
      {left.h} h {left.m} min restants
    </span>
  );
}
