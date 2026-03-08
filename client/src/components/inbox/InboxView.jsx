import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import FilterTabs from './FilterTabs';
import ApiEndpointBar from './ApiEndpointBar';
import MessageCard from './MessageCard';

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-border" />
        <div className="h-4 w-32 bg-border rounded" />
        <div className="h-4 w-12 bg-border rounded ml-2" />
      </div>
      <div className="h-3 w-48 bg-border rounded mb-1" />
      <div className="h-3 w-full bg-border rounded" />
    </div>
  );
}

export default function InboxView() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [messages, setMessages] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const fetchInbox = useCallback(async (filter) => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await api.getInbox(params);
      setMessages(data.messages || []);
      setCounts(data.counts || {});
    } catch {
      // Backend unavailable — silently ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInbox(activeFilter);
  }, []);

  function handleFilterChange(filter) {
    setActiveFilter(filter);
    fetchInbox(filter);
  }

  async function handleSimulate() {
    setSimulating(true);
    try {
      await api.simulateInbound();
      await fetchInbox(activeFilter);
    } catch {
      // ignore
    } finally {
      setSimulating(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-text-primary text-xl font-bold font-mono mb-1">Pull Inbox</h1>
          <p className="text-text-muted text-sm font-mono">Retrieve inbound messages via GET request</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="border border-border bg-transparent text-text-muted hover:text-text-primary hover:bg-card-hover font-mono text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {simulating ? 'Simulating...' : 'Simulate Inbound'}
          </button>
          <button
            onClick={() => fetchInbox(activeFilter)}
            disabled={loading}
            className="bg-accent text-white font-bold font-mono text-sm px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Fetching...' : 'Check Inbox'}
          </button>
        </div>
      </div>

      {/* API endpoint bar */}
      <div className="mb-4">
        <ApiEndpointBar activeFilter={activeFilter} />
      </div>

      {/* Filter tabs */}
      <div className="mb-4">
        <FilterTabs activeFilter={activeFilter} onFilterChange={handleFilterChange} counts={counts} />
      </div>

      {/* Message list */}
      <div className="flex flex-col gap-2">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : messages.length === 0 ? (
          <div className="bg-card border border-border rounded-lg py-16 text-center">
            <p className="text-text-dim text-sm font-mono mb-2">No messages yet.</p>
            <p className="text-text-dim text-xs font-mono">
              Click <span className="text-accent">"Simulate Inbound"</span> to generate test messages.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageCard key={msg.id} message={msg} onRefetch={() => fetchInbox(activeFilter)} />
          ))
        )}
      </div>
    </div>
  );
}
