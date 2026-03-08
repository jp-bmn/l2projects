import React from 'react'

const STATUS_STYLE = {
  ONLINE: { dot: 'bg-green-400/90', badge: 'text-green-300 bg-green-400/10 border-green-400/25' },
  WARN: { dot: 'bg-amber-400 animate-pulse', badge: 'text-amber-200 bg-amber-400/10 border-amber-400/25' },
  ALERT: { dot: 'bg-red-400 animate-pulse', badge: 'text-red-300 bg-red-400/10 border-red-400/25' },
}

const SENSOR_ICON = {
  HVAC: '🌀',
  Lighting: '💡',
  Solar: '☀️',
  Water: '💧',
  'Backup Power': '🔋',
}

export default function SystemsStatus({ sensors = [] }) {
  const data = sensors

  return (
    <div className="dashboard-panel rounded-xl p-4 border border-gray-700/50 h-full">
      <p className="text-sm text-gray-400 font-medium tracking-wide uppercase mb-3">Systems Status</p>

      {data.length === 0 ? (
        <div className="h-[170px] flex items-center justify-center text-center border border-gray-800 rounded-lg bg-gray-950/30">
          <p className="text-xs text-gray-500">No sensor data for this building yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map(sensor => {
            const s = STATUS_STYLE[sensor.status] || STATUS_STYLE.ONLINE
            const icon = SENSOR_ICON[sensor.sensor_type] || '⚙️'
            return (
              <div key={sensor.id} className="flex items-center justify-between py-1.5 border-b border-gray-800/60 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm w-5 text-center">{icon}</span>
                  <div>
                    <p className="text-[11px] font-semibold text-white">{sensor.sensor_type}</p>
                    <p className="text-[9px] text-gray-600">{sensor.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${s.badge}`}>
                    {sensor.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
