import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';



//custom icon based on density/emergency
const createCustomIcon = (node) => {
    let colorClass = "bg-traffic-green";
    if (node.emergency_active) colorClass = "bg-traffic-red animate-pulse-fast shadow-[0_0_15px_#ef4444]";
    else if (node.density > 0.7) colorClass = "bg-traffic-red";
    else if (node.density > 0.4) colorClass = "bg-traffic-amber";

    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-4 h-4 rounded-full border-2 border-white/50 ${colorClass}"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
};
export default function MapPanel({ intersections, onTrigger }) {
    // Center of Delhi
    const center = [28.6139, 77.2090];

    return (
        <div className="h-full w-full relative group">
            <MapContainer
                center={center}
                zoom={12}
                scrollWheelZoom={true}
                className="h-full w-full z-10"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {intersections.map((node) => (
                    <React.Fragment key={node.id}>
                        {/* AQI HEATMAP LAYER */}
                        <Circle
                            center={[node.lat, node.lng]}
                            radius={1200} 
                            pathOptions={{
                                fillColor: node.pm25 > 250 ? '#7e22ce' : 
                                node.pm25 > 150 ? '#ef4444' :  '#f59e0b',                               
                                color: 'transparent',
                                fillOpacity: 0.15, 
                            }}
                        />
                        <Marker
                            position={[node.lat, node.lng]}
                            icon={createCustomIcon(node)}
                        >
                            <Popup className="custom-popup">
                                <div className="bg-panel p-1 rounded font-sans">
                                    <h4 className="font-bold text-accent">{node.name}</h4>
                                    <p className="text-xs text-slate-300">Phase: <span className="text-white font-mono">{node.active_direction}</span></p>
                                    <p className="text-xs text-slate-300">AQI: <span className="text-traffic-amber">{node.pm25}</span></p>

                                    <button
                                        onClick={() => onTrigger(node.id)}
                                        disabled={node.emergency_active}
                                        className={`w-full text-white text-[10px] font-black py-2 rounded uppercase tracking-widest transition-all mt-2 ${node.emergency_active
                                            ? 'bg-slate-700 cursor-not-allowed opacity-80'
                                            : 'bg-traffic-emergency hover:scale-105 active:scale-95 shadow-lg shadow-red-900/20'
                                            }`}
                                    >
                                        {node.emergency_active ? '✅ Route Cleared' : '🚨 Trigger Emergency'}
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    </React.Fragment>
                ))}
            </MapContainer>

            {/* Map Overlay Coordinates */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-panel/80 border border-slate-700 p-2 rounded text-[10px] font-mono text-slate-400 backdrop-blur-md">
                NCT_DELHI_GRID: ACTIVE
            </div>
        </div>
    );
}