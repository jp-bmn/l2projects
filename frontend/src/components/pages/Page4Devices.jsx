import React from 'react'
import IPhoneMockup from '../ui/IPhoneMockup'
import IPadMockup from '../ui/IPadMockup'

/* ─── Phone Screen Content Components ─── */

function EnergyScreen() {
  const bars = [820, 910, 875, 760, 930, 680, 847]
  const max = Math.max(...bars)
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <div className="w-full h-full flex flex-col pt-10 px-3 pb-3" style={{ background: '#0d1117' }}>
      <p className="text-[9px] font-bold tracking-wider mb-0.5 text-green-500">ENERGY USAGE</p>
      <div className="flex items-end gap-0.5 justify-between mb-1" style={{ height: '80px' }}>
        {bars.map((v, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div
              className="w-full rounded-sm"
              style={{
                height: `${(v / max) * 74}px`,
                background: v > 900 ? '#ef4444' : '#22c55e',
                opacity: 0.85,
              }}
            />
            <span className="text-[7px] text-gray-600 mt-0.5">{days[i]}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-800 pt-2">
        <p className="text-[10px] text-gray-400">Current</p>
        <p className="text-lg font-black text-white">847 <span className="text-[10px] font-normal text-gray-400">kW</span></p>
        <p className="text-[9px] text-red-400">▲ 12% vs last week</p>
      </div>
    </div>
  )
}

function SolarScreen() {
  return (
    <div className="w-full h-full flex flex-col pt-10 px-3 pb-3" style={{ background: '#0d1117' }}>
      <p className="text-[9px] text-yellow-400 font-bold tracking-wider mb-1">☀️ SOLAR MONITOR</p>
      <div className="text-center py-2">
        <p className="text-2xl font-black text-yellow-300">214<span className="text-sm font-normal text-gray-400"> kW</span></p>
        <p className="text-[9px] text-green-400">▼ 3% change</p>
      </div>
      {[
        { label: 'AC', val: 82, color: '#60a5fa' },
        { label: 'E', val: 74, color: '#22c55e' },
        { label: 'H', val: 61, color: '#f59e0b' },
      ].map(s => (
        <div key={s.label} className="mb-1.5">
          <div className="flex justify-between mb-0.5">
            <span className="text-[8px] font-bold text-gray-400">{s.label}</span>
            <span className="text-[8px] font-black" style={{ color: s.color }}>{s.val}</span>
          </div>
          <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${s.val}%`, background: s.color }} />
          </div>
        </div>
      ))}
      <div className="mt-2 border-t border-gray-800 pt-2 grid grid-cols-2 gap-1">
        <div className="text-center">
          <p className="text-[8px] text-gray-500">CO₂ Saved</p>
          <p className="text-xs font-black text-green-400">0.82t</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] text-gray-500">$ Saved</p>
          <p className="text-xs font-black text-blue-300">$186</p>
        </div>
      </div>
    </div>
  )
}

function AlertsScreen() {
  const alerts = [
    { icon: '🌀', text: 'HVAC Overload', floor: 'FL 42', color: '#ef4444' },
    { icon: '💧', text: 'Water Pressure', floor: 'FL 18', color: '#f59e0b' },
    { icon: '💡', text: 'Lights After Hrs', floor: 'FL 7', color: '#60a5fa' },
  ]
  return (
    <div className="w-full h-full flex flex-col pt-10 px-3 pb-3" style={{ background: '#0d1117' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] font-bold tracking-wider text-red-500">🚨 ALERTS</p>
        <span className="bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse">3</span>
      </div>
      <div className="space-y-2">
        {alerts.map((a, i) => (
          <div key={i} className="bg-gray-800/60 rounded-lg p-2 border-l-2" style={{ borderColor: a.color }}>
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{a.icon}</span>
              <div>
                <p className="text-[9px] font-bold text-white">{a.text}</p>
                <p className="text-[8px] text-gray-500">{a.floor}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto border-t border-gray-800 pt-2">
        <p className="text-[8px] text-gray-500">Last updated: just now</p>
      </div>
    </div>
  )
}

function ComplianceScreen() {
  return (
    <div className="w-full h-full flex flex-col pt-10 px-3 pb-3" style={{ background: '#0d1117' }}>
      <p className="text-[9px] font-bold tracking-wider mb-2 text-blue-400">LL97 COMPLIANCE</p>
      <div className="text-center mb-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-4 border-blue-400 mb-1">
          <span className="text-lg font-black text-blue-300">58</span>
        </div>
        <p className="text-[8px] text-gray-400">Risk Score</p>
      </div>
      {[
        { label: 'Emissions', val: 73, color: '#ef4444' },
        { label: 'Energy', val: 58, color: '#f59e0b' },
        { label: 'Offset', val: 41, color: '#22c55e' },
      ].map(b => (
        <div key={b.label} className="mb-1.5">
          <div className="flex justify-between mb-0.5">
            <span className="text-[8px] text-gray-400">{b.label}</span>
            <span className="text-[8px] font-bold" style={{ color: b.color }}>{b.val}%</span>
          </div>
          <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${b.val}%`, background: b.color }} />
          </div>
        </div>
      ))}
      <div className="mt-auto text-center border-t border-gray-800 pt-2">
        <p className="text-blue-300 text-xs font-black">60 days</p>
        <p className="text-[8px] text-gray-500">until deadline</p>
      </div>
    </div>
  )
}

