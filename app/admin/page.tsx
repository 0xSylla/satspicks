"use client";

import { useCallback, useEffect, useState } from "react";
import type { Raffle, Submission } from "@/lib/types";

type RaffleRow = Raffle & { paid_tickets: number };

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [raffles, setRaffles] = useState<RaffleRow[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    value_fcfa: "25000000",
    ticket_price_sats: "10000",
    min_tickets: "10",
    max_tickets: "5000",
    deadline: "2026-12-31",
  });

  const refresh = useCallback(async (key?: string) => {
    const res = await fetch("/api/raffles");
    const data = await res.json();
    setRaffles(data.raffles ?? []);
    const k = key ?? "";
    if (k) {
      const sres = await fetch("/api/submissions", {
        headers: { "x-admin-key": k },
      });
      if (sres.ok) {
        const sdata = await sres.json();
        setSubmissions(sdata.submissions ?? []);
      }
    }
  }, []);

  useEffect(() => {
    let k = "";
    try {
      k = localStorage.getItem("satspicks_admin_key") ?? "";
      if (k) setAdminKey(k);
    } catch {}
    void refresh(k);
  }, [refresh]);

  function saveKey(k: string) {
    setAdminKey(k);
    try {
      localStorage.setItem("satspicks_admin_key", k);
    } catch {}
  }

  async function call(path: string, body?: unknown) {
    setMsg("");
    const res = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(`❌ ${data.error ?? res.status}`);
    } else {
      setMsg("OK " + JSON.stringify(data).slice(0, 300));
      await refresh(adminKey);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin</h1>

      <div className="lg:grid lg:grid-cols-[380px_1fr] lg:items-start lg:gap-8">
      <div className="space-y-6">
      <div className="rounded-md border border-black/10 bg-white p-5 space-y-2">
        <label className="block text-sm text-zinc-700" htmlFor="admin-key">
          Clé admin (ADMIN_KEY du .env)
        </label>
        <input
          id="admin-key"
          type="password"
          value={adminKey}
          onChange={(e) => saveKey(e.target.value)}
          className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
        />
      </div>

      {msg && (
        <p className="rounded-md bg-white p-3 text-xs break-all">{msg}</p>
      )}

      <section className="rounded-md border border-black/10 bg-white p-5 space-y-3">
        <h2 className="font-semibold">Créer une tombola</h2>
        {(
          [
            ["title", "Titre"],
            ["description", "Description"],
            ["location", "Lieu"],
            ["value_fcfa", "Valeur (FCFA)"],
            ["ticket_price_sats", "Prix du ticket (sats)"],
            ["min_tickets", "Tickets minimum"],
            ["max_tickets", "Tickets maximum"],
            ["deadline", "Date limite (YYYY-MM-DD)"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm text-zinc-700" htmlFor={`f-${key}`}>
              {label}
            </label>
            <input
              id={`f-${key}`}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            />
          </div>
        ))}
        <button
          onClick={() => call("/api/raffles", form)}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-black/10"
        >
          Créer
        </button>
      </section>
      </div>

      <div className="mt-6 space-y-6 lg:mt-0">

      <section className="space-y-3">
        <h2 className="font-semibold">
          Propositions de biens{" "}
          {submissions.filter((s) => s.status === "pending").length > 0 && (
            <span className="rounded-sm bg-btc-500 px-2 py-0.5 text-xs font-bold text-black">
              {submissions.filter((s) => s.status === "pending").length} en
              attente
            </span>
          )}
        </h2>
        {submissions.length === 0 ? (
          <p className="text-sm text-zinc-600">
            {adminKey ? "Aucune proposition." : "Entrez la clé admin pour charger les propositions."}
          </p>
        ) : (
          submissions.map((s) => (
            <div
              key={s.id}
              className="space-y-2 rounded-md border border-black/10 bg-white p-4 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-xs text-zinc-600">
                    {s.location}, par {s.owner_name} ({s.owner_contact})
                  </p>
                </div>
                <span
                  className={`rounded-sm px-2 py-0.5 text-xs ${
                    s.status === "pending"
                      ? "bg-btc-500 text-white"
                      : s.status === "approved"
                        ? "bg-teal-700 text-white"
                        : "bg-white text-zinc-600"
                  }`}
                >
                  {s.status}
                </span>
              </div>
              <p className="text-zinc-700">{s.description}</p>
              <p className="tnum text-xs text-zinc-600">
                Valeur : {s.value_fcfa.toLocaleString("fr-FR")} F, minimum
                voulu : {s.min_proceeds_fcfa.toLocaleString("fr-FR")} F
              </p>
              {s.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => call(`/api/submissions/${s.id}/approve`, {})}
                    className="rounded-md bg-teal-700 px-3 py-1.5 font-medium text-white"
                  >
                    ✓ Approuver → créer la tombola
                  </button>
                  <button
                    onClick={() => call(`/api/submissions/${s.id}/reject`, {})}
                    className="rounded-md border border-zinc-900 px-3 py-1.5 hover:bg-white"
                  >
                    ✗ Refuser
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Tombolas</h2>
        {raffles.map((r) => (
          <div
            key={r.id}
            className="rounded-md border border-black/10 bg-white p-4 flex flex-wrap items-center justify-between gap-3 text-sm"
          >
            <div>
              <p className="font-medium">{r.title}</p>
              <p className="text-xs text-zinc-600">
                {r.status}, {r.paid_tickets} tickets payés
              </p>
            </div>
            <div className="flex gap-2">
              {r.status === "open" && (
                <button
                  onClick={() => call(`/api/raffles/${r.id}/close`)}
                  className="rounded-md border border-zinc-900 px-3 py-1.5 hover:bg-white"
                >
                  Clôturer (commit)
                </button>
              )}
              {r.status === "closed" && (
                <button
                  onClick={() => call(`/api/raffles/${r.id}/draw`)}
                  className="rounded-md bg-btc-500 px-3 py-1.5 font-medium text-black hover:bg-btc-600"
                >
                  Tirer au sort
                </button>
              )}
            </div>
          </div>
        ))}
      </section>
      </div>
      </div>
    </div>
  );
}
