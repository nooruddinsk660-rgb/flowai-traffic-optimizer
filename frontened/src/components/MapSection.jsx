import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapSection({ intersections }) {
    // Center map on Delhi
    const delhiCenter = [28.6139, 77.2090];

    return (
        <MapContainer
            center={delhiCenter}
            zoom={11}
            className="w-full h-full absolute inset-0 z-0 bg-background"
            zoomControl={false}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {intersections.map((node) => {
                // Determine color based on node state
                let markerColor = '#22c55e'; 
                if (node.emergency_active) {
                    markerColor = '#dc2626'; 
                } else if (node.density > 0.7) {
                    markerColor = '#ef4444'; 
                } else if (node.density > 0.4) {
                    markerColor = '#f59e0b'; 
                }

                return (
                    <CircleMarker
                        key={node.id}
                        center={[node.lat, node.lng]}
                        radius={node.density > 0.7 ? 12 : 8}
                        pathOptions={{
                            color: markerColor,
                            fillColor: markerColor,
                            fillOpacity: 0.6,
                            weight: 2
                        }}
                    >
                        <Popup className="black-popup">
                            <div className="font-sans">
                                <strong className="block text-slate-800 text-sm mb-1">{node.name}</strong>
                                <div className="text-xs text-slate-600 mb-0.5">ID: {node.id}</div>
                                <div className="text-xs text-slate-600 mb-0.5">PM2.5: {node.pm25} µg/m³</div>
                                <div className="text-xs text-slate-600 mb-0.5">Density: {(node.density * 100).toFixed(0)}%</div>
                                <div className="text-xs font-bold text-slate-800 mt-2">
                                    Timer: {node.green_seconds}s ({node.active_direction})
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                );
            })}
        </MapContainer>
    );
}
