"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** FR/EN toggle for the landing page. */
export default function LangSwitch() {
  const path = usePathname();
  const isFr = path === "/fr" || path.startsWith("/fr/");
  return (
    <Link
      href={isFr ? "/" : "/fr"}
      className="label whitespace-nowrap transition-colors hover:!text-zinc-900"
    >
      {isFr ? "EN" : "FR"}
    </Link>
  );
}
