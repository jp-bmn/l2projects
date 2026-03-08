import React, { useEffect, useState } from 'react'

function Bar({ label, pct, color }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 300)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-300 font-medium">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2.5 min-h-[10px] lg:h-3 rounded-full bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, background: color, boxShadow: `0 0 6px ${color}55` }}
        />
      </div>
    </div>
  )
}

export default function ComplianceProgress({ data }) {
  const bars = [
    { label: 'LL97 Emissions', pct: Math.round(data?.ll97_emissions_pct ?? 0), color: '#f87171' },
    { label: 'Energy Intensity', pct: Math.round(data?.energy_intensity_pct ?? 0), color: '#fbbf24' },
    { label: 'Carbon Offset', pct: Math.round(data?.carbon_offset_pct ?? 0), color: '#4ade80' },
  ]

  return (
    <div className="dashboard-panel rounded-xl p-4 border border-gray-700/50">
      <p className="text-sm text-gray-400 font-medium tracking-wide uppercase mb-3">Monthly Compliance</p>
      {bars.map(b => <Bar key={b.label} {...b} />)}
    </div>
  )
}
