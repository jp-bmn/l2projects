import useStore from '../../store/useStore';

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function formatCost(cost) {
  return `$${cost.toFixed(4)}`;
}

function getEventBorderColor(eventType) {
  switch (eventType) {
    case 'send': return 'border-l-accent';
    case 'inbox_pull': return 'border-l-orange';
    case 'alert': return 'border-l-warning';
    case 'status': return 'border-l-success';
    default: return 'border-l-border';
  }
}

export default function ActivityPanel() {
  const activityEvents = useStore((s) => s.activityEvents);
  const sessionTotal = useStore((s) => s.sessionTotal);
  const showActivityPanel = useStore((s) => s.showActivityPanel);

  if (!showActivityPanel) return null;

  return (
    <aside className="w-[320px] h-screen flex flex-col shrink-0 bg-card border-l border-border sticky top-0">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
        <span className="text-text-primary font-mono text-sm font-semibold">Activity Feed</span>
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-y-auto">
        {activityEvents.length === 0 ? (
          <div className="px-4 py-8 text-text-dim text-xs font-mono text-center">
            No activity yet.
          </div>
        ) : (
          <div className="flex flex-col">
            {activityEvents.map((event) => (
              <div
                key={event.id}
                className={`border-l-2 ${getEventBorderColor(event.event_type)} px-4 py-3 border-b border-border hover:bg-card-hover transition-colors`}
              >
                <p className="text-text-primary text-sm font-mono leading-snug">{event.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  {event.cost > 0 && (
                    <span className="text-success text-xs font-mono">{formatCost(event.cost)}</span>
                  )}
                  {event.created_at && (
                    <span className="text-text-dim text-xs font-mono">{formatTime(event.created_at)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div className="bg-card border-t border-border px-4 py-3 flex items-center justify-between">
        <span className="text-text-muted text-xs font-mono uppercase tracking-wider">Session Total</span>
        <span className="text-success font-bold font-mono text-sm">{formatCost(sessionTotal)}</span>
      </div>
    </aside>
  );
}
