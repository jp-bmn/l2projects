const TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
  { key: 'archived', label: 'Archived' },
];

export default function FilterTabs({ activeFilter, onFilterChange, counts = {} }) {
  function getCount(key) {
    if (key === 'all') return (counts.unread || 0) + (counts.read || 0) + (counts.archived || 0);
    return counts[key] || 0;
  }

  return (
    <div className="flex items-center gap-2">
      {TABS.map((tab) => {
        const isActive = activeFilter === tab.key;
        const count = getCount(tab.key);
        return (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-mono cursor-pointer transition-all border flex items-center gap-1.5 ${
              isActive
                ? 'bg-accent-dim text-accent border-accent'
                : 'bg-card text-text-muted border-border hover:bg-card-hover'
            }`}
          >
            {tab.label}
            <span className={`text-xs ${isActive ? 'text-accent' : 'text-text-dim'}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
