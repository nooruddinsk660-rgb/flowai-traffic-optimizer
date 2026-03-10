import React, { useEffect, useRef } from 'react';
import EmergencyPanel from './EmergencyPanel';
import ForecastChart from './ForecastChart';
import { Timer, Radio, TrendingUp, RefreshCw, Activity } from 'lucide-react';

// 3D intersection node card
function NodeCard({ node, isEmergency, isActiveCam, onSelectCam, emergency }) {
  const loadPct = Math.round((node.density ?? 0) * 100);
  const color = isEmergency ? '#ef4444' : isActiveCam ? '#38bdf8' : loadPct > 70 ? '#f97316' : loadPct > 40 ? '#fbbf24' : '#00ff9d';
  const glow = isEmergency ? 'rgba(239,68,68,0.2)' : isActiveCam ? 'rgba(56,189,248,0.15)' : 'transparent';

  return (
    <div
      id={`sidebar-node-${node.id}`}
      onClick={() => onSelectCam(node.id)}
      style={{
        position: 'relative', borderRadius: 12, overflow: 'hidden',
        padding: '10px 12px',
        background: isEmergency
          ? 'linear-gradient(135deg, rgba(20,4,4,0.95) 0%, rgba(15,3,3,0.9) 100%)'
          : isActiveCam
            ? 'linear-gradient(135deg, rgba(4,16,30,0.97) 0%, rgba(2,10,22,0.95) 100%)'
            : 'linear-gradient(135deg, rgba(8,12,24,0.95) 0%, rgba(4,8,16,0.9) 100%)',
        border: `1px solid ${isEmergency ? 'rgba(239,68,68,0.35)' : isActiveCam ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 0 0 transparent, inset 0 1px 0 rgba(255,255,255,0.05)`,
        cursor: 'pointer',
        transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, border-color 0.25s ease',
        transform: isActiveCam ? 'translateY(-1px)' : 'none',
        marginBottom: 6,
      }}
      onMouseEnter={e => {
        if (isActiveCam || isEmergency) return;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'rgba(56,189,248,0.25)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(56,189,248,0.08), inset 0 1px 0 rgba(255,255,255,0.06)';
      }}
      onMouseLeave={e => {
        if (isActiveCam || isEmergency) return;
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)';
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: isEmergency
          ? 'linear-gradient(180deg, #ef4444, #f97316, #ef4444)'
          : isActiveCam
            ? 'linear-gradient(180deg, #38bdf8, #00ff9d, #38bdf8)'
            : `linear-gradient(180deg, ${color}60, ${color}20)`,
        backgroundSize: '100% 200%',
        animation: (isEmergency || isActiveCam) ? 'barFlow 2s linear infinite' : 'none',
        boxShadow: isEmergency ? '0 0 8px rgba(239,68,68,0.6)' : isActiveCam ? '0 0 8px rgba(56,189,248,0.5)' : 'none',
      }} />

      {/* Scanline on emergency */}
      {isEmergency && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(239,68,68,0.025) 3px, rgba(239,68,68,0.025) 6px)',
        }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, paddingLeft: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: isEmergency ? '#f87171' : isActiveCam ? '#38bdf8' : '#e2e8f0',
            fontFamily: '"Rajdhani", sans-serif', letterSpacing: '0.05em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            textShadow: isActiveCam ? '0 0 10px rgba(56,189,248,0.4)' : isEmergency ? '0 0 10px rgba(239,68,68,0.4)' : 'none',
          }}>{node.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 8, color: 'rgba(100,116,139,0.6)', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {node.active_direction}
            </span>
            {(node.aqi_penalty ?? 0) > 0 && (
              <span style={{ fontSize: 7, color: 'rgba(251,191,36,0.6)', fontFamily: '"JetBrains Mono", monospace' }}>
                −{node.aqi_penalty}s AQI
              </span>
            )}
          </div>
        </div>

        {/* Right: timer + load */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Timer style={{ width: 10, height: 10, color: '#38bdf8' }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8', fontFamily: '"JetBrains Mono", monospace', textShadow: '0 0 8px rgba(56,189,248,0.5)' }}>
              {node.green_seconds}s
            </span>
          </div>
          <span style={{
            fontSize: 9, fontWeight: 800, fontFamily: '"JetBrains Mono", monospace',
            color: loadPct > 70 ? '#f87171' : loadPct > 40 ? '#fbbf24' : '#00ff9d',
            textShadow: `0 0 6px ${loadPct > 70 ? 'rgba(248,113,113,0.5)' : 'rgba(0,255,157,0.4)'}`,
          }}>{loadPct}%</span>
        </div>
      </div>

      {/* Density bar — segmented for depth */}
      <div style={{ paddingLeft: 6, marginBottom: 2 }}>
        <div style={{
          height: 4, borderRadius: 999, overflow: 'hidden',
          background: 'rgba(255,255,255,0.06)',
          display: 'flex',
          boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.3)',
        }}>
          <div style={{
            width: `${loadPct}%`,
            background: isEmergency
              ? 'linear-gradient(90deg, #ef4444, #f97316)'
              : loadPct > 70 ? 'linear-gradient(90deg, #f97316, #f87171)'
                : loadPct > 40 ? 'linear-gradient(90deg, #d97706, #fbbf24)'
                  : 'linear-gradient(90deg, #059669, #00ff9d)',
            borderRadius: 999,
            transition: 'width 1s ease',
            boxShadow: `0 0 8px ${color}60`,
          }} />
        </div>
      </div>

      {/* Forecast chart */}
      <div style={{ paddingLeft: 4 }}>
        <ForecastChart data={node.forecast} isEmergency={isEmergency} />
      </div>
    </div>
  );
}

