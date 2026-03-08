import { useState } from 'react';
import { api } from '../../lib/api';
import useStore from '../../store/useStore';

export default function DevToolsPanel() {
  const addToast = useStore((s) => s.addToast);
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    if (!window.confirm('Reset all seed data? This cannot be undone.')) return;
    setResetting(true);
    try {
      await api.resetSeed();
      addToast({ type: 'success', message: 'Seed data reset.' });
    } catch {
      addToast({ type: 'error', message: 'Reset failed.' });
    } finally {
      setResetting(false);
    }
  }

  async function handleSimulate() {
    try {
      await api.simulateInbound();
      addToast({ type: 'success', message: 'Inbound message simulated.' });
    } catch {
      addToast({ type: 'error', message: 'Simulate failed.' });
    }
  }

  return (
    <div className="border-t border-border pt-3 mt-2">
      <p className="text-text-dim text-xs uppercase tracking-wider font-mono px-3 mb-2">Dev Tools</p>
      <button
        onClick={handleSimulate}
        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-text-dim text-xs font-mono hover:text-text-muted rounded transition-colors cursor-pointer bg-transparent border-0"
      >
        <span>+ Simulate Inbound</span>
      </button>
      <button
        onClick={handleReset}
        disabled={resetting}
        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-text-dim text-xs font-mono hover:text-danger rounded transition-colors cursor-pointer disabled:opacity-50 bg-transparent border-0"
      >
        <span>{resetting ? 'Resetting...' : '↺ Reset Seed Data'}</span>
      </button>
    </div>
  );
}
