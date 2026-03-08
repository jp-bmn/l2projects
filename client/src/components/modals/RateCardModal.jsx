import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import { api } from '../../lib/api';
import { RATES } from '../../lib/constants';

const RATE_ROWS = [
  { label: 'Email Send', icon: '✉', key: 'email_send', unit: 'per message' },
  { label: 'Slack Send', icon: '#', key: 'slack_send', unit: 'per message' },
  { label: 'Inbox Pull', icon: '↓', key: 'inbox_pull', unit: 'per request' },
  { label: 'Storage', icon: '◈', key: 'storage_per_day', unit: 'per msg/day' },
];

export default function RateCardModal() {
  const setRateCardModal = useStore((s) => s.setRateCardModal);
  const [rates, setRates] = useState(RATES);

  useEffect(() => {
    api.getRates().then((data) => {
      if (data.rates) setRates(data.rates);
    }).catch(() => {});
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) setRateCardModal(false); }}
    >
      <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-text-primary text-xl font-bold font-mono">Rate Card</h2>
          <button
            onClick={() => setRateCardModal(false)}
            className="text-text-dim hover:text-text-muted text-xl bg-transparent border-0 cursor-pointer font-mono"
          >
            ✕
          </button>
        </div>

        {/* Rate rows */}
        <div className="flex flex-col gap-4">
          {RATE_ROWS.map((row) => (
            <div key={row.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-text-muted text-base w-6 text-center">{row.icon}</span>
                <div>
                  <p className="text-text-primary font-mono text-sm font-semibold">{row.label}</p>
                  <p className="text-text-dim font-mono text-xs">{row.unit}</p>
                </div>
              </div>
              <span className="text-success font-bold font-mono text-lg">
                ${(rates[row.key] || 0).toFixed(4)}
              </span>
            </div>
          ))}
        </div>

        <p className="text-text-dim text-xs font-mono mt-4">
          Rates shown in USD. Billed per event, no minimums.
        </p>
      </div>
    </div>
  );
}
