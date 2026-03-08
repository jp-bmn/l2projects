const THRESHOLDS = [
  { pct: 75, label: '75%', color: '#D29922' },
  { pct: 90, label: '90%', color: '#F85149' },
  { pct: 100, label: '100%', color: '#F85149' },
];

function getFillColor(percent) {
  if (percent >= 1) return '#F85149';
  if (percent >= 0.9) return '#F85149';
  if (percent >= 0.75) return '#D29922';
  return '#3FB950';
}

export default function BudgetProgress({ percent = 0, limitAmount = 10, currentSpend = 0 }) {
  const fillPct = Math.min(100, percent * 100);
  const fillColor = getFillColor(percent);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-muted text-xs uppercase tracking-wider font-mono">Budget Usage</h3>
        <div className="flex items-center gap-3">
          <span className="text-text-muted text-xs font-mono">
            <span className="text-text-primary font-bold">${currentSpend.toFixed(2)}</span> / ${limitAmount.toFixed(2)}
          </span>
          <span className="font-bold text-sm font-mono" style={{ color: fillColor }}>
            {fillPct.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Progress bar with markers */}
      <div className="relative">
        {/* Background bar */}
        <div className="h-4 bg-border rounded-full overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${fillPct}%`,
              background: `linear-gradient(to right, #3FB950, ${fillColor})`,
            }}
          />
        </div>

        {/* Threshold markers */}
        {THRESHOLDS.map((t) => (
          <div
            key={t.pct}
            className="absolute top-0 h-4 w-px"
            style={{ left: `${t.pct}%`, backgroundColor: 'rgba(255,255,255,0.3)' }}
          />
        ))}
      </div>

      {/* Threshold labels */}
      <div className="relative h-5 mt-1">
        {THRESHOLDS.map((t) => (
          <span
            key={t.pct}
            className="absolute text-xs font-mono"
            style={{ left: `${t.pct}%`, transform: 'translateX(-50%)', color: t.color, top: 0 }}
          >
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}
