"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Seg = { t: string; o?: boolean };
type Lang = "fr" | "en";

const CONTENT: Record<
  Lang,
  {
    titles: Seg[][];
    subtitle: string;
    buy: string;
    sell: string;
    how: string;
  }
> = {
  fr: {
    titles: [
      [
        { t: "Devenez propriétaire\npour " },
        { t: "le prix d'un ticket", o: true },
        { t: "." },
      ],
      [
        { t: "Vendez en 30 jours,\nau " },
        { t: "prix que vous fixez", o: true },
        { t: "." },
      ],
    ],
    subtitle:
      "La seule tombola immobilière où vous n'avez pas à nous croire sur parole : chaque tirage est vérifiable, chaque ticket est public, chaque bien est vérifié par notaire.",
    buy: "Tenter ma chance",
    sell: "Proposer un bien à vendre",
    how: "Comment on prouve l'équité",
  },
  en: {
    titles: [
      [
        { t: "Become a homeowner\nfor " },
        { t: "the price of a ticket", o: true },
        { t: "." },
      ],
      [
        { t: "Sell in 30 days,\nat " },
        { t: "the price you set", o: true },
        { t: "." },
      ],
    ],
    subtitle:
      "The only property raffle where you don't have to take our word for it: every draw is verifiable, every ticket is public, every property is notary-verified.",
    buy: "Try my luck",
    sell: "List a property for sale",
    how: "How we prove fairness",
  },
};

const TYPE_MS = 45;
const ERASE_MS = 16;
const HOLD_MS = 3200;
const GAP_MS = 400;

const totalLen = (segs: Seg[]) => segs.reduce((n, s) => n + s.t.length, 0);

function renderTitle(segs: Seg[], count: number) {
  const out: React.ReactNode[] = [];
  let used = 0;
  segs.forEach((s, i) => {
    const take = Math.max(0, Math.min(s.t.length, count - used));
    used += s.t.length;
    if (take === 0) return;
    s.t.slice(0, take)
      .split("\n")
      .forEach((part, j) => {
        if (j > 0) out.push(<br key={`${i}-br-${j}`} />);
        if (part)
          out.push(
            <span key={`${i}-${j}`} className={s.o ? "text-btc-500" : undefined}>
              {part}
            </span>
          );
      });
  });
  return out;
}

/** Typewriter hero: types the buyer headline, holds, erases it, then types
 *  the seller headline — forever, no interaction. */
export default function HeroRotator({ lang = "fr" }: { lang?: Lang }) {
  const [slide, setSlide] = useState(0);
  const [count, setCount] = useState(0);
  const [erasing, setErasing] = useState(false);
  const { titles: TITLES, subtitle, buy, sell, how } = CONTENT[lang];

  useEffect(() => {
    const total = totalLen(TITLES[slide]);
    let t: ReturnType<typeof setTimeout>;
    if (!erasing) {
      if (count < total) t = setTimeout(() => setCount(count + 1), TYPE_MS);
      else t = setTimeout(() => setErasing(true), HOLD_MS);
    } else {
      if (count > 0) t = setTimeout(() => setCount(count - 1), ERASE_MS);
      else
        t = setTimeout(() => {
          setSlide((s) => (s + 1) % TITLES.length);
          setErasing(false);
        }, GAP_MS);
    }
    return () => clearTimeout(t);
  }, [count, erasing, slide, TITLES]);

  const primary = "bg-btc-500 px-6 py-3 font-semibold text-black hover:bg-btc-600";
  const secondary = "border border-zinc-900 px-6 py-3 font-semibold hover:bg-black/5";

  return (
    <div>
      <h1 className="min-h-[2.3em] max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
        {renderTitle(TITLES[slide], count)}
        <span className="cursor-blink text-btc-500">▍</span>
      </h1>

      <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-600">
        {subtitle}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link href="/tombolas" className={slide === 0 ? primary : secondary}>
          {buy}
        </Link>
        <Link href="/proposer" className={slide === 1 ? primary : secondary}>
          {sell}
        </Link>
      </div>
      <a
        href="#preuve"
        className="mt-5 inline-block text-sm text-zinc-600 underline underline-offset-4 hover:text-zinc-900"
      >
        {how}
      </a>
    </div>
  );
}
