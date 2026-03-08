import useStore from '../../store/useStore';
import Sidebar from './Sidebar';
import ActivityPanel from './ActivityPanel';

// Screen components — imported lazily to avoid circular deps at startup
import SendConsole from '../send/SendConsole';
import InboxView from '../inbox/InboxView';
import BillingDashboard from '../billing/BillingDashboard';

// Modals
import RateCardModal from '../modals/RateCardModal';
import BudgetSettingsModal from '../modals/BudgetSettingsModal';

// Shared
import Toast from '../shared/Toast';

function ActiveScreen({ screen }) {
  switch (screen) {
    case 'send': return <SendConsole />;
    case 'inbox': return <InboxView />;
    case 'billing': return <BillingDashboard />;
    default: return <SendConsole />;
  }
}

export default function AppShell() {
  const activeScreen = useStore((s) => s.activeScreen);
  const showRateCardModal = useStore((s) => s.showRateCardModal);
  const showBudgetModal = useStore((s) => s.showBudgetModal);

  return (
    <div className="flex h-screen overflow-hidden bg-bg font-mono">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <ActiveScreen screen={activeScreen} />
      </main>
      <ActivityPanel />

      {/* Modals */}
      {showRateCardModal && <RateCardModal />}
      {showBudgetModal && <BudgetSettingsModal />}

      {/* Toast notifications */}
      <Toast />
    </div>
  );
}
