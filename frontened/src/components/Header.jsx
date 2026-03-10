import React, { useState, useEffect } from 'react';
import { Activity, Zap, Clock, Wind, Cpu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

// Animated number that counts up to target value
function LiveNumber({ value, suffix = '', prefix = '' }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    setDisplay(value);
  }, [value]);
  return <span>{prefix}{display}{suffix}</span>;
}

export default function Header({ status = 'offline', nodeCount = 8, avgAqi = 0, efficiencyGain = '+0%', minutesSaved = 0 }) {
  const isOnline = status === 'online';
  const [tick, setTick] = useState(0);

  // Heartbeat tick for animated elements
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const kpis = [
    {
      label: 'EFFICIENCY',
      value: efficiencyGain,
      icon: <Zap className="w-3.5 h-3.5" />,
      color: '#00ff9d',
      glow: 'rgba(0,255,157,0.4)',
      bg: 'rgba(0,255,157,0.06)',
      border: 'rgba(0,255,157,0.2)',
    },
    {
      label: 'MIN SAVED',
      value: `${minutesSaved}m`,
      icon: <Clock className="w-3.5 h-3.5" />,
      color: '#fbbf24',
      glow: 'rgba(251,191,36,0.4)',
      bg: 'rgba(251,191,36,0.06)',
      border: 'rgba(251,191,36,0.2)',
    },
    {
      label: 'AVG PM2.5',
      value: avgAqi,
      suffix: ' µg',
      icon: <Wind className="w-3.5 h-3.5" />,
      color: avgAqi > 150 ? '#f87171' : avgAqi > 100 ? '#fbbf24' : '#00ff9d',
      glow: avgAqi > 150 ? 'rgba(248,113,113,0.4)' : 'rgba(251,191,36,0.3)',
      bg: avgAqi > 150 ? 'rgba(248,113,113,0.06)' : 'rgba(251,191,36,0.04)',
      border: avgAqi > 150 ? 'rgba(248,113,113,0.2)' : 'rgba(251,191,36,0.15)',
    },
    {
      label: 'ACTIVE NODES',
      value: nodeCount,
      suffix: '/8',
      icon: <Cpu className="w-3.5 h-3.5" />,
      color: '#38bdf8',
      glow: 'rgba(56,189,248,0.4)',
      bg: 'rgba(56,189,248,0.06)',
      border: 'rgba(56,189,248,0.2)',
    },
  ];

  return (
    <header style={{
      height: 64,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      background: 'linear-gradient(180deg, rgba(2,6,23,0.98) 0%, rgba(4,10,30,0.95) 100%)',
      borderBottom: '1px solid rgba(56,189,248,0.12)',
      backdropFilter: 'blur(24px)',
      position: 'relative',
      zIndex: 1002,
      overflow: 'hidden',
    }}>

      {/* Scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(56,189,248,0.015) 2px, rgba(56,189,248,0.015) 4px)',
        zIndex: 0,
      }} />

      {/* Animated left border beam */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
        background: 'linear-gradient(180deg, transparent, #38bdf8, #00ff9d, transparent)',
        opacity: 0.7,
        animation: 'beamSlide 3s ease-in-out infinite',
      }} />

      {/* BRAND — LEFT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 220, position: 'relative', zIndex: 1 }}>
        {/* 3D Logo box */}
        <div style={{
          width: 40, height: 40,
          background: 'linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(0,255,157,0.08) 100%)',
          border: '1px solid rgba(56,189,248,0.3)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(56,189,248,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
          transform: 'perspective(100px) rotateX(5deg)',
          position: 'relative',
        }}>
          <Activity style={{ width: 18, height: 18, color: '#38bdf8' }} />
          {/* Inner glow dot */}
          <div style={{
            position: 'absolute', top: 4, right: 4,
            width: 4, height: 4, borderRadius: '50%',
            background: '#00ff9d',
            boxShadow: '0 0 6px #00ff9d',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{
              fontSize: 15, fontWeight: 900, letterSpacing: '0.25em',
              textTransform: 'uppercase', color: '#f1f5f9',
              fontFamily: '"Rajdhani", "JetBrains Mono", monospace',
            }}>FlowAI</span>
            <span style={{
              fontSize: 10, fontWeight: 400, letterSpacing: '0.1em',
              color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase',
              fontFamily: '"JetBrains Mono", monospace',
            }}>SYS_CTRL</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              background: isOnline ? '#00ff9d' : '#ef4444',
              boxShadow: isOnline ? '0 0 8px #00ff9d' : '0 0 8px #ef4444',
              animation: isOnline ? 'pulse 2s infinite' : 'none',
            }} />
            <span style={{
              fontSize: 9, color: 'rgba(100,116,139,0.8)',
              fontFamily: '"JetBrains Mono", monospace',
              letterSpacing: '0.15em', textTransform: 'uppercase',
            }}>
              NCT_DELHI · {isOnline ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI CARDS — CENTER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative', zIndex: 1 }}>
        {kpis.map((kpi, i) => (
          <div key={kpi.label} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '6px 14px',
            background: kpi.bg,
            border: `1px solid ${kpi.border}`,
            borderRadius: 8,
            position: 'relative', overflow: 'hidden',
            transform: 'perspective(200px) rotateX(2deg)',
            boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default',
            minWidth: 80,
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'perspective(200px) rotateX(-2deg) translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,0,0,0.4), 0 0 15px ${kpi.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'perspective(200px) rotateX(2deg)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)';
            }}
          >
            {/* Top shimmer line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg, transparent, ${kpi.color}, transparent)`,
              opacity: 0.6,
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2, color: kpi.color, opacity: 0.7 }}>
              {kpi.icon}
              <span style={{
                fontSize: 8, fontFamily: '"JetBrains Mono", monospace',
                letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.6)',
              }}>{kpi.label}</span>
            </div>
            <span style={{
              fontSize: 14, fontWeight: 800, color: kpi.color,
              fontFamily: '"JetBrains Mono", monospace',
              textShadow: `0 0 12px ${kpi.glow}`,
              letterSpacing: '0.05em',
            }}>
              {kpi.prefix}{kpi.value}{kpi.suffix}
            </span>
          </div>
        ))}

        {/* Live ticker bar between KPIs and status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 6,
          marginLeft: 4,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: isOnline ? '#00ff9d' : '#ef4444',
            boxShadow: isOnline ? '0 0 10px #00ff9d' : '0 0 10px #ef4444',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: 8, fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: isOnline ? '#00ff9d' : '#ef4444',
            fontWeight: 700,
          }}>{isOnline ? 'STREAMING' : 'RECONNECTING'}</span>

          {/* Animated dots */}
          {isOnline && (
            <div style={{ display: 'flex', gap: 2 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 3, height: 3, borderRadius: '50%', background: '#00ff9d',
                  opacity: (tick + i) % 3 === 0 ? 1 : 0.2,
                  transition: 'opacity 0.3s',
                }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — Theme + Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 220, justifyContent: 'flex-end', position: 'relative', zIndex: 1 }}>
        <ThemeToggle />

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 999,
          background: isOnline ? 'rgba(0,255,157,0.06)' : 'rgba(239,68,68,0.06)',
          border: `1px solid ${isOnline ? 'rgba(0,255,157,0.25)' : 'rgba(239,68,68,0.25)'}`,
          boxShadow: isOnline ? '0 0 20px rgba(0,255,157,0.08)' : '0 0 20px rgba(239,68,68,0.08)',
          transition: 'all 0.5s',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: isOnline ? '#00ff9d' : '#ef4444',
            boxShadow: isOnline ? '0 0 10px #00ff9d' : '0 0 10px #ef4444',
            animation: !isOnline ? 'pulse 1s ease-in-out infinite' : 'none',
          }} />
          <span style={{
            fontSize: 9, fontWeight: 800, fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: isOnline ? '#00ff9d' : '#ef4444',
          }}>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700;800&display=swap');
        @keyframes beamSlide {
          0%, 100% { opacity: 0.3; transform: translateY(-100%); }
          50% { opacity: 0.8; transform: translateY(100%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </header>
  );
}