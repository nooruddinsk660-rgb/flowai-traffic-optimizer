import React from 'react';
import Map from './Map';

export default function MapSection({ intersections, emergency, onTrigger, activeCamId, onSelectCam }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <Map
        intersections={intersections}
        emergency={emergency}
        onTrigger={onTrigger}
        activeCamId={activeCamId}
        onSelectCam={onSelectCam}
      />

      {/* TOP RIGHT — System status HUD */}
      <div style={{
        position: 'absolute', top: 20, right: 20, zIndex: 1000, pointerEvents: 'none',
      }}>
        <div style={{
          background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(56,189,248,0.15)',
          borderRadius: 12, padding: '12px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          transform: 'perspective(200px) rotateX(1deg)',
          minWidth: 160,
        }}>
          {/* Top shimmer */}
          <div style={{
            position: 'absolute', top: 0, left: 12, right: 12, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent)',
          }} />

          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: emergency ? '#ef4444' : '#00ff9d', boxShadow: emergency ? '0 0 8px #ef4444' : '0 0 8px #00ff9d', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 8, fontWeight: 900, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(148,163,184,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>SYS_STATUS</span>
          </div>

          {[
            { label: 'Sector', value: 'DEL_SEC_01', color: '#38bdf8' },
            { label: 'Nodes', value: `${intersections.length} Active`, color: '#38bdf8' },
            { label: 'Status', value: emergency ? 'EMERGENCY' : 'NOMINAL', color: emergency ? '#ef4444' : '#00ff9d', pulse: emergency },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 4 }}>
              <span style={{ fontSize: 8, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(71,85,105,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{row.label}</span>
              <span style={{
                fontSize: 9, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700,
                color: row.color, textShadow: `0 0 8px ${row.color}60`,
                animation: row.pulse ? 'pulse 1s infinite' : 'none',
              }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM LEFT — Signal legend */}
      <div style={{
        position: 'absolute', bottom: 20, left: 20, zIndex: 1000, pointerEvents: 'none',
      }}>
        <div style={{
          background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12, padding: '12px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
          transform: 'perspective(200px) rotateX(-1deg)',
        }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 8, fontWeight: 900, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(148,163,184,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Signal_Legend</span>
          </div>
          {[
            { color: '#00ff9d', shadow: '#00ff9d', label: 'OPTIMAL  <40%', pulse: false },
            { color: '#fbbf24', shadow: '#fbbf24', label: 'CONGESTED 40–70%', pulse: false },
            { color: '#ef4444', shadow: '#ef4444', label: 'CRITICAL  >70%', pulse: true },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: item.color,
                boxShadow: `0 0 8px ${item.shadow}`,
                animation: item.pulse ? 'pulse 1.5s ease-in-out infinite' : 'none',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 8, fontFamily: '"JetBrains Mono", monospace', color: item.pulse ? '#f87171' : 'rgba(148,163,184,0.6)', fontWeight: item.pulse ? 700 : 400, letterSpacing: '0.08em' }}>{item.label}</span>
            </div>
          ))}
          {/* Emergency corridor legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <div style={{ width: 14, height: 2, borderTop: '2px dashed rgba(239,68,68,0.7)', flexShrink: 0 }} />
            <span style={{ fontSize: 8, fontFamily: '"JetBrains Mono", monospace', color: '#f87171', fontWeight: 700, letterSpacing: '0.08em' }}>EMRG CORRIDOR</span>
          </div>
        </div>
      </div>

      {/* Corner vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        boxShadow: 'inset 0 0 120px rgba(0,0,0,0.45)',
      }} />

      {/* Emergency overlay banner */}
      {emergency && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 999,
          height: 3,
          background: 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)',
          backgroundSize: '200% 100%',
          animation: 'slideGrad 1.5s linear infinite',
          boxShadow: '0 0 20px rgba(239,68,68,0.6)',
        }} />
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideGrad { 0%{background-position:0% 0%} 100%{background-position:200% 0%} }
      `}</style>
    </div>
  );
}