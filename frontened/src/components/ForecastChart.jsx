import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

export default function ForecastChart({ data, isEmergency }) {
  // Graceful fallback if ML data is missing
  if (!data || data.length === 0) {
    return (
      <div style={{
        height: 120, display: 'flex', alignItems: 'center',
        justifyContent: 'center', opacity: 0.4
      }}>
        <span style={{ fontFamily: 'monospace', fontSize: 11 }}>
          ⏳ Forecast loading...
        </span>
      </div>
    );
  }

  // Format simple array [0.1, 0.4, ...] into Recharts objects
  const chartData = data.map((val, index) => ({ time: index, density: val }));

  return (
    <div className="h-12 w-full mt-3 group-hover:opacity-100 opacity-70 transition-opacity">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isEmergency ? "#ef4444" : "#38bdf8"} stopOpacity={0.3} />
              <stop offset="95%" stopColor={isEmergency ? "#ef4444" : "#38bdf8"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[0, 1]} />
          <Area
            type="monotone"
            dataKey="density"
            stroke={isEmergency ? "#ef4444" : "#38bdf8"}
            fillOpacity={1}
            fill="url(#colorDensity)"
            strokeWidth={2}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}