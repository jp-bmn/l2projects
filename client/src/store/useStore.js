import { create } from 'zustand';

const useStore = create((set) => ({
  // Billing state
  currentSpend: 0,
  budgetPercent: 0,
  budget: { limit_amount: 10, period: 'monthly', alert_at_75: true, alert_at_90: true, hard_stop_at_100: false },
  alerts: [],

  // Activity feed
  activityEvents: [],
  sessionTotal: 0,

  // UI state
  activeScreen: 'send',       // 'send' | 'inbox' | 'billing'
  showActivityPanel: true,
  showRateCardModal: false,
  showBudgetModal: false,

  // Toast state
  toasts: [],

  // Actions
  updateBilling: (billing) => set({
    currentSpend: billing.totalSpend,
    budgetPercent: billing.budgetPercent,
    alerts: billing.alerts || [],
  }),
  // Bulk load from initial API fetch — array already sorted DESC by server
  setActivityEvents: (events) => set({
    activityEvents: events.slice(0, 100),
    sessionTotal: events.reduce((sum, e) => sum + (e.cost || 0), 0),
  }),
  // Single event from Realtime — prepend then re-sort to guarantee order
  addActivityEvent: (event) => set((state) => ({
    activityEvents: [event, ...state.activityEvents]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 100),
    sessionTotal: state.sessionTotal + (event.cost || 0),
  })),
  setScreen: (screen) => set({ activeScreen: screen }),
  toggleActivityPanel: () => set((s) => ({ showActivityPanel: !s.showActivityPanel })),
  setRateCardModal: (show) => set({ showRateCardModal: show }),
  setBudgetModal: (show) => set({ showBudgetModal: show }),
  setBudget: (budget) => set({ budget }),
  addToast: (toast) => set((state) => ({
    toasts: [...state.toasts, { id: Date.now(), ...toast }],
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),
}));

export default useStore;
