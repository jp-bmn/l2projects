import React from 'react'

export default function CountdownTimer({ days = 60, deadline = '2026-05-01' }) {
  const urgency = days <= 30 ? 'text-red-400 border-red-400/25' : days <= 60 ? 'text-amber-400 border-amber-400/25' : 'text-green-400 border-green-400/25'
  const ring = days <= 30 ? '#f87171' : days <= 60 ? '#fbbf24' : '#4ade80'

  return (
    <div className={`dashboard-panel rounded-xl p-4 border ${urgency.split(' ')[1]} flex flex-col items-center justify-center text-center`}>
      <p className="text-sm text-gray-400 font-medium tracking-wide uppercase mb-3">Compliance Deadline</p>

      {/* Ring countdown */}
      <div className="relative w-20 h-20 mb-3">
        <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#1e293b" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke={ring}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - Math.min(days / 365, 1))}`}
            style={{ filter: `drop-shadow(0 0 4px ${ring})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-black leading-none ${urgency.split(' ')[0]}`}>{days}</span>
          <span className="text-[9px] text-gray-500">days</span>
        </div>
      </div>

      <p className="text-xs text-gray-400">remaining until</p>
      <p className="text-sm font-bold text-white mt-0.5">{deadline}</p>
    </div>
  )
}
