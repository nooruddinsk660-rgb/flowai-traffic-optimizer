import React from 'react';
import EmergencyPanel from './EmergencyPanel';
import ForecastChart from './ForecastChart';
import { Timer, Radio, Activity } from 'lucide-react';

export default function Sidebar({ intersections, emergency, onReset }) {
  return (
    <div className="flex flex-col h-full px-4 py-6 overflow-hidden">
      
      {/* 1. EMERGENCY PROTOCOL (Modular Component) */}
      <EmergencyPanel emergency={emergency} onReset={onReset} />

      {/* 2. HEADER SECTION */}
      <div className="mb-6 flex justify-between items-end px-1">
        <div>
          <h2 className="text-[11px] font-black uppercase text-sky-400 tracking-[0.3em] flex items-center gap-2">
            <Radio className="w-3 h-3 animate-pulse" />
            Live_Grid_Monitor
          </h2>
          <p className="text-[9px] text-slate-500 font-mono mt-1">NCT_DELHI // SECTOR_01</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono text-slate-400">{intersections.length}_NODES</span>
          <div className="flex items-center gap-1">
             <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
             <span className="text-[8px] text-emerald-500/80 font-bold uppercase tracking-tighter">Sync_Active</span>
          </div>
        </div>
      </div>

      {/* 3. INTERSECTION LIST */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
        {intersections.map((node) => {
          const isEmergency = emergency?.corridor?.includes(node.id);
          
          return (
            <div 
              key={node.id} 
              className={`group p-4 rounded-xl border transition-all duration-500 
                ${isEmergency 
                  ? 'border-red-500 bg-red-950/10 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                  : 'bg-slate-900/40 border-slate-800 hover:border-sky-500/50 hover:bg-slate-900/60'
                }`}
            >
              {/* Info Row */}
              <div className="flex justify-between items-start mb-1">
                <div className="max-w-[160px]">
                  <h3 className={`font-bold text-xs truncate transition-colors ${isEmergency ? 'text-red-400' : 'text-slate-100 group-hover:text-sky-400'}`}>
                    {node.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest">{node.active_direction}</span>
                    <span className="text-[8px] text-amber-500 font-mono">+{node.aqi_penalty}s Impact</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-sky-400 font-mono font-bold text-xs">
                    <Timer className="w-3 h-3" />
                    {node.green_seconds}s
                  </div>
                  <span className={`text-[9px] font-black ${node.density > 0.7 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {(node.density * 100).toFixed(0)}% LOAD
                  </span>
                </div>
              </div>

              {/* 4. FORECAST CHART (Modular Component) */}
              <ForecastChart data={node.forecast} isEmergency={isEmergency} />
            </div>
          );
        })}
      </div>

      {/* 5. LIVE VISION FEED (Bottom Module) */}
      <div className="mt-6 pt-4 border-t border-slate-800/50 pb-2">
        <div className="aspect-video bg-black rounded-xl border border-slate-800 relative overflow-hidden group">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
               <Activity className="w-5 h-5 text-slate-800 animate-pulse mb-2" />
               <span className="text-[9px] font-mono text-slate-700 tracking-[0.3em] uppercase">
                 Vision_Stream_Standby
               </span>
          </div>

          <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
            <span className="text-[9px] font-black text-white/40 tracking-widest uppercase">Live_Feed_01</span>
          </div>
          <div className="absolute bottom-3 right-3 z-20">
            <span className="text-[8px] font-mono text-white/20 uppercase tracking-tighter">REC ● 00:00:00</span>
            </div>
        </div>
      </div>
    </div>
  );
}