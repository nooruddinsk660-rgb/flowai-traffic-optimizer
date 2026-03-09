import React from 'react';
import Map from './Map'; // Import the logic-heavy Map component

export default function MapSection({ intersections, emergency }) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      
      {/* THE ACTUAL LEAFLET MAP */}
      <Map intersections={intersections} emergency={emergency} />

      {/* TOP RIGHT (System Coordinates) */}
      <div className="absolute top-6 right-6 z-[1000] pointer-events-none">
        <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-2xl">
          <div className="flex flex-col gap-1 text-[9px] font-mono text-slate-400 tracking-widest uppercase">
            <div className="flex justify-between gap-4">
              <span>Sector:</span>
              <span className="text-sky-400 font-bold">DEL_SEC_01</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Nodes:</span>
              <span className="text-sky-400 font-bold">{intersections.length} Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM LEFT (Live Legend) */}
      <div className="absolute bottom-6 left-6 z-[1000] pointer-events-none">
        <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 p-4 rounded-lg">
          <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Signal_Legend</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span className="text-[9px] text-slate-400 font-mono">OPTIMAL_FLOW</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
              <span className="text-[9px] text-slate-400 font-mono">CONGESTED</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_#dc2626]" />
              <span className="text-[9px] text-red-500 font-mono font-bold">EMERGENCY_PRIORITY</span>
            </div>
          </div>
        </div>
      </div>

      {/*  VIGNETTE EFFECT */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.6)]" />
    </div>
  );
}