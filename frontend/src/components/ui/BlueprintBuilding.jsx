import React from 'react'

export default function BlueprintBuilding({ activeFeatureId = null }) {
  const floorCount = 16
  const bldW = 160
  const floorH = 28
  const bldX = 58
  const basementH = 56
  const vbW = 276
  const vbH = 700
  const towerH = floorH * floorCount
  const roofH = 12
  const contentHeight = roofH + 4 + towerH + basementH
  const topGap = (vbH - contentHeight) / 2
  const bldY = topGap + roofH + 4
  const floorsWithRed = [2, 5, 9, 12]
  const highlightSolar = activeFeatureId === 3
  const highlightEnergy = activeFeatureId === 2
  const highlightEV = activeFeatureId === 4
  const highlightAlerts = activeFeatureId === 5

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      className="w-full h-full"
      style={{ fontFamily: 'Courier New, monospace' }}
    >
      <defs>
        <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(74,159,212,0.14)" strokeWidth="0.5" />
        </pattern>
        <pattern id="gridBig" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(74,159,212,0.2)" strokeWidth="0.8" />
        </pattern>
      </defs>

      {/* Dark blue box background */}
      <rect width={vbW} height={vbH} fill="#0f2942" />
      <rect width={vbW} height={vbH} fill="url(#grid)" />
      <rect width={vbW} height={vbH} fill="url(#gridBig)" />

      {/* Title block */}
      <text x="14" y="18" fill="#4a9fd4" fontSize="8" fontFamily="Courier New">GREENEYES NYC — SMART BUILDING</text>
      <text x="14" y="26" fill="rgba(74,159,212,0.55)" fontSize="6" fontFamily="Courier New">ENERGY REDUCTION MONITOR · REV 2026-A</text>
      <line x1="10" y1="30" x2={vbW - 10} y2="30" stroke="rgba(74,159,212,0.35)" strokeWidth="0.5" />

      {/* Roof strip — green highlight when Solar Output selected */}
      <rect
        x={bldX - 4}
        y={bldY - roofH - 2}
        width={bldW + 8}
        height={roofH}
        fill={highlightSolar ? 'rgba(34,197,94,0.35)' : 'none'}
        stroke={highlightSolar ? '#22c55e' : '#4a9fd4'}
        strokeWidth={highlightSolar ? 2 : 1.2}
        style={highlightSolar ? { filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.6))' } : undefined}
      />

      {/* Tall building tower — blue highlight behind floors when Energy Monitor selected */}
      {highlightEnergy && (
        <rect
          x={bldX}
          y={bldY}
          width={bldW}
          height={towerH}
          fill="rgba(96,165,250,0.18)"
          stroke="none"
        />
      )}

      {/* Building floors — horizontal blue rectangles, some with red indicators */}
      {Array.from({ length: floorCount }).map((_, i) => {
        const fy = bldY + i * floorH
        const floorNum = floorCount - i
        const hasRed = floorsWithRed.includes(i)
        return (
          <g key={i}>
            <rect
              x={bldX}
              y={fy}
              width={bldW}
              height={floorH - 1}
              fill={hasRed ? 'rgba(239,68,68,0.08)' : 'rgba(74,159,212,0.06)'}
              stroke="#4a9fd4"
              strokeWidth="1"
            />
            {hasRed && (
              <rect
                x={bldX + bldW - 28}
                y={fy + 4}
                width={22}
                height={floorH - 10}
                fill={highlightAlerts ? 'rgba(239,68,68,0.5)' : 'rgba(239,68,68,0.25)'}
                stroke="#ef4444"
                strokeWidth={highlightAlerts ? 1.8 : 0.8}
                style={highlightAlerts ? { filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.8))' } : undefined}
              />
            )}
            <text x={bldX - 8} y={fy + floorH / 2 + 2} fill="rgba(74,159,212,0.6)" fontSize="6" fontFamily="Courier New" textAnchor="end">{floorNum}</text>
          </g>
        )
      })}

      {/* Building tower outline — blue stroke when Energy Monitor selected */}
      <rect
        x={bldX}
        y={bldY}
        width={bldW}
        height={towerH}
        fill="none"
        stroke={highlightEnergy ? '#60a5fa' : '#4a9fd4'}
        strokeWidth={highlightEnergy ? 2.2 : 1.8}
        style={highlightEnergy ? { filter: 'drop-shadow(0 0 8px rgba(96,165,250,0.6))' } : undefined}
      />

      {/* Basement — dashed outline (no green); yellow squares highlight when EV Charging selected */}
      <rect
        x={bldX - 10}
        y={bldY + towerH}
        width={bldW + 20}
        height={basementH}
        fill="rgba(74,159,212,0.04)"
        stroke="#4a9fd4"
        strokeWidth="1.2"
        strokeDasharray="6 4"
      />
      {[0, 1, 2].map(s => (
        <g key={s}>
          <rect
            x={bldX + 18 + s * 54}
            y={bldY + towerH + 10}
            width={36}
            height={36}
            fill={highlightEV ? 'rgba(234,179,8,0.45)' : 'rgba(234,179,8,0.2)'}
            stroke="rgba(234,179,8,0.9)"
            strokeWidth={highlightEV ? 2 : 1}
            style={highlightEV ? { filter: 'drop-shadow(0 0 6px rgba(234,179,8,0.6))' } : undefined}
          />
          <text x={bldX + 18 + s * 54 + 18} y={bldY + towerH + 28} fill="#eab308" fontSize="16" fontFamily="sans-serif" textAnchor="middle">⚡</text>
        </g>
      ))}

      {/* Right-side scale labels */}
      {[0, 4, 8, 12, 16].map(n => (
        <text key={n} x={bldX + bldW + 10} y={bldY + (n * towerH) / 16 + 3} fill="rgba(74,159,212,0.5)" fontSize="5.5" fontFamily="Courier New">{n}</text>
      ))}
    </svg>
  )
}
