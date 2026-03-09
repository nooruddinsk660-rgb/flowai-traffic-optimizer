import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({ intersections, emergency }) {
    const [isLight, setIsLight] = useState(document.documentElement.classList.contains('light'));

    // Listen for theme changes to update the map tiles
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(document.documentElement.classList.contains('light'));
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    // Theme-based Tile URLs
    const lightTiles = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    const darkTiles = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    // Dynamic scaling and colors based on Person 2's Backend Data
    const getMarkerStyles = (node) => {
        // If the node is part of an active emergency corridor
        if (emergency?.corridor?.includes(node.id)) {
            return {
                pathOptions: { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.6 },
                radius: 48
            };
        }
        // Standard traffic density styling
        if (node.density > 0.7) return { pathOptions: { color: '#ef4444' }, radius: 40 };
        if (node.density > 0.4) return { pathOptions: { color: '#f59e0b' }, radius: 36 };
        return { pathOptions: { color: '#22c55e' }, radius: 32 };
    };

    return (
        <>
            <div className="h-full w-full transition-opacity duration-500">
                <MapContainer
                    center={[28.6139, 77.2090]}
                    zoom={12}
                    className="h-full w-full bg-background"
                    zoomControl={false}
                >
                    <TileLayer
                        key={isLight ? 'light-map' : 'dark-map'}
                        url={isLight ? lightTiles : darkTiles}
                        attribution='&copy; CARTO'
                    />

                    {/* The Emergency Corridor Polyline */}
                    {emergency?.corridor && (
                        <Polyline
                            positions={emergency.corridor.map(id => {
                                const node = (intersections || []).find(n => n.id === id);
                                return node ? [node.lat, node.lng] : null;
                            }).filter(pos => pos !== null)}
                            pathOptions={{
                                color: '#ef4444',
                                weight: 6,
                                dashArray: '10, 15',
                                className: 'animate-pulse'
                            }}
                        />
                    )}

                    {(intersections || []).map(node => (
                        <CircleMarker
                            key={node.id}
                            center={[node.lat, node.lng]}
                            {...getMarkerStyles(node)}
                        >
                            <Popup className="custom-popup">
                                <div className="font-bold text-slate-900">{node.name}</div>
                                <div className="text-xs text-slate-600">Mode: {node.mode}</div>
                                <div className="text-xs text-slate-600 font-mono">Flow: {node.count} vph</div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>
        </>
    );
}
