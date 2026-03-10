import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Popup, Polyline, CircleMarker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Route key builder — must match AMBULANCE_ROUTES keys in routing.py
const buildRouteKey = (fromId, toId = 'AIIMS_01') => `${fromId}_${toId}`;

// ── Inject custom CSS into document head once ────────────────────────────────
const POPUP_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');

  .leaflet-container { background: #020617 !important; }

  .flowai-popup .leaflet-popup-content-wrapper {
    background: rgba(2, 8, 24, 0.97) !important;
    border: 1px solid rgba(56, 189, 248, 0.22) !important;
    border-radius: 14px !important;
    box-shadow: 0 0 0 1px rgba(56,189,248,0.07), 0 24px 60px rgba(0,0,0,0.75), 0 0 35px rgba(56,189,248,0.05) !important;
    backdrop-filter: blur(24px) !important;
    padding: 0 !important;
    overflow: hidden !important;
  }
  .flowai-popup.emergency-popup .leaflet-popup-content-wrapper {
    border-color: rgba(239,68,68,0.38) !important;
    box-shadow: 0 0 0 1px rgba(239,68,68,0.1), 0 24px 60px rgba(0,0,0,0.75), 0 0 40px rgba(239,68,68,0.1) !important;
  }
  .flowai-popup .leaflet-popup-content {
    margin: 0 !important;
    width: 204px !important;
    font-family: 'JetBrains Mono', monospace !important;
  }
  .flowai-popup .leaflet-popup-tip-container { display: none !important; }
  .flowai-popup .leaflet-popup-close-button {
    color: rgba(148,163,184,0.35) !important;
    font-size: 16px !important;
    top: 8px !important; right: 10px !important;
    width: 20px !important; height: 20px !important; line-height: 20px !important;
    z-index: 10 !important; background: none !important;
  }
  .flowai-popup .leaflet-popup-close-button:hover { color: rgba(239,68,68,0.7) !important; background: none !important; }

  .leaflet-control-zoom {
    border: 1px solid rgba(56,189,248,0.18) !important;
    border-radius: 10px !important; overflow: hidden !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
    margin-right: 16px !important; margin-bottom: 16px !important;
  }
  .leaflet-control-zoom a {
    background: rgba(2,8,24,0.92) !important;
    color: rgba(56,189,248,0.65) !important;
    border-bottom: 1px solid rgba(56,189,248,0.1) !important;
    width: 30px !important; height: 30px !important; line-height: 30px !important;
    font-weight: 300 !important; font-size: 17px !important;
    transition: all 0.2s !important;
  }
  .leaflet-control-zoom a:hover { background: rgba(56,189,248,0.1) !important; color: #38bdf8 !important; }

  .leaflet-control-attribution {
    background: rgba(2,6,18,0.75) !important; color: rgba(71,85,105,0.45) !important;
    font-size: 9px !important; font-family: 'JetBrains Mono', monospace !important;
    letter-spacing: 0.04em !important; padding: 2px 6px !important;
    border-radius: 4px 0 0 0 !important; backdrop-filter: blur(8px) !important;
  }
  .leaflet-control-attribution a { color: rgba(56,189,248,0.35) !important; }

  @keyframes popupSlideGrad {
    0% { background-position: 0% 0%; }
    100% { background-position: 200% 0%; }
  }
`;

function injectStyles() {
    if (document.getElementById('flowai-map-styles')) return;
    const el = document.createElement('style');
    el.id = 'flowai-map-styles';
    el.textContent = POPUP_STYLES;
    document.head.appendChild(el);
}

// ── Popup content — all inline styles, no Tailwind (Leaflet shadow DOM) ──────
function NodePopup({ node, isInCorridor, loadingId, emergency, onTrigger }) {
    const loadPct = Math.round((node.density ?? 0) * 100);
    const isLoading = loadingId === node.id;
    const canTrigger = !loadingId && !emergency;

    const accentColor = isInCorridor ? '#ef4444' : '#38bdf8';
    const nameColor = isInCorridor ? '#f87171' : '#f1f5f9';

    const btnStyle = emergency
        ? { bg: 'rgba(30,30,40,0.6)', color: 'rgba(148,163,184,0.4)', border: 'rgba(71,85,105,0.25)', cursor: 'not-allowed', shadow: 'none' }
        : isInCorridor
            ? { bg: 'rgba(80,10,10,0.6)', color: '#f87171', border: 'rgba(239,68,68,0.25)', cursor: 'not-allowed', shadow: 'none' }
            : { bg: 'rgba(120,20,20,0.85)', color: '#fff', border: 'rgba(239,68,68,0.55)', cursor: 'pointer', shadow: '0 0 18px rgba(239,68,68,0.2)' };

    const stats = [
        { label: 'MODE', value: node.mode ?? '—', color: '#38bdf8' },
        { label: 'FLOW', value: `${node.count ?? Math.round((node.density ?? 0) * 80)} vph`, color: '#f1f5f9' },
        { label: 'PM2.5', value: `${node.pm25 ?? '—'} µg`, color: '#fbbf24' },
        { label: 'GREEN', value: `${node.green_seconds ?? 0}s`, color: '#00ff9d' },
    ];

    return (
        <div style={{ fontFamily: '"JetBrains Mono", monospace', overflow: 'hidden' }}>
            {/* Animated top accent bar */}
            <div style={{
                height: 2,
                background: isInCorridor
                    ? 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)'
                    : 'linear-gradient(90deg, transparent, #38bdf8, #00ff9d, #38bdf8, transparent)',
                backgroundSize: '200% 100%',
                animation: 'popupSlideGrad 2.5s linear infinite',
                boxShadow: `0 0 8px ${accentColor}80`,
            }} />

            <div style={{ padding: '10px 12px 12px' }}>

                {/* Name + ID */}
                <div style={{ marginBottom: 8, paddingRight: 16 }}>
                    <div style={{
                        fontSize: 12, fontWeight: 800, color: nameColor, letterSpacing: '0.03em',
                        marginBottom: 2, lineHeight: 1.3,
                        textShadow: isInCorridor ? '0 0 10px rgba(239,68,68,0.4)' : 'none',
                    }}>{node.name}</div>
                    <div style={{ fontSize: 8, color: 'rgba(71,85,105,0.7)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                        {node.id}
                    </div>
                </div>

                {/* 2×2 stat tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 8 }}>
                    {stats.map(s => (
                        <div key={s.label} style={{
                            padding: '5px 7px', borderRadius: 7,
                            background: 'rgba(255,255,255,0.025)',
                            border: '1px solid rgba(255,255,255,0.055)',
                        }}>
                            <div style={{ fontSize: 7, color: 'rgba(100,116,139,0.55)', letterSpacing: '0.12em', marginBottom: 2 }}>{s.label}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: '0.04em' }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Density bar */}
                <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 7, color: 'rgba(100,116,139,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Traffic Load</span>
                        <span style={{ fontSize: 7, fontWeight: 700, color: loadPct > 70 ? '#f87171' : loadPct > 40 ? '#fbbf24' : '#00ff9d' }}>
                            {loadPct}%
                        </span>
                    </div>
                    <div style={{ height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: 999, width: `${loadPct}%`,
                            background: loadPct > 70 ? 'linear-gradient(90deg, #f97316, #ef4444)'
                                : loadPct > 40 ? 'linear-gradient(90deg, #d97706, #fbbf24)'
                                    : 'linear-gradient(90deg, #059669, #00ff9d)',
                            boxShadow: `0 0 6px ${loadPct > 70 ? '#ef444460' : '#00ff9d60'}`,
                        }} />
                    </div>
                </div>

                {/* Trigger button */}
                <button
                    onClick={onTrigger}
                    disabled={!canTrigger}
                    style={{
                        width: '100%', padding: '8px 0', borderRadius: 8,
                        background: btnStyle.bg, color: btnStyle.color,
                        border: `1px solid ${btnStyle.border}`, cursor: btnStyle.cursor,
                        fontSize: 9, fontWeight: 900, fontFamily: '"JetBrains Mono", monospace',
                        letterSpacing: '0.2em', textTransform: 'uppercase',
                        boxShadow: btnStyle.shadow, transition: 'all 0.2s',
                        outline: 'none',
                    }}
                    onMouseEnter={e => { if (canTrigger) { e.target.style.background = 'rgba(153,27,27,0.95)'; e.target.style.boxShadow = '0 0 22px rgba(239,68,68,0.35)'; } }}
                    onMouseLeave={e => { if (canTrigger) { e.target.style.background = btnStyle.bg; e.target.style.boxShadow = btnStyle.shadow; } }}
                >
                    {isLoading ? '⏳ ACTIVATING...'
                        : isInCorridor ? '✅ CORRIDOR ACTIVE'
                            : emergency ? '🔒 CORRIDOR BUSY'
                                : '🚨 TRIGGER EMERGENCY'}
                </button>
            </div>
        </div>
    );
}

export default function Map({ intersections, emergency, onTrigger, activeCamId, onSelectCam }) {
    const [isLight, setIsLight] = React.useState(document.documentElement.classList.contains('light'));
    const [loadingId, setLoadingId] = React.useState(null);

    useEffect(() => { injectStyles(); }, []);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(document.documentElement.classList.contains('light'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const lightTiles = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    const getMarkerStyles = (node) => {
        const isActive = node.id === activeCamId;
        const stroke = isActive
            ? { color: '#38bdf8', weight: 3, opacity: 1 }
            : { color: 'rgba(255,255,255,0.12)', weight: 1, opacity: 0.7 };

        if (emergency?.corridor?.includes(node.id)) return { pathOptions: { ...stroke, fillColor: '#ef4444', fillOpacity: 0.9 }, radius: 16 };
        if (node.density > 0.7) return { pathOptions: { ...stroke, fillColor: '#f97316', fillOpacity: 0.85 }, radius: 13 };
        if (node.density > 0.4) return { pathOptions: { ...stroke, fillColor: '#fbbf24', fillOpacity: 0.80 }, radius: 11 };
        return { pathOptions: { ...stroke, fillColor: '#00ff9d', fillOpacity: 0.75 }, radius: 10 };
    };

    const corridorPositions = (emergency?.corridor || [])
        .map(id => { const n = (intersections || []).find(x => x.id === id); return (n?.lat && n?.lng) ? [n.lat, n.lng] : null; })
        .filter(Boolean);

    const handleEmergencyTrigger = async (node) => {
        if (loadingId || emergency) return;
        setLoadingId(node.id);
        try { await onTrigger(buildRouteKey(node.id)); }
        finally { setLoadingId(null); }
    };

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <MapContainer
                center={[28.6139, 77.2090]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    key={isLight ? 'light' : 'dark'}
                    url={isLight ? lightTiles : darkTiles}
                    attribution='&copy; <a href="https://carto.com">CARTO</a>'
                />

                {/* Corridor glow + dashed line */}
                {corridorPositions.length > 1 && (
                    <>
                        <Polyline positions={corridorPositions} pathOptions={{ color: '#ef4444', weight: 14, opacity: 0.12 }} />
                        <Polyline positions={corridorPositions} pathOptions={{ color: '#ef4444', weight: 2.5, dashArray: '10, 8', opacity: 0.95 }} />
                    </>
                )}

                {(intersections || []).map(node => {
                    if (!node.lat || !node.lng) return null;
                    const isInCorridor = emergency?.corridor?.includes(node.id);
                    const isActiveCamNode = node.id === activeCamId;
                    const { pathOptions, radius } = getMarkerStyles(node);

                    return (
                        <React.Fragment key={node.id}>
                            {/* AQI heatmap */}
                            <Circle
                                center={[node.lat, node.lng]}
                                radius={900}
                                pathOptions={{
                                    fillColor: node.pm25 > 250 ? '#7c3aed' : node.pm25 > 150 ? '#ef4444' : node.pm25 > 100 ? '#f59e0b' : '#22c55e',
                                    color: 'transparent', fillOpacity: 0.08,
                                }}
                            />

                            {/* Outer dashed ring for emergency nodes */}
                            {isInCorridor && (
                                <CircleMarker center={[node.lat, node.lng]} radius={radius + 9}
                                    pathOptions={{ color: '#ef4444', weight: 1.5, opacity: 0.35, fillColor: 'transparent', fillOpacity: 0, dashArray: '4,5' }} />
                            )}

                            {/* Blue ring for active camera */}
                            {isActiveCamNode && (
                                <CircleMarker center={[node.lat, node.lng]} radius={radius + 6}
                                    pathOptions={{ color: '#38bdf8', weight: 1.5, opacity: 0.45, fillColor: 'transparent', fillOpacity: 0 }} />
                            )}

                            {/* Main marker */}
                            <CircleMarker
                                center={[node.lat, node.lng]}
                                radius={radius}
                                pathOptions={pathOptions}
                                eventHandlers={{ click: () => onSelectCam?.(node.id) }}
                            >
                                <Popup
                                    className={`flowai-popup${isInCorridor ? ' emergency-popup' : ''}`}
                                    offset={[0, -radius - 2]}
                                    closeButton={true}
                                >
                                    <NodePopup
                                        node={node}
                                        isInCorridor={isInCorridor}
                                        loadingId={loadingId}
                                        emergency={emergency}
                                        onTrigger={() => handleEmergencyTrigger(node)}
                                    />
                                </Popup>
                            </CircleMarker>
                        </React.Fragment>
                    );
                })}
            </MapContainer>
        </div>
    );
}