export default function Sidebar({ intersections, emergency, onReset, minutesSaved = 0, activeCamId, onSelectCam, autoCycle, setAutoCycle }) {

  // Auto-scroll to active camera card
  useEffect(() => {
    const el = document.getElementById(`sidebar-node-${activeCamId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeCamId]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      padding: '14px 12px 10px',
      background: 'linear-gradient(180deg, rgba(2,6,23,0.98) 0%, rgba(4,8,20,0.97) 100%)',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Background grid texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
        maskImage: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.3) 80%, transparent 100%)',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Emergency panel */}
        <EmergencyPanel emergency={emergency} onReset={onReset} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Radio style={{ width: 10, height: 10, color: '#38bdf8', filter: 'drop-shadow(0 0 4px #38bdf8)' }} />
              <span style={{ fontSize: 9, fontWeight: 900, color: '#38bdf8', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.25em', textTransform: 'uppercase', textShadow: '0 0 10px rgba(56,189,248,0.4)' }}>
                Live_Grid
              </span>
            </div>
            <span style={{ fontSize: 8, color: 'rgba(71,85,105,0.7)', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.12em' }}>
              NCT_DELHI // 8_NODES
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00ff9d', boxShadow: '0 0 8px #00ff9d', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 7, color: '#00ff9d', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.12em', textTransform: 'uppercase', textShadow: '0 0 6px rgba(0,255,157,0.5)' }}>SYNC</span>
          </div>
        </div>

        {/* Intersection list */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: 2 }}
          className="custom-scrollbar">
          {intersections.map(node => (
            <NodeCard
              key={node.id}
              node={node}
              isEmergency={emergency?.corridor?.includes(node.id)}
              isActiveCam={node.id === activeCamId}
              onSelectCam={onSelectCam}
              emergency={emergency}
            />
          ))}
        </div>

        {/* Minutes saved bar */}
        <div style={{
          flexShrink: 0, marginTop: 8, marginBottom: 8,
          padding: '10px 14px', borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(0,30,20,0.8) 0%, rgba(0,20,14,0.6) 100%)',
          border: '1px solid rgba(0,255,157,0.15)',
          boxShadow: '0 0 20px rgba(0,255,157,0.05), inset 0 1px 0 rgba(0,255,157,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'rgba(0,255,157,0.1)',
              border: '1px solid rgba(0,255,157,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 10px rgba(0,255,157,0.15)',
            }}>
              <TrendingUp style={{ width: 13, height: 13, color: '#00ff9d' }} />
            </div>
            <div>
              <div style={{ fontSize: 8, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(0,255,157,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Time Saved</div>
              <div style={{ fontSize: 7, color: 'rgba(0,255,157,0.3)', fontFamily: '"JetBrains Mono", monospace' }}>this session</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#00ff9d', fontFamily: '"JetBrains Mono", monospace', lineHeight: 1, textShadow: '0 0 15px rgba(0,255,157,0.5)', letterSpacing: '-0.02em' }}>
              {minutesSaved}m
            </div>
          </div>
        </div>

        {/* LIVE CAMERA FEED */}
        <div style={{ flexShrink: 0 }}>
          {/* Feed header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: autoCycle ? '#ef4444' : '#38bdf8',
                boxShadow: autoCycle ? '0 0 8px #ef4444' : '0 0 8px #38bdf8',
                animation: 'pulse 1.5s infinite',
              }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: '#e2e8f0', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.1em' }}>
                LIVE <span style={{ color: '#38bdf8' }}>[{activeCamId}]</span>
              </span>
            </div>
            {!autoCycle ? (
              <button onClick={() => setAutoCycle(true)} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 5, cursor: 'pointer',
                background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)',
                color: '#38bdf8', fontSize: 8, fontFamily: '"JetBrains Mono", monospace',
                letterSpacing: '0.08em', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.08)'; }}
              >
                <RefreshCw style={{ width: 9, height: 9 }} />
                AUTO
              </button>
            ) : (
              <span style={{ fontSize: 7, color: 'rgba(100,116,139,0.4)', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.1em' }}>MJPEG_CYCLE</span>
            )}
          </div>

          {/* Camera frame */}
          <div style={{
            position: 'relative', borderRadius: 12, overflow: 'hidden',
            background: '#000',
            border: '1px solid rgba(56,189,248,0.15)',
            boxShadow: '0 0 30px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.04)',
            aspectRatio: '16/9',
          }}>
            <img
              src={`http://${window.location.hostname}:5001/video/${activeCamId}`}
              alt="Live camera feed"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9, display: 'block' }}
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              onLoad={e => { e.target.style.display = 'block'; e.target.nextSibling.style.display = 'none'; }}
            />

            {/* Offline fallback */}
            <div style={{ display: 'none', position: 'absolute', inset: 0, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.9)' }}>
              <Activity style={{ width: 20, height: 20, color: 'rgba(71,85,105,0.5)' }} />
              <span style={{ marginTop: 6, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(71,85,105,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>OFFLINE</span>
            </div>

            {/* Corner overlays */}
            {/* Crosshair lines */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(56,189,248,0.06)' }} />
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(56,189,248,0.06)' }} />
              {/* Corner brackets */}
              {[['top-2', 'left-2', 'borderTop', 'borderLeft'], ['top-2', 'right-2', 'borderTop', 'borderRight'], ['bottom-2', 'left-2', 'borderBottom', 'borderLeft'], ['bottom-2', 'right-2', 'borderBottom', 'borderRight']].map(([t, l, b1, b2], i) => (
                <div key={i} style={{
                  position: 'absolute',
                  [t.split('-')[0]]: 8, [l.split('-')[0]]: 8,
                  width: 10, height: 10,
                  borderColor: 'rgba(56,189,248,0.4)',
                  borderStyle: 'solid',
                  borderWidth: 0,
                  [b1 + 'Width']: 1.5,
                  [b2 + 'Width']: 1.5,
                }} />
              ))}
            </div>

            {/* LIVE badge */}
            <div style={{
              position: 'absolute', top: 8, left: 10, zIndex: 20,
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '3px 7px', borderRadius: 4,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef4444', animation: 'pulse 1s infinite' }} />
              <span style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.9)', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.15em' }}>LIVE</span>
            </div>

            {/* Cam ID badge */}
            <div style={{
              position: 'absolute', top: 8, right: 10, zIndex: 20,
              padding: '3px 7px', borderRadius: 4,
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(56,189,248,0.25)',
            }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: '#38bdf8', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.1em' }}>
                {activeCamId.replace('_01', '')}
              </span>
            </div>

            {/* Bottom gradient */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 6, left: 10, zIndex: 20 }}>
              <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.1em' }}>
                {new Date().toISOString().split('T')[0]}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes barFlow {
          0% { background-position: 0% 0%; }
          100% { background-position: 0% 200%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.2); border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(56,189,248,0.4); }
      `}</style>
    </div>
  );
}