import useStore from '../../store/useStore';

export default function AlertBanner() {
  const budgetPercent = useStore((s) => s.budgetPercent);
  const budget = useStore((s) => s.budget);

  if (budgetPercent < 0.75) return null;

  const pct = Math.round(budgetPercent * 100);
  const isHardStop = budgetPercent >= 1 && budget.hard_stop_at_100;

  let bgClass, borderClass, textClass, icon, message;

  if (budgetPercent >= 1) {
    bgClass = 'bg-danger/10';
    borderClass = 'border-danger';
    textClass = 'text-danger';
    icon = '✕';
    message = isHardStop
      ? `Budget limit reached (${pct}%) — Sends are blocked until the next period.`
      : `Budget limit reached (${pct}%) — Monitor your spend closely.`;
  } else if (budgetPercent >= 0.9) {
    bgClass = 'bg-danger/10';
    borderClass = 'border-danger';
    textClass = 'text-danger';
    icon = '⚠';
    message = `Critical: ${pct}% of budget used. Approaching the limit.`;
  } else {
    bgClass = 'bg-warning/10';
    borderClass = 'border-warning';
    textClass = 'text-warning';
    icon = '⚠';
    message = `Warning: ${pct}% of budget used this period.`;
  }

  return (
    <div className={`${bgClass} border ${borderClass} ${textClass} rounded-lg px-4 py-3 mb-4 flex items-center gap-3 font-mono text-sm`}>
      <span className="text-base shrink-0">{icon}</span>
      <span>{message}</span>
    </div>
  );
}
