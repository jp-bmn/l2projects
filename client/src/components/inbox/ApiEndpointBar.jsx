import { RATES } from '../../lib/constants';

export default function ApiEndpointBar({ activeFilter }) {
  const qs = activeFilter !== 'all' ? `?status=${activeFilter}` : '';
  const endpoint = `/api/inbox${qs}`;

  return (
    <div className="bg-bg border border-border rounded-lg px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3 font-mono text-sm">
        <span className="text-accent font-semibold">GET</span>
        <span className="text-text-muted">{endpoint}</span>
      </div>
      <span className="text-text-dim text-xs font-mono">
        <span className="text-success">${RATES.inbox_pull.toFixed(4)}</span> per check
      </span>
    </div>
  );
}
