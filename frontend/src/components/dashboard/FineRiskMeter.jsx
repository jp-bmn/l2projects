import React, { useEffect, useState } from 'react'

function polarToXY(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  const s = polarToXY(cx, cy, r, startDeg)
  const e = polarToXY(cx, cy, r, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
}

export default function FineRiskMeter({ riskAmount = 0, riskPct = 0 }) {
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(riskPct), 400)
    return () => clearTimeout(timeout)
  }, [riskPct])

  const cx = 100, cy = 100, r = 72
  const startDeg = -130
  const endDeg = 130
  const safePct = Math.max(0, Math.min(100, riskPct || 0))
  const safeAmount = typeof riskAmount === 'number' ? riskAmount : 0

  const totalArc = endDeg - startDeg
  const needleDeg = startDeg + (Math.max(0, Math.min(100, animated || 0)) / 100) * totalArc

  const zones = [
    { from: startDeg, to: startDeg + totalArc * 0.33, color: '#4ade80' },
    { from: startDeg + totalArc * 0.33, to: startDeg + totalArc * 0.66, color: '#fbbf24' },
    { from: startDeg + totalArc * 0.66, to: endDeg, color: '#f87171' },
  ]

  const needleEnd = polarToXY(cx, cy, r - 10, needleDeg)

  const riskColor = safePct < 33 ? '#4ade80' : safePct < 66 ? '#fbbf24' : '#f87171'

  return (
    <div className="dashboard-panel rounded-xl p-4 border border-gray-700/50 flex flex-col items-center min-w-[180px]">
      <p className="text-sm text-gray-400 font-medium tracking-wide uppercase mb-2">Fine Risk Meter</p>

      <svg viewBox="0 0 200 140" className="w-full min-w-[160px] max-w-[180px] lg:min-w-[200px] lg:max-w-[240px] flex-shrink-0">
        {/* Background arc */}
        <path d={arcPath(cx, cy, r, startDeg, endDeg)} fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />

        {/* Color zones */}
        {zones.map((z, i) => (
          <path
            key={i}
            d={arcPath(cx, cy, r, z.from, z.to)}
            fill="none"
            stroke={z.color}
            strokeWidth="14"
            strokeLinecap="butt"
            opacity="0.7"
          />
        ))}

        {/* Animated fill overlay */}
        <path
          d={arcPath(cx, cy, r, startDeg, needleDeg)}
          fill="none"
          stroke={riskColor}
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.9"
          style={{ transition: 'all 1s ease-out', filter: `drop-shadow(0 0 4px ${riskColor})` }}
        />

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ transition: 'all 1s ease-out', filter: 'drop-shadow(0 0 3px white)' }}
        />
        <circle cx={cx} cy={cy} r="5" fill="white" />

        {/* Labels */}
        <text x={cx - r - 4} y={cy + 24} fill="#4ade80" fontSize="7" fontFamily="sans-serif" textAnchor="middle">LOW</text>
        <text x={cx} y={cy - r - 10} fill="#fbbf24" fontSize="7" fontFamily="sans-serif" textAnchor="middle">MOD</text>
        <text x={cx + r + 4} y={cy + 24} fill="#f87171" fontSize="7" fontFamily="sans-serif" textAnchor="middle">HIGH</text>

        {/* Dollar amount */}
        <text x={cx} y={cy + 32} fill="white" fontSize="17" fontFamily="sans-serif" fontWeight="700" textAnchor="middle">
          ${safeAmount.toLocaleString()}
        </text>
        <text x={cx} y={cy + 44} fill="#6b7280" fontSize="7" fontFamily="sans-serif" textAnchor="middle">projected fine</text>
      </svg>
    </div>
  )
}
