import React from 'react'

const SEVERITY_STYLE = {
  critical: { dot: 'bg-red-400', badge: 'bg-red-400/15 text-red-300 border-red-400/25', label: 'CRITICAL' },
  warning: { dot: 'bg-amber-400', badge: 'bg-amber-400/15 text-amber-200 border-amber-400/25', label: 'WARNING' },
  info: { dot: 'bg-blue-400', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30', label: 'INFO' },
}

const TYPE_ICON = {
  HVAC: '🌀',
  WATER: '💧',
  LIGHTING: '💡',
  DEFAULT: '⚠️',
}

export default function AlertsPanel({ alerts = [] }) {
  const data = alerts

  return (
    <div className="dashboard-panel rounded-xl p-4 border border-red-400/20 kpi-glow-red h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">Active Alerts</p>
        <span className="bg-red-400 text-white text-xs font-black px-2 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
          {data.length}
        </span>
      </div>

      {data.length === 0 ? (
        <div className="h-[170px] flex items-center justify-center text-center border border-gray-800 rounded-lg bg-gray-950/30">
          <p className="text-xs text-gray-500">No active alerts for this building.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map(alert => {
            const s = SEVERITY_STYLE[alert.severity] || SEVERITY_STYLE.info
            const icon = TYPE_ICON[alert.alert_type] || TYPE_ICON.DEFAULT
            return (
              <div key={alert.id} className="bg-gray-800/40 rounded-lg p-2.5 border border-gray-700/40">
                <div className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${s.dot} animate-pulse`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm">{icon}</span>
                      <span className="text-[11px] font-bold text-white truncate">{alert.title}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${s.badge} flex-shrink-0`}>
                        {s.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{alert.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
