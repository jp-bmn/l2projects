import useStore from '../../store/useStore';
import DevToolsPanel from '../shared/DevToolsPanel';

const NAV_ITEMS = [
  { screen: 'send', label: 'Send', icon: '↑' },
  { screen: 'inbox', label: 'Inbox', icon: '↓' },
  { screen: 'billing', label: 'Billing', icon: '◈' },
];

export default function Sidebar() {
  const activeScreen = useStore((s) => s.activeScreen);
  const setScreen = useStore((s) => s.setScreen);
  const showActivityPanel = useStore((s) => s.showActivityPanel);
  const toggleActivityPanel = useStore((s) => s.toggleActivityPanel);
  const setRateCardModal = useStore((s) => s.setRateCardModal);

  return (
    <aside className="w-[220px] h-screen flex flex-col shrink-0 bg-sidebar border-r border-border sticky top-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <span className="text-accent font-bold text-lg font-mono tracking-tight">OpenCourier</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        <p className="text-text-dim uppercase tracking-wider text-xs font-mono px-3 mb-2">Navigation</p>
        {NAV_ITEMS.map(({ screen, label, icon }) => (
          <button
            key={screen}
            onClick={() => setScreen(screen)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-mono transition-colors cursor-pointer w-full text-left border-0 ${
              activeScreen === screen
                ? 'bg-accent-dim text-accent'
                : 'text-text-muted hover:text-text-primary hover:bg-card-hover'
            }`}
          >
            <span className="text-base w-5 text-center">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 flex flex-col gap-1 border-t border-border pt-4">
        <button
          onClick={() => setRateCardModal(true)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-mono text-text-muted hover:text-text-primary hover:bg-card-hover transition-colors cursor-pointer w-full text-left border-0 bg-transparent"
        >
          <span className="text-base w-5 text-center">$</span>
          <span>Rate Card</span>
        </button>
        <button
          onClick={toggleActivityPanel}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-mono text-text-muted hover:text-text-primary hover:bg-card-hover transition-colors cursor-pointer w-full text-left border-0 bg-transparent"
        >
          <span className="relative w-5 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block"></span>
          </span>
          <span>{showActivityPanel ? 'Hide Feed' : 'Show Feed'}</span>
        </button>
        <DevToolsPanel />
      </div>
    </aside>
  );
}
