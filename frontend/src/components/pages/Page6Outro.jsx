import React from 'react'
import WireAnimation from '../ui/WireAnimation'
import { usePageNav } from '../../context/PageNavContext'

export default function Page6Outro() {
  const { goToPage } = usePageNav()

  return (
    <section
      id="page6"
      className="relative min-h-screen overflow-hidden flex flex-col justify-center"
      style={{ background: 'linear-gradient(200deg, #15803d 0%, #22c55e 45%, #4ade80 100%)' }}
    >
      <WireAnimation />

      {/* Right vertical accent line */}
      <div className="absolute right-10 top-0 bottom-0 w-px bg-white opacity-10" />

      {/* Content — right aligned */}
      <div className="relative z-10 ml-auto px-16 max-w-3xl text-right">
        {/* Eyebrow */}
        <div className="flex items-center justify-end gap-3 mb-6">
          <span className="text-green-100 text-xs font-bold tracking-[0.3em] uppercase">Join the Movement</span>
          <div className="w-8 h-px bg-white opacity-60" />
        </div>

        {/* Main tagline */}
        <h2 className="text-8xl font-black text-white leading-[1.0] tracking-tight">
          Greener.<br />
          Smarter.<br />
          <span className="text-green-900">NYC.</span>
        </h2>

        {/* Sub-tagline */}
        <p className="mt-7 text-xl text-green-100 ml-auto max-w-xl leading-relaxed">
          GreenEyes NYC helps property owners and managers stay compliant, cut costs, and contribute to a sustainable city. Start monitoring today.
        </p>

        {/* CTA */}
        <div className="mt-10 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => goToPage(0)}
            className="text-green-100 font-semibold text-sm hover:text-white transition-colors flex items-center gap-1"
          >
            ↑ Back to Top
          </button>
          <a
            href="mailto:hello@greeneyesnyc.com"
            className="inline-flex items-center gap-2 bg-white text-green-700 font-black px-8 py-4 rounded-full text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
          >
            Get Started
            <span className="text-xl">→</span>
          </a>
        </div>

        {/* Bottom stats */}
        <div className="mt-16 flex gap-10 justify-end">
          {[
            { value: 'LL97', label: 'Compliant' },
            { value: 'NYC', label: 'Built For' },
            { value: '24/7', label: 'Monitoring' },
          ].map(s => (
            <div key={s.label} className="text-right">
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-sm text-green-200 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer bar */}
      <div className="absolute bottom-0 left-0 right-0 px-16 py-5 flex items-center justify-between border-t border-green-400/20">
        <p className="text-green-200 text-xs">© 2026 GreenEyes NYC. All rights reserved.</p>
        <div className="flex items-center gap-6">
          {['Privacy', 'Terms', 'Contact'].map(link => (
            <a key={link} href="#" className="text-green-200 text-xs hover:text-white transition-colors">{link}</a>
          ))}
        </div>
      </div>
    </section>
  )
}
