/** Hand-drawn flat line-art for the hero: a Dakar villa and a raffle ticket.
 *  Editorial style: thin dark strokes, flat fills, one orange accent. */
export default function HeroArt({ className }: { className?: string }) {
  const ink = "#18181b";
  const orange = "#f7931a";
  return (
    <svg
      viewBox="0 0 520 440"
      className={className}
      role="img"
      aria-label="Une villa et un ticket de tombola"
      fill="none"
    >
      {/* sun */}
      <circle cx="432" cy="74" r="34" fill={orange} />

      {/* ground */}
      <line x1="16" y1="330" x2="504" y2="330" stroke={ink} strokeWidth="1.5" />

      {/* house: main volume */}
      <rect x="90" y="172" width="220" height="158" fill="#fff" stroke={ink} strokeWidth="2" />
      {/* roof slab */}
      <rect x="78" y="156" width="244" height="16" fill="#fff" stroke={ink} strokeWidth="2" />
      {/* side volume */}
      <rect x="310" y="214" width="92" height="116" fill="#fff" stroke={ink} strokeWidth="2" />
      <line x1="310" y1="214" x2="402" y2="214" stroke={ink} strokeWidth="2" />

      {/* arched door */}
      <path
        d="M172 330 v-62 a28 28 0 0 1 56 0 v62 z"
        fill={orange}
        stroke={ink}
        strokeWidth="2"
      />

      {/* windows */}
      <rect x="112" y="200" width="38" height="32" fill="#fff" stroke={ink} strokeWidth="2" />
      <line x1="131" y1="200" x2="131" y2="232" stroke={ink} strokeWidth="1.5" />
      <rect x="250" y="200" width="38" height="32" fill="#fff" stroke={ink} strokeWidth="2" />
      <line x1="269" y1="200" x2="269" y2="232" stroke={ink} strokeWidth="1.5" />
      <rect x="338" y="242" width="32" height="26" fill="#fff" stroke={ink} strokeWidth="2" />

      {/* palm tree */}
      <path d="M452 330 c-4 -44 2 -74 10 -102" stroke={ink} strokeWidth="2" />
      <path d="M462 228 c-26 -14 -46 -12 -58 -2 c22 0 40 4 58 10" stroke={ink} strokeWidth="2" />
      <path d="M462 228 c-8 -22 -22 -32 -38 -34 c14 10 24 22 30 38" stroke={ink} strokeWidth="2" />
      <path d="M462 228 c8 -22 22 -32 38 -34 c-14 10 -24 22 -30 38" stroke={ink} strokeWidth="2" />
      <path d="M462 228 c26 -14 46 -12 58 -2 c-22 0 -40 4 -58 10" stroke={ink} strokeWidth="2" />

      {/* ticket: soft shadow then card, slightly rotated */}
      <g transform="translate(118 318) rotate(-7)">
        <rect x="8" y="10" width="304" height="98" rx="6" fill={ink} opacity="0.08" />
        <rect x="0" y="0" width="304" height="98" rx="6" fill="#fff" stroke={ink} strokeWidth="2" />
        {/* orange stripe */}
        <rect x="0" y="0" width="10" height="98" rx="3" fill={orange} />
        {/* perforation between body and stub */}
        <line
          x1="216"
          y1="8"
          x2="216"
          y2="90"
          stroke={ink}
          strokeWidth="1.5"
          strokeDasharray="4 5"
        />
        {/* body text */}
        <text
          x="28"
          y="32"
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize="11"
          letterSpacing="2"
          fill="#71717a"
        >
          SAMAKEUR
        </text>
        <text
          x="28"
          y="58"
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize="17"
          fontWeight="700"
          fill={ink}
        >
          N° 04 217
        </text>
        <text
          x="28"
          y="82"
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize="12"
          fill={orange}
        >
          10 000 SATS
        </text>
        {/* QR-like stub */}
        <g fill={ink}>
          <rect x="234" y="22" width="10" height="10" />
          <rect x="250" y="22" width="10" height="10" />
          <rect x="274" y="22" width="10" height="10" />
          <rect x="242" y="38" width="10" height="10" />
          <rect x="266" y="38" width="10" height="10" />
          <rect x="234" y="54" width="10" height="10" />
          <rect x="258" y="54" width="10" height="10" />
          <rect x="274" y="54" width="10" height="10" />
          <rect x="242" y="70" width="10" height="10" />
          <rect x="266" y="70" width="10" height="10" />
        </g>
      </g>
    </svg>
  );
}
