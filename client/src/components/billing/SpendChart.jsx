import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 font-mono text-xs">
      <p className="text-text-muted mb-1">{label}</p>
      <p className="text-success font-bold">${payload[0].value?.toFixed(4)}</p>
    </div>
  );
}

export default function SpendChart({ history = [] }) {
  const chartData = history.map((item) => ({
    date: formatDate(item.date),
    spend: item.spend,
  }));

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-text-muted text-xs uppercase tracking-wider font-mono mb-4">Daily Spend</h3>
      {chartData.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center">
          <p className="text-text-dim text-sm font-mono">No data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#8B949E', fontFamily: 'JetBrains Mono', fontSize: 11 }}
              axisLine={{ stroke: '#30363D' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#8B949E', fontFamily: 'JetBrains Mono', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v.toFixed(2)}`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(88,166,255,0.05)' }} />
            <Bar dataKey="spend" fill="#58A6FF" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
