import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Timer, Activity } from 'lucide-react';

export default function Sidebar({ intersections }) {
  return (
    <div className="flex flex-col h-full px-2">
      {/* HEADER STATS */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-[12px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" />
          NCT_Delhi_Grid
        </h2>
        <span className="text-[13px] font-mono text-traffic-green bg-traffic-green/10 px-2 py-0.5 rounded border border-traffic-green/20">
          8_ACTIVE
        </span>
      </div>

      {/* 1. INTERSECTION LIST (With Merged Forecast Charts) */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
        {intersections.map((node) => (
          <div 
            key={node.id} 
            className={`p-3 rounded-xl border transition-all duration-500 ${
              node.emergency_active 
              ? 'bg-traffic-red/10 border-traffic-red animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
              : 'bg-panel border-slate-800 hover:border-accent hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:-translate-y-0.5'
            }`}
          >
            {/* Name and Load Row */}
            <div className="flex justify-between items-start mb-2">
              <div className="max-w-[180px]">
                <h3 className="font-bold text-slate-100 text-sm truncate">{node.name}</h3>
                <p className="text-[9px] text-slate-500 font-mono">ID: {node.id}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-accent font-mono font-bold text-sm">
                  <Timer className="w-3 h-3" />
                  {node.green_seconds}s
                </div>
              </div>
            </div>

            {/* MERGED The Area Chart */}
            <div className="h-10 w-full mt-2 opacity-70">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={node.forecast?.map(f => ({ val: f })) || [{val: 0.3}, {val: 0.6}, {val: 0.4}, {val: 0.8}, {val: 0.5}]}>
                  <Area 
                    type="monotone" 
                    dataKey="val" 
                    stroke={node.emergency_active ? "#ef4444" : "#38bdf8"} 
                    fill={node.emergency_active ? "#ef444433" : "#38bdf811"} 
                    strokeWidth={1.5}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* MERGED  Live AI Vision Feed */}
      <div className="mt-6 border-t border-slate-800 pt-4">
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Live Vision Feed</p>
        <div className="aspect-video bg-black rounded-xl border border-slate-800 relative overflow-hidden group">
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
             <div className="flex flex-col items-center gap-2">
               <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
               <span className="text-[8px] font-mono text-slate-500 animate-pulse uppercase tracking-widest">
                 Syncing Camera...
               </span>
             </div>
          </div>
          <div className="absolute top-2 left-2 bg-red-600 text-[8px] px-1.5 py-0.5 rounded font-bold animate-pulse text-white">
            LIVE
          </div>
        </div>
      </div>
    </div>
  );
}