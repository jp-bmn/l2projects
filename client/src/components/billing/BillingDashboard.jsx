import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import { api } from '../../lib/api';
import AlertBanner from './AlertBanner';
import KpiCards from './KpiCards';
import SpendChart from './SpendChart';
import ChannelBreakdown from './ChannelBreakdown';
import BudgetProgress from './BudgetProgress';

function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-lg p-4 animate-pulse ${className}`}>
      <div className="h-3 w-24 bg-border rounded mb-4" />
      <div className="h-8 w-32 bg-border rounded" />
    </div>
  );
}

export default function BillingDashboard() {
  const budget = useStore((s) => s.budget);
  const budgetPercent = useStore((s) => s.budgetPercent);
  const currentSpend = useStore((s) => s.currentSpend);
  const setBudgetModal = useStore((s) => s.setBudgetModal);
  const updateBilling = useStore((s) => s.updateBilling);
  const setBudget = useStore((s) => s.setBudget);

  const [usage, setUsage] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [usageData, historyData, budgetData] = await Promise.all([
          api.getUsage(),
          api.getUsageHistory(),
          api.getBudget(),
        ]);
        setUsage(usageData);
        setHistory(historyData.history || []);
        // Sync Zustand store with real data
        updateBilling({
          totalSpend: usageData.currentSpend,
          budgetPercent: budgetData.consumed?.percent || 0,
          alerts: [],
        });
        setBudget(budgetData.budget);
      } catch {
        // Backend not available — show placeholder state
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const budgetRemaining = (budget.limit_amount || 10) - (usage?.currentSpend || currentSpend);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-text-primary text-xl font-bold font-mono mb-1">Billing Dashboard</h1>
          <p className="text-text-muted text-sm font-mono">Real-time usage and spend tracking</p>
        </div>
        <button
          onClick={() => setBudgetModal(true)}
          className="border border-border bg-transparent text-text-muted hover:text-text-primary hover:bg-card-hover font-mono text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          Budget Settings
        </button>
      </div>

      {/* Alert banner */}
      <AlertBanner />

      {/* KPI cards */}
      {loading ? (
        <div className="grid grid-cols-4 gap-3 mb-6 max-[900px]:grid-cols-2">
          {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="mb-6">
          <KpiCards
            currentSpend={usage?.currentSpend ?? currentSpend}
            messagesSent={usage?.messagesSent ?? 0}
            inboxPulls={usage?.inboxPulls ?? 0}
            budgetRemaining={budgetRemaining}
          />
        </div>
      )}

      {/* Chart + Channel breakdown */}
      <div className="grid grid-cols-[1fr_300px] gap-4 mb-4 max-[900px]:grid-cols-1">
        {loading ? (
          <>
            <div className="bg-card border border-border rounded-lg p-4 animate-pulse h-[270px]" />
            <div className="bg-card border border-border rounded-lg p-4 animate-pulse h-[270px]" />
          </>
        ) : (
          <>
            <SpendChart history={history} />
            <ChannelBreakdown
              byChannel={usage?.byChannel || {}}
              currentSpend={usage?.currentSpend ?? currentSpend}
            />
          </>
        )}
      </div>

      {/* Budget progress */}
      {!loading && (
        <BudgetProgress
          percent={budgetPercent || (usage?.currentSpend / (budget.limit_amount || 10))}
          limitAmount={budget.limit_amount || 10}
          currentSpend={usage?.currentSpend ?? currentSpend}
        />
      )}
    </div>
  );
}
