const CARDS = [
  {
    label: 'Current Spend',
    key: 'currentSpend',
    color: '#58A6FF',
    format: (v) => `$${(v || 0).toFixed(2)}`,
  },
  {
    label: 'Messages Sent',
    key: 'messagesSent',
    color: '#3FB950',
    format: (v) => (v || 0).toLocaleString(),
  },
  {
    label: 'Inbox Pulls',
    key: 'inboxPulls',
    color: '#DB6D28',
    format: (v) => (v || 0).toLocaleString(),
  },
  {
    label: 'Budget Remaining',
    key: 'budgetRemaining',
    color: '#D29922',
    format: (v) => `$${Math.max(0, v || 0).toFixed(2)}`,
  },
];

export default function KpiCards({ currentSpend, messagesSent, inboxPulls, budgetRemaining }) {
  const data = { currentSpend, messagesSent, inboxPulls, budgetRemaining };

  return (
    <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="bg-card border border-border rounded-lg p-4"
          style={{ borderTop: `3px solid ${card.color}` }}
        >
          <p className="text-text-muted text-xs uppercase tracking-wider font-mono mb-2">{card.label}</p>
          <p className="text-text-primary text-2xl font-bold font-mono">{card.format(data[card.key])}</p>
        </div>
      ))}
    </div>
  );
}
