"use client";

import { useEffect, useRef } from "react";

/** Reveals its content with a soft fade/slide when scrolled into view.
 *  One-shot, IntersectionObserver based, disabled for reduced motion (CSS). */
export default function Reveal({
  as = "div",
  className,
  id,
  children,
}: {
  as?: "div" | "section";
  className?: string;
  id?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const Tag = as as React.ElementType;
  return (
    <Tag ref={ref} id={id} className={`reveal ${className ?? ""}`}>
      {children}
    </Tag>
  );
}
