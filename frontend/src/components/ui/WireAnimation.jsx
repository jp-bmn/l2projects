import React from 'react'

export default function WireAnimation({ dark = false }) {
  const stroke1 = dark ? 'rgba(34,197,94,0.15)' : 'rgba(0,0,0,0.12)'
  const stroke2 = dark ? 'rgba(34,197,94,0.10)' : 'rgba(0,0,0,0.09)'
  const stroke3 = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'
  const strokeGlow = dark ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.22)'

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Wire 1 — upper meander */}
      <path
        d="M -60 160 C 120 140, 280 310, 480 260 S 700 110, 920 195 S 1140 360, 1340 300 S 1430 205, 1500 225"
        fill="none"
        stroke={stroke1}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Wire 2 — mid crossing */}
      <path
        d="M -60 420 C 200 395, 380 540, 620 475 S 860 310, 1060 405 S 1270 525, 1500 465"
        fill="none"
        stroke={stroke2}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Wire 3 — lower meander */}
      <path
        d="M -60 700 C 110 670, 310 768, 560 710 S 820 590, 1020 668 S 1220 785, 1500 730"
        fill="none"
        stroke={stroke3}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Wire 4 — diagonal straggler */}
      <path
        d="M -60 290 C 240 310, 480 160, 730 265 S 975 415, 1200 360 S 1380 280, 1500 305"
        fill="none"
        stroke={stroke2}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="10 5"
      />
      {/* Wire 5 — animated glow line */}
      <path
        d="M -60 550 C 210 520, 420 655, 665 585 S 920 455, 1170 548 S 1360 628, 1500 598"
        fill="none"
        stroke={strokeGlow}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="30 12"
        style={{ animation: 'wireFlow 5s linear infinite' }}
      />
      {/* Wire 6 — thin straggler top */}
      <path
        d="M -60 80 C 180 100, 350 30, 600 85 S 840 155, 1060 95 S 1300 40, 1500 70"
        fill="none"
        stroke={stroke3}
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="6 8"
        style={{ animation: 'wireFlow 8s linear infinite reverse' }}
      />
    </svg>
  )
}
