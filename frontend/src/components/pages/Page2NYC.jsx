import React from 'react'

const CIRCLES = [
  { label: 'Saving' },
  { label: 'Reliable' },
  { label: 'Fast' },
  { label: 'Free' },
]
const CIRCLE_BLUE = '#5c8fb3'

export default function Page2NYC() {
  return (
    <section id="page2" className="relative min-h-screen overflow-hidden flex flex-col">
      {/* Whole page: NYC photo background, title at top, circles at bottom — no white box */}
      <div
        className="relative flex-1 min-h-screen flex flex-col bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/images/blueNYCbuildings01.jpg)' }}
        role="img"
        aria-label="NYC buildings"
      >
        <div className="absolute inset-0 bg-black/30" />

        {/* Title higher */}
        <div className="relative z-10 flex flex-col items-center pt-24 pb-8">
          <p className="text-green-400 text-sm font-bold tracking-[0.3em] uppercase mb-4">Built for New York City</p>
          <h2 className="text-4xl md:text-5xl font-black text-white text-center leading-tight max-w-3xl drop-shadow-lg">
            Every Building in NYC<br />
            <span className="text-green-400">Deserves Smart Energy</span>
          </h2>
        </div>

        {/* Circles at bottom, horizontal alignment — no white line, no small text */}
        <div className="relative z-10 mt-auto pt-8 pb-28 px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-end justify-center gap-8">
              {CIRCLES.map((c, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center"
                >
                  <div
                    className="w-36 h-36 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300 cursor-default flex-shrink-0"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${CIRCLE_BLUE}ee, ${CIRCLE_BLUE}99)`,
                      boxShadow: `0 8px 32px ${CIRCLE_BLUE}44`,
                      border: `2px solid ${CIRCLE_BLUE}cc`,
                    }}
                  >
                    <span className="text-xl font-black text-white">{c.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
