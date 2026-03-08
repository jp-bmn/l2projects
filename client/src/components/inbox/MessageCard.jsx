import { useState } from 'react';
import { api } from '../../lib/api';

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
  if (channel === 'inbox_pull') {
    return (
      <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(219,109,40,0.2)', color: '#DB6D28' }}>
        Inbox
      </span>
    );
  }
  return (
    <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(88,166,255,0.2)', color: '#58A6FF' }}>
      Email
    </span>
  );
}

export default function MessageCard({ message, onRefetch }) {
  const [loading, setLoading] = useState(false);
  const isUnread = message.status === 'unread';
  const isArchived = message.status === 'archived';

  async function handleAction(status) {
    setLoading(true);
    try {
      await api.updateMessage(message.id, { status });
      onRefetch?.();
    } catch {
      // silently ignore for now
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`rounded-lg p-4 border border-border transition-all ${
        isUnread
          ? 'border-l-2 border-l-accent bg-card-hover'
          : 'border-l-2 border-l-transparent bg-card'
      } ${isArchived ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isUnread && (
              <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
            )}
            <span className="text-text-primary font-semibold text-sm font-mono truncate">{message.sender}</span>
            <ChannelBadge channel={message.channel} />
            <span className="text-text-dim text-xs font-mono ml-auto shrink-0">{formatTime(message.created_at)}</span>
          </div>
          {message.subject && (
            <p className="text-text-muted text-sm font-mono mb-1 truncate">{message.subject}</p>
          )}
          <p className="text-text-dim text-xs font-mono line-clamp-2">
            {message.body?.slice(0, 150)}{message.body?.length > 150 ? '…' : ''}
          </p>
        </div>
      </div>

      {/* Actions */}
      {!isArchived && (
        <div className="flex items-center gap-2 mt-3">
          {isUnread && (
            <button
              onClick={() => handleAction('read')}
              disabled={loading}
              className="text-xs font-mono px-3 py-1 rounded border border-border text-text-muted hover:text-text-primary hover:bg-card-hover transition-colors disabled:opacity-50 cursor-pointer bg-transparent"
            >
              Mark Read
            </button>
          )}
          <button
            onClick={() => handleAction('archived')}
            disabled={loading}
            className="text-xs font-mono px-3 py-1 rounded border border-border text-text-muted hover:text-text-primary hover:bg-card-hover transition-colors disabled:opacity-50 cursor-pointer bg-transparent"
          >
            Archive
          </button>
        </div>
      )}
    </div>
  );
}
