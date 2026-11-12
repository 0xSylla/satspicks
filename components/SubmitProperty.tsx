"use client";

import { useMemo, useState } from "react";

const TICKET_SATS = 10_000;

export default function SubmitProperty({ btcXof }: { btcXof: number }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({
    owner_name: "",
    owner_contact: "",
    title: "",
    location: "",
    description: "",
    value_fcfa: "",
    min_proceeds_fcfa: "",
  });

  const ticketFcfa = Math.round((TICKET_SATS / 100_000_000) * btcXof);
  const minProceeds = Number(f.min_proceeds_fcfa) || 0;
  const estTickets = useMemo(
    () => (minProceeds > 0 ? Math.ceil((minProceeds * 1.1) / ticketFcfa) : 0),
    [minProceeds, ticketFcfa]
  );

  function set(key: keyof typeof f) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setF({ ...f, [key]: e.target.value });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...f,
        value_fcfa: Number(f.value_fcfa),
        min_proceeds_fcfa: Number(f.min_proceeds_fcfa),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Erreur lors de l'envoi");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-md bg-teal-700 p-6 text-white">
        <p className="text-lg font-bold">Proposition reçue, {f.owner_name} !</p>
        <p className="mt-2 text-sm leading-relaxed">
          Notre équipe vous contactera sous 48 h pour la suite : vérification du
          titre foncier avec un notaire partenaire, estimation contradictoire,
          puis mise en ligne de la tombola. Rien n&apos;est publié sans votre
          accord écrit.
        </p>
      </div>
    );
  }

  const field =
    "mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm";

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-md border border-black/10 bg-white p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm text-zinc-700" htmlFor="s-name">
            Votre nom *
          </label>
          <input id="s-name" required value={f.owner_name} onChange={set("owner_name")} className={field} placeholder="Awa Diop" />
        </div>
        <div>
          <label className="text-sm text-zinc-700" htmlFor="s-contact">
            Téléphone ou email *
          </label>
          <input id="s-contact" required value={f.owner_contact} onChange={set("owner_contact")} className={field} placeholder="+221 77 ..." />
        </div>
      </div>
      <div>
        <label className="text-sm text-zinc-700" htmlFor="s-title">
          Titre de l&apos;annonce *
        </label>
        <input id="s-title" required value={f.title} onChange={set("title")} className={field} placeholder="Villa 4 chambres, Ouakam" />
      </div>
      <div>
        <label className="text-sm text-zinc-700" htmlFor="s-location">
          Localisation *
        </label>
        <input id="s-location" required value={f.location} onChange={set("location")} className={field} placeholder="Ouakam, Dakar" />
      </div>
      <div>
        <label className="text-sm text-zinc-700" htmlFor="s-desc">
          Description du bien *
        </label>
        <textarea
          id="s-desc"
          required
          rows={4}
          value={f.description}
          onChange={set("description")}
          className={field}
          placeholder="Surface, nombre de pièces, état, titre foncier ou bail, situation..."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm text-zinc-700" htmlFor="s-value">
            Valeur estimée du bien (FCFA) *
          </label>
          <input id="s-value" required inputMode="numeric" value={f.value_fcfa} onChange={set("value_fcfa")} className={field} placeholder="35000000" />
        </div>
        <div>
          <label className="text-sm text-zinc-700" htmlFor="s-min">
            Montant minimum que vous voulez toucher (FCFA) *
          </label>
          <input id="s-min" required inputMode="numeric" value={f.min_proceeds_fcfa} onChange={set("min_proceeds_fcfa")} className={field} placeholder="30000000" />
        </div>
      </div>

      {estTickets > 0 && (
        <div className="fade-up rounded-md bg-white p-4 text-sm">
          <p className="font-semibold">💡 Votre prix plancher, garanti</p>
          <p className="tnum mt-1 text-zinc-700">
            Avec un ticket à {TICKET_SATS.toLocaleString("fr-FR")} sats (≈{" "}
            {ticketFcfa.toLocaleString("fr-FR")} F au cours actuel), il faudra
            vendre au moins{" "}
            <strong>{estTickets.toLocaleString("fr-FR")} tickets</strong> pour
            garantir vos {minProceeds.toLocaleString("fr-FR")} F (frais de
            plateforme inclus). En dessous de ce seuil, la tombola est annulée
            et <strong>vous ne perdez rien</strong> : le bien reste à vous.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-md bg-btc-500 px-4 py-3 font-semibold text-black hover:bg-btc-600"
      >
        Envoyer ma proposition
      </button>
      <p className="text-xs text-zinc-600">
        Gratuit et sans engagement. La mise en ligne n&apos;a lieu qu&apos;après
        vérification du titre foncier par un notaire partenaire et votre accord
        écrit.
      </p>
    </form>
  );
}
