// Simple decorative background blobs, positioned off-canvas in corners.
export function BackdropBlobs() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-lilac/60" />
      <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-mint/50" />
      <div className="absolute -bottom-32 left-1/4 w-80 h-80 rounded-full bg-butter/50" />
    </div>
  );
}

// Open notebook illustration used on the auth screens.
export function NotebookDoodle() {
  return (
    <svg
      viewBox="0 0 200 160"
      role="img"
      aria-label="An open notebook with a pencil"
      className="w-full max-w-sm"
    >
      <path
        d="M20 20 L100 15 L100 140 L20 145 Z"
        fill="var(--color-card)"
        stroke="oklch(0.34 0.045 295 / 0.25)"
        strokeWidth="2"
      />
      <path
        d="M100 15 L180 20 L180 145 L100 140 Z"
        fill="var(--color-butter)"
        stroke="oklch(0.34 0.045 295 / 0.25)"
        strokeWidth="2"
      />
      {[40, 60, 80].map((y) => (
        <line
          key={y}
          x1="32"
          y1={y}
          x2="88"
          y2={y - 1}
          stroke="oklch(0.34 0.045 295 / 0.2)"
          strokeWidth="2"
        />
      ))}
      {[40, 60, 80].map((y) => (
        <line
          key={`r-${y}`}
          x1="112"
          y1={y - 1}
          x2="168"
          y2={y}
          stroke="oklch(0.34 0.045 295 / 0.2)"
          strokeWidth="2"
        />
      ))}
      <path
        d="M178 25 L192 35 L165 100 L152 90 Z"
        fill="var(--color-peach)"
        stroke="oklch(0.34 0.045 295 / 0.25)"
        strokeWidth="2"
      />
      <circle cx="18" cy="30" r="7" fill="var(--color-sky)" />
      <circle cx="105" cy="8" r="7" fill="var(--color-lilac)" />
    </svg>
  );
}

// Shown on the dashboard when there are no notes yet.
export function EmptyDoodle() {
  return (
    <svg viewBox="0 0 160 120" role="img" aria-label="A blank sheet of paper" className="w-40 mx-auto">
      <rect
        x="30"
        y="20"
        width="100"
        height="90"
        rx="8"
        fill="var(--color-card)"
        stroke="oklch(0.34 0.045 295 / 0.2)"
        strokeWidth="2"
      />
      <ellipse cx="80" cy="45" rx="22" ry="10" fill="var(--color-secondary)" />
      <circle cx="60" cy="45" r="10" fill="var(--color-secondary)" />
      <circle cx="100" cy="45" r="10" fill="var(--color-secondary)" />
    </svg>
  );
}
