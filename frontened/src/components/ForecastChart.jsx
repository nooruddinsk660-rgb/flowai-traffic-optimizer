import React, { useEffect, useState, useRef } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Custom tooltip with glassmorphism
const GlassTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  const t = payload[0]?.payload?.time;
  return (
    <div style={{
      background: 'rgba(4,10,30,0.95)',
      border: '1px solid rgba(56,189,248,0.3)',
      borderRadius: 8, padding: '6px 10px',
      boxShadow: '0 0 20px rgba(56,189,248,0.15)',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ fontSize: 8, color: 'rgba(148,163,184,0.6)', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.1em', marginBottom: 2 }}>T+{t}min</div>
      <div style={{ fontSize: 13, fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', color: val > 0.7 ? '#f87171' : val > 0.4 ? '#fbbf24' : '#00ff9d', textShadow: `0 0 8px ${val > 0.7 ? '#f87171' : '#00ff9d'}` }}>
        {Math.round(val * 100)}%
      </div>
    </div>
  );
};

export default function ForecastChart({ data, isEmergency }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!data || data.length === 0 || !mounted) {
    return (
      <div style={{
        height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 8, opacity: 0.25,
      }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              width: 3, height: 8 + Math.sin(i) * 6,
              background: 'rgba(56,189,248,0.4)', borderRadius: 2,
              animation: `barPulse 1.2s ease-in-out ${i * 0.15}s infinite`,
            }} />
          ))}
        </div>
        <style>{`@keyframes barPulse { 0%,100%{opacity:0.3;transform:scaleY(0.5)} 50%{opacity:1;transform:scaleY(1)} }`}</style>
      </div>
    );
  }

  const chartData = data.map(item => ({
    time: item.t_plus,
    density: Number(item.density ?? item)
  }));

  const peakDensity = Math.max(...chartData.map(d => d.density));
  const firstDensity = chartData[0]?.density ?? 0;
  const lastDensity = chartData[chartData.length - 1]?.density ?? 0;
  const trend = lastDensity - firstDensity;

  const strokeColor = isEmergency ? '#ef4444'
    : peakDensity > 0.7 ? '#f97316'
      : peakDensity > 0.4 ? '#fbbf24'
        : '#00ff9d';

  const gradId = `forecast-${isEmergency ? 'e' : peakDensity > 0.7 ? 'h' : peakDensity > 0.4 ? 'm' : 'l'}`;

  return (
    <div style={{ marginTop: 8 }}>
      {/* Trend label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3, paddingLeft: 1, paddingRight: 1 }}>
        <span style={{ fontSize: 7, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(100,116,139,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          30min forecast
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {trend > 0.05
            ? <TrendingUp style={{ width: 8, height: 8, color: '#f87171' }} />
            : trend < -0.05
              ? <TrendingDown style={{ width: 8, height: 8, color: '#00ff9d' }} />
              : <Minus style={{ width: 8, height: 8, color: 'rgba(148,163,184,0.4)' }} />
          }
          <span style={{ fontSize: 7, fontFamily: '"JetBrains Mono", monospace', color: strokeColor, fontWeight: 700 }}>
            PEAK {Math.round(peakDensity * 100)}%
          </span>
        </div>
      </div>

      {/* Chart container — explicit px height prevents -1 bug */}
      <div style={{ width: '100%', minWidth: 0, height: 44, display: 'block', position: 'relative' }}>
        {/* Horizontal grid lines for depth */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          {[0.25, 0.5, 0.75].map(y => (
            <div key={y} style={{
              position: 'absolute', left: 0, right: 0,
              top: `${(1 - y) * 100}%`,
              height: 1,
              background: y === 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
            }} />
          ))}
          {/* Threshold line at 70% */}
          <div style={{
            position: 'absolute', left: 0, right: 0,
            top: `${(1 - 0.7) * 100}%`,
            height: 1,
            background: 'rgba(249,115,22,0.2)',
            borderTop: '1px dashed rgba(249,115,22,0.25)',
          }} />
        </div>

        <ResponsiveContainer width="100%" height={44}>
          <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                <stop offset="60%" stopColor={strokeColor} stopOpacity={0.08} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
              {/* Glow filter */}
              <filter id="chartGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <YAxis hide domain={[0, 1]} />
            <Tooltip content={<GlassTooltip />} cursor={false} />
            <Area
              type="monotone"
              dataKey="density"
              stroke={strokeColor}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradId})`}
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 3, fill: strokeColor, stroke: 'rgba(0,0,0,0.5)', strokeWidth: 1, filter: 'url(#chartGlow)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}