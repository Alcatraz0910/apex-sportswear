const ITEMS = [
  "Manchester City",
  "Real Madrid",
  "LA Lakers",
  "Red Bull Racing",
  "Arsenal",
  "Barcelona",
  "Ferrari",
  "Paris Saint-Germain",
  "Brazil",
  "Golden State Warriors",
  "Liverpool",
  "Bayern Munich",
];

export function Marquee() {
  // Duplicate the row so the -50% translate loops seamlessly.
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden border-y border-border bg-card/40 py-4">
      <div className="marquee-track flex gap-8 whitespace-nowrap">
        {row.map((t, i) => (
          <span
            key={i}
            className="font-display text-sm font-semibold uppercase tracking-widest text-muted"
          >
            {t} <span className="text-accent">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
