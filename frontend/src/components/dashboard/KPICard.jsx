import React from 'react'

export default function KPICard({ title, value, unit, change, direction, icon, glowColor = 'green', subtitle }) {
  const isUp = direction === 'up'
  const changeColor = glowColor === 'red' ? 'text-red-400' : isUp ? 'text-red-400' : 'text-green-400'
  const arrow = isUp ? '▲' : '▼'

  const borderColor = {
    green: 'border-green-400/20',
    red: 'border-red-400/25',
    blue: 'border-blue-400/20',
    yellow: 'border-amber-400/20',
  }[glowColor] || 'border-green-400/20'

  const glowClass = {
    green: 'kpi-glow-green',
    red: 'kpi-glow-red',
    blue: '',
    yellow: '',
  }[glowColor] || ''

  return (
    <div className={`dashboard-panel rounded-xl p-4 border ${borderColor} ${glowClass}`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">{title}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-black text-white leading-none">{value}</span>
        {unit && <span className="text-sm text-gray-400 pb-0.5">{unit}</span>}
      </div>
      {change !== undefined && (
        <p className={`text-xs mt-1.5 ${changeColor} font-medium`}>
          {arrow} {Math.abs(change)}% vs last week
        </p>
      )}
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}
