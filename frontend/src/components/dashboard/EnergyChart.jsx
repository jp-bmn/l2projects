import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value
    const limit = payload[0].payload.kwh_limit
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        <p className="text-white font-bold">{val} kWh</p>
        {val > limit && <p className="text-red-400/90">▲ {val - limit} over limit</p>}
      </div>
    )
  }
  return null
}

export default function EnergyChart({ data = [] }) {
  const chartData = data
  const limit = chartData[0]?.kwh_limit ?? 900

  return (
    <div className="dashboard-panel rounded-xl p-4 border border-gray-700/50 h-full">
      <p className="text-sm text-gray-400 font-medium tracking-wide uppercase mb-3">7-Day Energy Usage</p>
      {chartData.length === 0 ? (
        <div className="h-[160px] flex items-center justify-center text-center border border-gray-800 rounded-lg bg-gray-950/30">
          <p className="text-xs text-gray-500">No energy data for this building yet.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <ReferenceLine y={limit} stroke="#f87171" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: 'LL97 Limit', fill: '#f87171', fontSize: 9, position: 'right' }} />
            <Bar dataKey="kwh_actual" radius={[3, 3, 0, 0]} maxBarSize={56}>
              {chartData.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.kwh_actual > entry.kwh_limit ? '#f87171' : '#4ade80'}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
