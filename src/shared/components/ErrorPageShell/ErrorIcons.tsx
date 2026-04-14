/* ── Compass SVG — lost at sea ── */
export function CompassIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <circle
        cx="40"
        cy="40"
        r="36"
        stroke="#00C5D4"
        strokeWidth="2"
        strokeDasharray="4 3"
        opacity="0.5"
      />
      <circle
        cx="40"
        cy="40"
        r="28"
        stroke="#00C5D4"
        strokeWidth="1.5"
        opacity="0.3"
      />
      <path
        d="M40 16 L44 40 L40 38 L36 40 Z"
        fill="#F0177A"
        opacity="0.85"
      />
      <path
        d="M40 64 L36 40 L40 42 L44 40 Z"
        fill="#00C5D4"
        opacity="0.85"
      />
      <circle cx="40" cy="40" r="3" fill="#00C5D4" />
      <text
        x="40"
        y="12"
        textAnchor="middle"
        fill="#F0177A"
        fontSize="6"
        fontWeight="bold"
        fontFamily="Nunito, sans-serif"
      >
        N
      </text>
      <text
        x="40"
        y="75"
        textAnchor="middle"
        fill="#00C5D4"
        fontSize="5"
        fontFamily="Nunito, sans-serif"
        opacity="0.6"
      >
        S
      </text>
      <text
        x="72"
        y="42"
        textAnchor="middle"
        fill="#00C5D4"
        fontSize="5"
        fontFamily="Nunito, sans-serif"
        opacity="0.6"
      >
        E
      </text>
      <text
        x="8"
        y="42"
        textAnchor="middle"
        fill="#00C5D4"
        fontSize="5"
        fontFamily="Nunito, sans-serif"
        opacity="0.6"
      >
        O
      </text>
      <text
        x="58"
        y="22"
        fill="#F0177A"
        fontSize="12"
        fontWeight="bold"
        fontFamily="Nunito, sans-serif"
        opacity="0.6"
      >
        ?
      </text>
    </svg>
  );
}

/* ── Wrench + Gear SVG — fixing things ── */
export function WrenchIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <path
        d="M54 32.5a2 2 0 0 1 2-1.7h2.4a2 2 0 0 1 2 1.7l.3 2a8.7 8.7 0 0 1 1.7 1l1.9-.8a2 2 0 0 1 2.4.7l1.2 2.1a2 2 0 0 1-.4 2.4l-1.5 1.3a8.4 8.4 0 0 1 0 2l1.5 1.3a2 2 0 0 1 .4 2.4l-1.2 2a2 2 0 0 1-2.4.8l-1.9-.8a8.7 8.7 0 0 1-1.7 1l-.3 2a2 2 0 0 1-2 1.7H56a2 2 0 0 1-2-1.7l-.3-2a8.7 8.7 0 0 1-1.7-1l-1.9.8a2 2 0 0 1-2.4-.7l-1.2-2.1a2 2 0 0 1 .4-2.4l1.5-1.3a8.4 8.4 0 0 1 0-2l-1.5-1.3a2 2 0 0 1-.4-2.4l1.2-2a2 2 0 0 1 2.4-.8l1.9.8a8.7 8.7 0 0 1 1.7-1l.3-2z"
        stroke="#00C5D4"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <circle
        cx="57"
        cy="40"
        r="4"
        stroke="#00C5D4"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <path
        d="M20 58l20-20a10 10 0 0 1 3-8 10 10 0 0 1 12-1l-5 5 1 4 4 1 5-5a10 10 0 0 1-1 12 10 10 0 0 1-8 3L30 70a4 4 0 0 1-6 0l-4-4a4 4 0 0 1 0-6z"
        stroke="#F0177A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      <circle cx="16" cy="20" r="1.5" fill="#00C5D4" opacity="0.5" />
      <circle cx="22" cy="14" r="1" fill="#F0177A" opacity="0.4" />
      <circle cx="64" cy="60" r="1.5" fill="#FF7A00" opacity="0.5" />
      <circle cx="70" cy="54" r="1" fill="#00C5D4" opacity="0.4" />
    </svg>
  );
}

/* ── Clock/timer SVG — be right back ── */
export function ClockIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      {/* Clock face */}
      <circle
        cx="40"
        cy="42"
        r="28"
        stroke="#00C5D4"
        strokeWidth="2"
        opacity="0.5"
      />
      {/* Hour ticks */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <line
          key={deg}
          x1="40"
          y1="17"
          x2="40"
          y2="20"
          stroke="#00C5D4"
          strokeWidth={deg % 90 === 0 ? '2' : '1'}
          opacity={deg % 90 === 0 ? '0.6' : '0.3'}
          transform={`rotate(${deg} 40 42)`}
        />
      ))}
      {/* Hour hand */}
      <path
        d="M40 42 L40 28"
        stroke="#F0177A"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Minute hand */}
      <path
        d="M40 42 L52 36"
        stroke="#00C5D4"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Center dot */}
      <circle cx="40" cy="42" r="2.5" fill="#F0177A" opacity="0.8" />
      {/* Decorative stars — something magical is happening */}
      <g opacity="0.4">
        <path d="M12 16 L14 12 L16 16 L12 16z" fill="#FF7A00" />
        <path d="M64 10 L65.5 7 L67 10 L64 10z" fill="#00C5D4" />
        <path d="M68 68 L69.5 65 L71 68 L68 68z" fill="#F0177A" />
      </g>
    </svg>
  );
}
