import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import { api } from '../../lib/api';

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-2">
      <span className="text-text-primary font-mono text-sm">{label}</span>
      <div
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
          checked ? 'bg-accent' : 'bg-border'
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
    </label>
  );
}

export default function BudgetSettingsModal() {
  const setBudgetModal = useStore((s) => s.setBudgetModal);
  const storeBudget = useStore((s) => s.budget);
  const setBudget = useStore((s) => s.setBudget);
  const addToast = useStore((s) => s.addToast);

  const [limitAmount, setLimitAmount] = useState(storeBudget.limit_amount || 10);
  const [alert75, setAlert75] = useState(storeBudget.alert_at_75 ?? true);
  const [alert90, setAlert90] = useState(storeBudget.alert_at_90 ?? true);
  const [hardStop, setHardStop] = useState(storeBudget.hard_stop_at_100 ?? false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getBudget().then((data) => {
      if (data.budget) {
        setLimitAmount(data.budget.limit_amount);
        setAlert75(data.budget.alert_at_75);
        setAlert90(data.budget.alert_at_90);
        setHardStop(data.budget.hard_stop_at_100);
      }
    }).catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    const payload = {
      limit_amount: parseFloat(limitAmount),
      period: 'monthly',
      alert_at_75: alert75,
      alert_at_90: alert90,
      hard_stop_at_100: hardStop,
    };
    try {
      await api.setBudget(payload);
      setBudget(payload);
      addToast({ type: 'success', message: 'Budget settings saved.' });
      setBudgetModal(false);
    } catch {
      addToast({ type: 'error', message: 'Failed to save budget settings.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) setBudgetModal(false); }}
    >
      <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-text-primary text-xl font-bold font-mono">Budget Settings</h2>
          <button
            onClick={() => setBudgetModal(false)}
            className="text-text-dim hover:text-text-muted text-xl bg-transparent border-0 cursor-pointer font-mono"
          >
            ✕
          </button>
        </div>

        {/* Monthly limit */}
        <div className="mb-5">
          <label className="text-text-muted text-xs uppercase tracking-wider font-mono block mb-1.5">
            Monthly Limit (USD)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-text-muted font-mono">$</span>
            <input
              type="number"
              min="1"
              step="1"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              className="flex-1 bg-bg border border-border rounded-lg px-4 py-2 text-text-primary font-mono text-sm focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="border border-border rounded-lg px-4 mb-5">
          <Toggle checked={alert75} onChange={setAlert75} label="Alert at 75% usage" />
          <div className="border-t border-border" />
          <Toggle checked={alert90} onChange={setAlert90} label="Alert at 90% usage" />
          <div className="border-t border-border" />
          <Toggle checked={hardStop} onChange={setHardStop} label="Block sends at 100%" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBudgetModal(false)}
            className="flex-1 border border-border bg-transparent text-text-muted hover:text-text-primary hover:bg-card-hover font-mono text-sm py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-accent text-white font-bold font-mono text-sm py-2.5 rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
