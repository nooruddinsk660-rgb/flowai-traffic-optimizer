import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Volume2, Eye, X, Clock, Zap, ArrowRight } from 'lucide-react';

const ROUTE_NORMAL_TIME = {
  'CP_01_AIIMS_01': 840,
  'NEHRU_01_AIIMS_01': 1080,
  'ROHINI_01_AIIMS_01': 1560,
  'SAK_01_AIIMS_01': 720,
  'LODHI_01_AIIMS_01': 600,
  'KALK_01_AIIMS_01': 900,
  'CP_01_SAK_01': 600,
};

function fmt(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${m}:00`;
}

// Animated count-up ring
function RingStat({ value, max, label, color, size = 56 }) {
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = circ * pct;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={4}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color, fontFamily: '"JetBrains Mono", monospace',
          textShadow: `0 0 10px ${color}`,
        }}>
          {fmt(value)}
        </div>
      </div>
      <span style={{ fontSize: 7, color: 'rgba(148,163,184,0.5)', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
}

export default function EmergencyPanel({ emergency, onReset }) {
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [visible, setVisible] = useState(false);
  const beepedRef = useRef(false);

  useEffect(() => {
    if (!emergency) { setElapsed(0); setVisible(false); beepedRef.current = false; return; }
    // Mount animation
    requestAnimationFrame(() => setVisible(true));
    const start = new Date(emergency.activated_at).getTime();
    const tick = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(tick);
  }, [emergency?.activated_at]);

  // Beep on activation
  useEffect(() => {
    if (!emergency || beepedRef.current) return;
    beepedRef.current = true;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [880, 1100, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.18;
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.start(t); osc.stop(t + 0.15);
      });
    } catch (_) { }
  }, [emergency?.activated_at]);

  if (!emergency) return null;

  const normalTime = ROUTE_NORMAL_TIME[emergency.route] || 840;
  const flowaiTime = emergency.eta || 360;
  const savedSec = Math.max(0, normalTime - flowaiTime);
  const savePct = Math.round((savedSec / normalTime) * 100);

  const handleReset = async () => {
    if (loading) return;
    setLoading(true);
    try { await onReset(); } finally { setLoading(false); }
  };

  return (
    <div style={{
      marginBottom: 12, flexShrink: 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.97)',
      opacity: visible ? 1 : 0,
      transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
      position: 'relative', borderRadius: 14, overflow: 'hidden',
    }}>
      {/* Outer glow layer */}
      <div style={{
        position: 'absolute', inset: -1,
        borderRadius: 15,
        background: 'linear-gradient(135deg, rgba(239,68,68,0.5) 0%, rgba(239,68,68,0.1) 50%, rgba(239,68,68,0.3) 100%)',
        animation: 'emergencyGlow 2s ease-in-out infinite',
        filter: 'blur(1px)',
      }} />

      {/* Main card */}
      <div style={{
        position: 'relative', borderRadius: 13, overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(20,4,4,0.97) 0%, rgba(30,8,8,0.95) 100%)',
        border: '1px solid rgba(239,68,68,0.4)',
        boxShadow: '0 0 40px rgba(239,68,68,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}>
        {/* Scanlines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(239,68,68,0.03) 3px, rgba(239,68,68,0.03) 6px)',
        }} />

        {/* Top accent bar */}
        <div style={{
          height: 3, width: '100%',
          background: 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)',
          backgroundSize: '200% 100%',
          animation: 'slideGrad 2s linear infinite',
          boxShadow: '0 0 12px rgba(239,68,68,0.8)',
        }} />

        <div style={{ padding: '12px 14px', position: 'relative', zIndex: 1 }}>

          {/* HEADER ROW */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Pulsing shield icon */}
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 15px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,100,100,0.1)',
                animation: 'shieldPulse 1.5s ease-in-out infinite',
              }}>
                <ShieldAlert style={{ width: 16, height: 16, color: '#ef4444' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 900, color: '#ef4444',
                    fontFamily: '"JetBrains Mono", monospace',
                    letterSpacing: '0.25em', textTransform: 'uppercase',
                    textShadow: '0 0 10px rgba(239,68,68,0.6)',
                  }}>⚠ PRIORITY CORRIDOR</span>
                  {/* Source badges */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    {(emergency.source === 'audio' || emergency.source === 'dual') && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '1px 5px', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 4 }}>
                        <Volume2 style={{ width: 8, height: 8, color: '#38bdf8' }} />
                      </span>
                    )}
                    {(emergency.source === 'visual' || emergency.source === 'dual') && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '1px 5px', background: 'rgba(0,255,157,0.12)', border: '1px solid rgba(0,255,157,0.3)', borderRadius: 4 }}>
                        <Eye style={{ width: 8, height: 8, color: '#00ff9d' }} />
                      </span>
                    )}
                    {emergency.source === 'manual' && (
                      <span style={{ padding: '1px 5px', background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 4, fontSize: 7, color: 'rgba(148,163,184,0.7)', fontFamily: '"JetBrains Mono", monospace' }}>MANUAL</span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.75)', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.05em' }}>
                  {emergency.route?.replace(/_/g, ' → ') || 'Emergency Route'}
                </div>
              </div>
            </div>

            {/* Close button */}
            <button onClick={handleReset} disabled={loading} style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.4 : 1,
              color: 'rgba(148,163,184,0.6)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(148,163,184,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <X style={{ width: 12, height: 12 }} />
            </button>
          </div>

          {/* BEFORE / AFTER — 3D comparison cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 6, alignItems: 'center', marginBottom: 10 }}>
            {/* Normal time */}
            <div style={{
              padding: '10px', borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.04) 100%)',
              border: '1px solid rgba(239,68,68,0.2)',
              transform: 'perspective(150px) rotateY(3deg)',
              boxShadow: 'inset 0 1px 0 rgba(255,100,100,0.08)',
            }}>
              <div style={{ fontSize: 7, color: 'rgba(248,113,113,0.5)', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>WITHOUT FLOWAI</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#f87171', fontFamily: '"JetBrains Mono", monospace', lineHeight: 1, textShadow: '0 0 15px rgba(248,113,113,0.5)', letterSpacing: '-0.02em' }}>{fmt(normalTime)}</div>
              <div style={{ fontSize: 7, color: 'rgba(248,113,113,0.35)', fontFamily: '"JetBrains Mono", monospace', marginTop: 3 }}>avg. delay</div>
            </div>

            {/* Arrow */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <ArrowRight style={{ width: 14, height: 14, color: '#fbbf24', filter: 'drop-shadow(0 0 6px #fbbf24)' }} />
              <span style={{ fontSize: 7, color: '#fbbf24', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, textShadow: '0 0 8px rgba(251,191,36,0.6)' }}>-{savePct}%</span>
            </div>

            {/* FlowAI time */}
            <div style={{
              padding: '10px', borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(0,255,157,0.1) 0%, rgba(0,255,157,0.04) 100%)',
              border: '1px solid rgba(0,255,157,0.2)',
              transform: 'perspective(150px) rotateY(-3deg)',
              boxShadow: 'inset 0 1px 0 rgba(0,255,157,0.08)',
            }}>
              <div style={{ fontSize: 7, color: 'rgba(0,255,157,0.5)', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>FLOWAI CORRIDOR</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#00ff9d', fontFamily: '"JetBrains Mono", monospace', lineHeight: 1, textShadow: '0 0 15px rgba(0,255,157,0.6)', letterSpacing: '-0.02em' }}>{fmt(flowaiTime)}</div>
              <div style={{ fontSize: 7, color: 'rgba(0,255,157,0.35)', fontFamily: '"JetBrains Mono", monospace', marginTop: 3 }}>green corridor</div>
            </div>
          </div>

          {/* SAVED BAR */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 10px', borderRadius: 8,
            background: 'rgba(251,191,36,0.06)',
            border: '1px solid rgba(251,191,36,0.15)',
            marginBottom: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap style={{ width: 12, height: 12, color: '#fbbf24', filter: 'drop-shadow(0 0 4px #fbbf24)' }} />
              <span style={{ fontSize: 8, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(148,163,184,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Time Rescued</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#fbbf24', fontFamily: '"JetBrains Mono", monospace', textShadow: '0 0 12px rgba(251,191,36,0.5)' }}>{fmt(savedSec)}</span>
          </div>

          {/* FOOTER — elapsed + corridor nodes */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid rgba(239,68,68,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(100,116,139,0.6)' }}>
              <Clock style={{ width: 9, height: 9 }} />
              <span style={{ fontSize: 8, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.1em' }}>ACTIVE {fmt(elapsed)}</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(emergency.corridor || []).map(id => (
                <span key={id} style={{
                  fontSize: 7, fontFamily: '"JetBrains Mono", monospace',
                  padding: '2px 6px', borderRadius: 4,
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#f87171', letterSpacing: '0.08em',
                }}>
                  {id.replace('_01', '')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes emergencyGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes slideGrad {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
        @keyframes shieldPulse {
          0%, 100% { box-shadow: 0 0 15px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,100,100,0.1); }
          50% { box-shadow: 0 0 25px rgba(239,68,68,0.5), inset 0 1px 0 rgba(255,100,100,0.15); }
        }
      `}</style>
    </div>
  );
}