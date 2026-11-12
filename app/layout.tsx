import type { Metadata } from "next";
import Link from "next/link";
import BlockTicker from "@/components/BlockTicker";
import NostrLogin from "@/components/NostrLogin";
import LangSwitch from "@/components/LangSwitch";
import "./globals.css";

export const metadata: Metadata = {
  title: "satsPicks",
  description:
    "Provably fair real-estate raffles, paid with Bitcoin Lightning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-10 border-b border-black/10 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-stretch divide-x divide-black/10 border-x border-black/10">
            {/* Logo zone */}
            <Link
              href="/"
              className="flex items-center px-4 py-3.5 transition-colors hover:bg-black/5 sm:px-6"
            >
              <span className="text-base font-bold tracking-tight">
                satsPicks
              </span>
            </Link>

            {/* Links zone */}
            <nav className="flex flex-1 items-center gap-6 overflow-x-auto px-4 sm:px-6">
              <Link
                href="/tombolas"
                className="label whitespace-nowrap transition-colors hover:!text-zinc-900"
              >
                Tombolas
              </Link>
              <Link
                href="/proposer"
                className="label whitespace-nowrap transition-colors hover:!text-zinc-900"
              >
                Vendre
              </Link>
              <Link
                href="/mes-tickets"
                className="label whitespace-nowrap transition-colors hover:!text-zinc-900"
              >
                Mes tickets
              </Link>
              <Link
                href="/admin"
                className="label hidden whitespace-nowrap transition-colors hover:!text-zinc-900 sm:inline"
              >
                Admin
              </Link>
            </nav>

            {/* Live Bitcoin tip zone */}
            <div className="hidden items-center px-6 md:flex">
              <BlockTicker />
            </div>

            {/* Language zone */}
            <div className="hidden items-center px-4 sm:flex">
              <LangSwitch />
            </div>

            {/* Wallet login zone */}
            <div className="flex items-center px-4 sm:px-6">
              <NostrLogin />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-black/10">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <p className="text-xs text-zinc-500">
              © 2026 satsPicks. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
