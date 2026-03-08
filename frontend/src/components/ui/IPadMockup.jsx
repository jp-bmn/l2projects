import React from 'react'

export default function IPadMockup({ children, clipRight = false, scale = 1 }) {
  const w = 580 * scale
  const h = 420 * scale

  return (
    <div
      className="relative flex-shrink-0"
      style={{
        width: `${w}px`,
        height: `${h}px`,
        clipPath: clipRight ? `inset(0 -1px 0 0)` : undefined,
      }}
    >
      {/* iPad body */}
      <div
        className="absolute inset-0 rounded-[22px]"
        style={{
          background: 'linear-gradient(145deg, #2c2c2e 0%, #1c1c1e 100%)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 30px 80px rgba(0,0,0,0.55), 0 0 40px rgba(34,197,94,0.1)',
        }}
      />

      {/* Left-side camera (landscape orientation) */}
      <div
        className="absolute rounded-full bg-gray-700"
        style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', width: '8px', height: '8px' }}
      />

      {/* Screen */}
      <div
        className="absolute rounded-[16px] overflow-hidden"
        style={{
          inset: '12px 14px 12px 28px',
          background: '#0d1117',
        }}
      >
        {children || <DefaultIPadScreen />}
      </div>

      {/* Top bar camera dot */}
      <div
        className="absolute rounded-full bg-gray-700"
        style={{ top: '8px', left: '50%', transform: 'translateX(-50%)', width: '6px', height: '6px' }}
      />
    </div>
  )
}

function DefaultIPadScreen() {
  return (
    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-white text-lg font-bold">GreenEyes NYC</p>
        <p className="text-gray-400 text-sm">Reduction Monitor</p>
      </div>
    </div>
  )
}
