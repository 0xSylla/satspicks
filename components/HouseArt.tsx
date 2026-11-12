/** Lightweight decorative SVG of a Dakar-style villa at dusk — used when a
 *  raffle has no photo. Pure vector: a few hundred bytes, zero requests. */
export default function HouseArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 220"
      className={className}
      role="img"
      aria-label="Illustration d'une villa"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1917" />
          <stop offset="55%" stopColor="#7c2d12" />
          <stop offset="100%" stopColor="#f7931a" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#sky)" />
      <circle cx="320" cy="70" r="26" fill="#f7931a" opacity="0.9" />
      <circle cx="320" cy="70" r="36" fill="#f7931a" opacity="0.25" />
      {/* ground */}
      <rect y="170" width="400" height="50" fill="#44403c" />
      {/* house */}
      <rect x="70" y="100" width="180" height="72" rx="3" fill="#faf6f0" />
      <rect x="70" y="88" width="180" height="16" rx="3" fill="#c2410c" />
      <rect x="250" y="120" width="70" height="52" rx="3" fill="#e5d8c4" />
      {/* door + windows */}
      <rect x="140" y="126" width="30" height="46" rx="2" fill="#1c1917" />
      <rect x="90" y="120" width="28" height="22" rx="2" fill="#0f766e" />
      <rect x="196" y="120" width="28" height="22" rx="2" fill="#0f766e" />
      <rect x="264" y="132" width="20" height="18" rx="2" fill="#0f766e" />
      {/* palm */}
      <rect x="348" y="120" width="6" height="52" fill="#44403c" />
      <path
        d="M351 122 q-24 -16 -38 -6 q20 2 38 10 q-6 -24 -22 -30 q14 2 24 24 q10 -22 24 -24 q-16 6 -22 30 q18 -8 38 -10 q-14 -10 -40 6"
        fill="#0f766e"
      />
    </svg>
  );
}
