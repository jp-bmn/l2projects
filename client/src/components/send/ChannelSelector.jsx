import { RATES } from '../../lib/constants';

const CHANNELS = [
  {
    id: 'email',
    label: 'Email',
    icon: '✉',
    cost: RATES.email_send,
    description: 'Send to any email address',
  },
  {
    id: 'slack',
    label: 'Slack',
    icon: '#',
    cost: RATES.slack_send,
    description: 'Send to a channel or user',
  },
];

export default function ChannelSelector({ selectedChannel, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CHANNELS.map((ch) => (
        <button
          key={ch.id}
          onClick={() => onSelect(ch.id)}
          className={`rounded-lg p-4 cursor-pointer transition-all text-left border-0 ${
            selectedChannel === ch.id
              ? 'border-2 border-accent bg-accent-dim'
              : 'border border-border bg-card hover:bg-card-hover'
          }`}
          style={{ border: selectedChannel === ch.id ? '2px solid #58A6FF' : '1px solid #30363D' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{ch.icon}</span>
            <span className={`font-semibold text-sm font-mono ${selectedChannel === ch.id ? 'text-accent' : 'text-text-primary'}`}>
              {ch.label}
            </span>
          </div>
          <p className="text-text-muted text-xs font-mono">{ch.description}</p>
          <p className="text-success text-xs font-mono mt-2">${ch.cost.toFixed(3)}/msg</p>
        </button>
      ))}
    </div>
  );
}
