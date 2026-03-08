import React, { useState } from 'react'
import BlueprintBuilding from '../ui/BlueprintBuilding'
import IPadMockup from '../ui/IPadMockup'

const FEATURES = [
  { id: 1, label: 'LL97 Compliance', icon: '📋', color: '#64b5f6', desc: 'Live compliance monitoring against NYC Local Law 97 limits with fine-risk projection.' },
  { id: 2, label: 'Energy Monitor', icon: '⚡', color: '#22c55e', desc: 'Real-time kWh readings per floor, 7-day trends, and automated anomaly detection.' },
  { id: 3, label: 'Solar Output', icon: '☀️', color: '#f59e0b', desc: 'Track solar panel performance, CO₂ offset, and AC/E/H efficiency scores.' },
  { id: 4, label: 'EV Charging', icon: '🔋', color: '#34d399', desc: 'Monitor EV station occupancy, energy draw, and schedule smart charging windows.' },
  { id: 5, label: 'Smart Alerts', icon: '🚨', color: '#f87171', desc: 'Instant push/SMS alerts for HVAC anomalies, pressure drops, and after-hours usage.' },
]

/* iPad screens per feature */
function FeatureIPadScreen({ feature }) {
  if (!feature) return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: '#0a0f1e' }}>
      <p className="text-gray-400 text-sm">Select a feature</p>
    </div>
  )

  const screenMap = {
    1: <ComplianceIPadScreen />,
    2: <EnergyIPadScreen />,
    3: <SolarIPadScreen />,
    4: <EVIPadScreen />,
    5: <AlertsIPadScreen />,
  }

  return screenMap[feature.id] || <div className="w-full h-full bg-gray-900" />
}

