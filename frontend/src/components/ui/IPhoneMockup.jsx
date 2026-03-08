import React from 'react'

export default function IPhoneMockup({ children, label, accentColor = '#22c55e', labelColor, scale = 1 }) {
  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: `${175 * scale}px`, height: `${356 * scale}px` }}
    >
      {/* Outer body — titanium frame */}
      <div
        className="absolute inset-0 rounded-[40px] phone-glow"
        style={{
          background: 'linear-gradient(145deg, #2a2a2c 0%, #1a1a1c 60%, #111113 100%)',
          boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 30px 60px rgba(0,0,0,0.6), 0 0 30px ${accentColor}22`,
        }}
      />

      {/* Side buttons — left (volume + mute) */}
      <div className="absolute left-0 top-[88px] w-[3px] h-[28px] rounded-l-full bg-gray-600" style={{ left: '-2px' }} />
      <div className="absolute left-0 top-[128px] w-[3px] h-[44px] rounded-l-full bg-gray-600" style={{ left: '-2px' }} />
      <div className="absolute left-0 top-[184px] w-[3px] h-[44px] rounded-l-full bg-gray-600" style={{ left: '-2px' }} />

      {/* Side buttons — right (power + camera control) */}
      <div className="absolute right-0 top-[110px] w-[3px] h-[60px] rounded-r-full bg-gray-600" style={{ right: '-2px' }} />
      <div className="absolute right-0 top-[196px] w-[3px] h-[38px] rounded-r-full bg-gray-500" style={{ right: '-2px' }} />

      {/* Screen bezel */}
      <div
        className="absolute rounded-[36px] overflow-hidden"
        style={{
          inset: '7px',
          background: '#0a0a0a',
        }}
      >
        {/* Dynamic Island */}
        <div
          className="absolute z-10 rounded-full bg-black"
          style={{
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80px',
            height: '22px',
          }}
        />

        {/* Screen content */}
        <div className="absolute inset-0 overflow-hidden rounded-[36px]">
          {children || <DefaultPhoneScreen accentColor={accentColor} label={label} />}
        </div>
      </div>

      {/* Label below phone */}
      {label && (
        <div
          className="absolute -bottom-8 left-0 right-0 text-center text-xs font-semibold tracking-wider uppercase"
          style={{ color: labelColor ?? '#9ca3af' }}
        >
          {label}
        </div>
      )}
    </div>
  )
}

function DefaultPhoneScreen({ accentColor, label }) {
  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#0d1117', paddingTop: '44px' }}>
      <div className="px-3 pb-2 border-b border-gray-800">
        <p className="text-[10px] text-gray-400 mb-0.5">GreenEyes NYC</p>
        <p className="text-xs font-bold text-white">{label || 'Monitor'}</p>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: `${accentColor}22`, border: `1.5px solid ${accentColor}` }}>
            <div className="w-3 h-3 rounded-full" style={{ background: accentColor }} />
          </div>
          <p className="text-[9px] text-gray-500">Live Data</p>
        </div>
      </div>
    </div>
  )
}
