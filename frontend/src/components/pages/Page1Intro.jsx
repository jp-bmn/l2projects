import React from 'react'
import WireAnimation from '../ui/WireAnimation'
import { usePageNav } from '../../context/PageNavContext'

export default function Page1Intro() {
  const { goToPage } = usePageNav()

  return (
    <section
      className="relative min-h-screen overflow-hidden flex flex-col justify-center"
      style={{ background: 'linear-gradient(160deg, #16a34a 0%, #22c55e 45%, #4ade80 100%)' }}
    >
      <WireAnimation />

      {/* Left vertical accent line */}
      <div className="absolute left-10 top-0 bottom-0 w-px bg-white opacity-10" />

      {/* Content — left aligned, starting at left edge within safe zone */}
      <div className="relative z-10 px-16 max-w-3xl">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-px bg-white opacity-60" />
          <span className="text-green-100 text-xs font-bold tracking-[0.3em] uppercase">GreenEyes NYC</span>
        </div>

        {/* Main tagline */}
        <h1 className="text-8xl font-black text-white leading-[1.0] tracking-tight">
          Reduce.<br />
          Monitor.<br />
          <span className="text-green-900">Comply.</span>
        </h1>

        {/* Sub-tagline */}
        <p className="mt-7 text-xl text-green-100 max-w-xl leading-relaxed">
          The intelligent energy reduction monitor built for NYC buildings. Real-time LL97 compliance, carbon tracking, and automated alerts — all in one platform.
        </p>

        {/* CTA */}
        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            onClick={() => goToPage(2)}
            className="inline-flex items-center gap-2 bg-white text-green-700 font-black px-8 py-4 rounded-full text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
          >
            See the Platform
            <span className="text-xl">→</span>
          </button>
          <button
            type="button"
            onClick={() => goToPage(1)}
            className="text-green-100 font-semibold text-sm hover:text-white transition-colors flex items-center gap-1"
          >
            Learn More ↓
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-16 flex gap-10">
          {[
            { value: 'LL97', label: 'Compliant' },
            { value: '30+', label: 'Sensors Live' },
            { value: '0', label: 'Fines Issued' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-sm text-green-200 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-900/30 to-transparent" />
      
     {/* Scroll / swipe hint */}
       <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-green-200 opacity-60">
        <span className="text-xs tracking-widest uppercase">Use buttons below to navigate</span>
        <div className="w-px h-8 bg-green-200 animate-bounce" />
      </div>
  
       </section>
  )
}
