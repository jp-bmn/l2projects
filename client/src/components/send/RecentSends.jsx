import StatusTimeline from './StatusTimeline';

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMin = Math.floor((now - date) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function ChannelBadge({ channel }) {
  if (channel === 'slack') {
    return (
      <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(163,113,247,0.2)', color: '#A371F7' }}>
        Slack
      </span>
    );
  }
  return (
    <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(88,166,255,0.2)', color: '#58A6FF' }}>
      Email
    </span>
  );
}

export default function RecentSends({ messages }) {
  if (!messages || messages.length === 0) {
    return (
      <div className="text-text-dim text-sm font-mono text-center py-6">
        No recent sends. Send a message above to see it here.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {messages.map((msg) => (
        <div key={msg.id} className="bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <ChannelBadge channel={msg.channel} />
            <span className="text-text-primary text-sm font-mono truncate">{msg.recipient}</span>
            {msg.subject && (
              <span className="text-text-muted text-xs font-mono truncate hidden sm:block">— {msg.subject}</span>
            )}
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <StatusTimeline status={msg.status} />
            <span className="text-text-dim text-xs font-mono">{formatTime(msg.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