/* ─── iPad Screen ─── */
function IPadDashboardScreen() {
  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#0a0f1e' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800/60">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-green-500 flex items-center justify-center">
            <span className="text-white text-[9px] font-black">G</span>
          </div>
          <span className="text-white text-xs font-black">GreenEyes <span className="text-green-400">NYC</span></span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[8px] text-green-400 font-medium">LIVE</span>
          </div>
          <span className="text-sm">🔔</span>
          <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
            <span className="text-white text-[8px] font-black">MF</span>
          </div>
        </div>
      </div>
      {/* Mini dashboard grid */}
      <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-2 p-3">
        <div className="bg-gray-800/60 rounded-lg p-2 border border-green-500/20">
          <p className="text-[7px] text-gray-400 mb-0.5">CURRENT USAGE</p>
          <p className="text-base font-black text-white">847<span className="text-[8px] text-gray-400"> kW</span></p>
          <p className="text-[7px] text-red-400">▲ 12%</p>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-2 border border-yellow-500/20">
          <p className="text-[7px] text-gray-400 mb-0.5">SOLAR OUTPUT</p>
          <p className="text-base font-black text-yellow-300">214<span className="text-[8px] text-gray-400"> kW</span></p>
          <p className="text-[7px] text-green-400">↓ 3%</p>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-2 border border-red-500/20">
          <p className="text-[7px] text-gray-400 mb-0.5">ALERTS</p>
          <p className="text-base font-black text-red-400">3</p>
          <p className="text-[7px] text-gray-500">active</p>
        </div>
        <div className="col-span-2 bg-gray-800/60 rounded-lg p-2 border border-gray-700/40">
          <p className="text-[7px] text-gray-400 mb-1">FLOOR GRID</p>
          <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                className="rounded-sm"
                style={{
                  height: '10px',
                  background: i === 5 || i === 17 ? '#ef4444' : i === 9 ? '#f59e0b' : '#22c55e',
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-2 border border-gray-700/40">
          <p className="text-[7px] text-gray-400 mb-1">FINE RISK</p>
          <p className="text-sm font-black text-yellow-400">$42K</p>
          <p className="text-[7px] text-gray-500">projected</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Page 4 ─── */
export default function Page4Devices() {
  const phones = [
    { label: 'Energy', screen: <EnergyScreen />, accent: '#22c55e' },
    { label: 'Solar', screen: <SolarScreen />, accent: '#f59e0b' },
    { label: 'Alerts', screen: <AlertsScreen />, accent: '#ef4444' },
    { label: 'Compliance', screen: <ComplianceScreen />, accent: '#60a5fa' },
  ]

  return (
    <section
      id="page4"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #e8edf2 0%, #d4e8e0 50%, #cde0e8 100%)' }}
    >
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(34,197,94,0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Section label */}
      <div className="relative z-10 text-center mb-10">
        <p className="text-green-600 text-xs font-bold tracking-[0.3em] uppercase mb-2">Platform Preview</p>
        <h2 className="text-4xl font-black text-gray-800">Monitor from Anywhere</h2>
        <p className="text-gray-500 mt-2 text-base">Full dashboard on iPad. Quick glance features on iPhone 17.</p>
      </div>

      {/* Device stage */}
      <div className="relative z-10 flex items-end justify-center px-8">

        {/* iPad — behind / left */}
        <div className="relative z-10 mr-[-20px] mb-0 animate-float" style={{ animationDelay: '0.5s' }}>
          <IPadMockup scale={0.78}>
            <IPadDashboardScreen />
          </IPadMockup>
        </div>

        {/* 4 iPhones — front */}
        <div className="relative z-20 flex items-end gap-4">
          {phones.map((p, i) => (
            <div
              key={i}
              className="animate-float"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <IPhoneMockup label={p.label} accentColor={p.accent} labelColor="#15803d" scale={0.9}>
                {p.screen}
              </IPhoneMockup>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom label */}
      <div className="relative z-10 text-center mt-10">
        <p className="text-gray-400 text-xs">iPhone 17 · iPad Pro · Real-time data sync</p>
      </div>
    </section>
  )
}