function ComplianceIPadScreen() {
  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#0a0f1e' }}>
      <div className="px-4 py-3 border-b border-gray-800">
        <p className="text-[8px] text-blue-400 font-bold tracking-wider">LL97 COMPLIANCE MONITOR</p>
      </div>
      <div className="flex-1 p-3 grid grid-cols-2 gap-2">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-[7px] text-gray-400 mb-1">FINE RISK</p>
          <p className="text-xl font-black text-yellow-300">$42K</p>
          <p className="text-[7px] text-gray-500">projected 2026</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-[7px] text-gray-400 mb-1">DEADLINE</p>
          <p className="text-xl font-black text-red-400">60d</p>
          <p className="text-[7px] text-gray-500">remaining</p>
        </div>
        {[
          { label: 'LL97 Emissions', val: 73, color: '#ef4444' },
          { label: 'Energy Intensity', val: 58, color: '#f59e0b' },
          { label: 'Carbon Offset', val: 41, color: '#22c55e' },
        ].map(b => (
          <div key={b.label} className="col-span-2 bg-gray-800/30 rounded-lg p-2">
            <div className="flex justify-between mb-1">
              <span className="text-[7px] text-gray-400">{b.label}</span>
              <span className="text-[7px] font-bold" style={{ color: b.color }}>{b.val}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-700">
              <div className="h-full rounded-full" style={{ width: `${b.val}%`, background: b.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EnergyIPadScreen() {
  const bars = [820, 910, 875, 760, 930, 680, 847]
  const max = Math.max(...bars)
  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#0a0f1e' }}>
      <div className="px-4 py-3 border-b border-gray-800">
        <p className="text-[8px] text-green-400 font-bold tracking-wider">⚡ ENERGY USAGE — 7 DAY</p>
      </div>
      <div className="flex-1 p-4 flex flex-col justify-end">
        <div className="flex items-end gap-1.5 h-28 mb-2">
          {bars.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full rounded-t-sm"
                style={{ height: `${(v / max) * 100}px`, background: v > 900 ? '#ef4444' : '#22c55e', opacity: 0.85 }}
              />
            </div>
          ))}
        </div>
        <div className="h-px bg-red-500/40 -mt-2 mb-3 relative">
          <span className="absolute right-0 -top-3 text-[7px] text-red-400">LL97 limit</span>
        </div>
        <div className="flex gap-3">
          <div>
            <p className="text-[8px] text-gray-400">Current</p>
            <p className="text-lg font-black text-white">847 <span className="text-[8px] text-gray-400">kW</span></p>
          </div>
          <div>
            <p className="text-[8px] text-gray-400">vs Last Week</p>
            <p className="text-lg font-black text-red-400">▲12%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SolarIPadScreen() {
  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#0a0f1e' }}>
      <div className="px-4 py-3 border-b border-gray-800">
        <p className="text-[8px] text-yellow-400 font-bold tracking-wider">☀️ SOLAR PERFORMANCE</p>
      </div>
      <div className="flex-1 p-3 grid grid-cols-3 gap-2">
        <div className="col-span-3 bg-gray-800/50 rounded-lg p-3 flex justify-around">
          <div className="text-center">
            <p className="text-[7px] text-gray-400 mb-0.5">Output</p>
            <p className="text-lg font-black text-yellow-300">1.2<span className="text-[9px]">MWh</span></p>
          </div>
          <div className="text-center">
            <p className="text-[7px] text-gray-400 mb-0.5">CO₂</p>
            <p className="text-lg font-black text-green-400">0.82<span className="text-[9px]">t</span></p>
          </div>
          <div className="text-center">
            <p className="text-[7px] text-gray-400 mb-0.5">Saved</p>
            <p className="text-lg font-black text-blue-300">$186</p>
          </div>
        </div>
        {[
          { l: 'AC', v: 82, c: '#60a5fa' },
          { l: 'E', v: 74, c: '#22c55e' },
          { l: 'H', v: 61, c: '#f59e0b' },
        ].map(s => (
          <div key={s.l} className="col-span-1 bg-gray-800/30 rounded-lg p-2 text-center">
            <p className="text-[7px] font-bold text-gray-400 mb-0.5">{s.l} Score</p>
            <p className="text-lg font-black" style={{ color: s.c }}>{s.v}</p>
            <div className="h-1 rounded-full bg-gray-700 mt-1">
              <div className="h-full rounded-full" style={{ width: `${s.v}%`, background: s.c }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EVIPadScreen() {
  const spots = [
    { id: 1, status: 'charging', pct: 78 },
    { id: 2, status: 'available', pct: 0 },
    { id: 3, status: 'charging', pct: 42 },
    { id: 4, status: 'reserved', pct: 0 },
  ]
  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#0a0f1e' }}>
      <div className="px-4 py-3 border-b border-gray-800">
        <p className="text-[8px] text-teal-400 font-bold tracking-wider">🔋 EV CHARGING — BASEMENT</p>
      </div>
      <div className="flex-1 p-3 grid grid-cols-2 gap-2">
        {spots.map(s => (
          <div key={s.id} className="bg-gray-800/50 rounded-lg p-3 border" style={{ borderColor: s.status === 'charging' ? '#34d399' : s.status === 'reserved' ? '#f59e0b' : '#374151' }}>
            <div className="flex justify-between mb-1">
              <span className="text-[8px] font-bold text-white">EV-{s.id}</span>
              <span className="text-[7px] px-1.5 py-0.5 rounded font-bold" style={{
                background: s.status === 'charging' ? '#34d39922' : s.status === 'reserved' ? '#f59e0b22' : '#374151',
                color: s.status === 'charging' ? '#34d399' : s.status === 'reserved' ? '#f59e0b' : '#6b7280',
              }}>{s.status.toUpperCase()}</span>
            </div>
            {s.status === 'charging' && (
              <>
                <p className="text-lg font-black text-teal-300">{s.pct}%</p>
                <div className="h-1.5 rounded-full bg-gray-700 mt-1">
                  <div className="h-full rounded-full bg-teal-400" style={{ width: `${s.pct}%` }} />
                </div>
              </>
            )}
            {s.status === 'available' && <p className="text-xs text-gray-500 mt-1">Ready to charge</p>}
            {s.status === 'reserved' && <p className="text-xs text-yellow-400 mt-1">Reserved 2PM</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

function AlertsIPadScreen() {
  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#0a0f1e' }}>
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <p className="text-[8px] text-red-400 font-bold tracking-wider">🚨 ACTIVE ALERTS</p>
        <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">3</span>
      </div>
      <div className="flex-1 p-3 space-y-2">
        {[
          { icon: '🌀', title: 'HVAC Overload', sub: 'Floor 42 · 340% above baseline', color: '#ef4444', badge: 'CRITICAL' },
          { icon: '💧', title: 'Water Pressure Drop', sub: 'Floor 18 · 18% below normal', color: '#f59e0b', badge: 'WARNING' },
          { icon: '💡', title: 'Lights After Hours', sub: 'Floor 7 · Since 11 PM', color: '#60a5fa', badge: 'INFO' },
        ].map((a, i) => (
          <div key={i} className="bg-gray-800/50 rounded-lg p-2.5 border-l-2" style={{ borderColor: a.color }}>
            <div className="flex items-start gap-2">
              <span className="text-base">{a.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold text-white">{a.title}</p>
                  <span className="text-[7px] font-bold px-1 py-0.5 rounded" style={{ background: `${a.color}22`, color: a.color }}>{a.badge}</span>
                </div>
                <p className="text-[7px] text-gray-500 mt-0.5">{a.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Page 5 ─── */
export default function Page5Features() {
  const [active, setActive] = useState(FEATURES[0])

  return (
    <section
      id="page5"
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center py-8 pb-24"
      style={{ background: 'linear-gradient(135deg, #e8edf2 0%, #d4e8e0 50%, #cde0e8 100%)' }}
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(34,197,94,0.1) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Main row: building | buttons | iPad — all within page */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex items-center justify-center gap-8 lg:gap-12">
        {/* ── LEFT: Black box + building only (no outer container) ── */}
        <div className="relative flex-shrink-0 hidden sm:flex flex-col items-center mt-12">
          <div
            className="overflow-hidden"
            style={{
              width: '165px',
              height: '420px',
              background: '#0f2942',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4), 0 12px 24px -8px rgba(0,0,0,0.3)',
            }}
          >
            <BlueprintBuilding activeFeatureId={active.id} />
          </div>
          <p className="text-center text-[11px] text-gray-500 font-mono tracking-wider mt-3">SMART BUILDING · BLUEPRINT VIEW</p>
        </div>

        {/* ── CENTER: Feature buttons ── */}
        <div className="relative flex flex-col items-center justify-center gap-2.5 flex-shrink-0">
          <p className="text-xs text-gray-500 font-bold tracking-[0.3em] uppercase mb-2">Platform Features</p>
          {FEATURES.map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActive(f)}
              aria-pressed={active.id === f.id}
              aria-label={`${f.label}. ${active.id === f.id ? 'Selected' : 'Select to view'}`}
              className="w-full max-w-[200px] flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 border shadow-sm hover:border-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
              style={{
                background: active.id === f.id ? `${f.color}18` : 'rgba(248,250,252,0.95)',
                borderColor: active.id === f.id ? f.color : '#e2e8f0',
                color: active.id === f.id ? f.color : '#374151',
                boxShadow: active.id === f.id ? `0 0 0 2px ${f.color}44, 0 4px 16px ${f.color}22` : undefined,
                transform: active.id === f.id ? 'scale(1.04)' : undefined,
              }}
            >
              <span className="text-lg flex-shrink-0" aria-hidden>{f.icon}</span>
              <span>{f.label}</span>
              {active.id === f.id && <span className="ml-auto text-xs" aria-hidden>→</span>}
            </button>
          ))}
          <div className="mt-3 max-w-[200px] text-center">
            <p className="text-xs text-gray-500 leading-relaxed">{active.desc}</p>
          </div>
        </div>

        {/* ── RIGHT: iPad fully on page ── */}
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <div className="animate-float" style={{ animationDelay: '0.3s' }}>
            <IPadMockup scale={0.62}>
              <FeatureIPadScreen feature={active} />
            </IPadMockup>
          </div>
        </div>
      </div>

    </section>
  )
}
