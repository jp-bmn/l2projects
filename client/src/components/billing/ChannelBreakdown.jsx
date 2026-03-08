const CHANNEL_CONFIG = {
  email: { label: 'Email', color: '#58A6FF' },
  slack: { label: 'Slack', color: '#A371F7' },
  inbox_pull: { label: 'Inbox Pull', color: '#DB6D28' },
};

export default function ChannelBreakdown({ byChannel = {}, currentSpend }) {
  const channels = Object.entries(byChannel).filter(([, v]) => v.cost > 0);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-text-muted text-xs uppercase tracking-wider font-mono mb-4">Channel Breakdown</h3>
      {channels.length === 0 ? (
        <p className="text-text-dim text-sm font-mono">No channel data yet</p>
      ) : (
        <div className="flex flex-col gap-3">
          {channels.map(([key, data]) => {
            const config = CHANNEL_CONFIG[key] || { label: key, color: '#8B949E' };
            const pct = currentSpend > 0 ? (data.cost / currentSpend) * 100 : 0;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-text-muted text-xs font-mono">{config.label}</span>
                  <span className="text-text-primary text-xs font-mono">${data.cost.toFixed(4)}</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, pct)}%`, backgroundColor: config.color }}
                  />
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-text-dim text-xs font-mono">{data.count.toLocaleString()} msgs</span>
                  <span className="text-text-dim text-xs font-mono">{pct.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
