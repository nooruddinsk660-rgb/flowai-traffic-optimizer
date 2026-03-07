import React from 'react';
import { Activity } from 'lucide-react'; // Elegant icons
import ThemeToggle from './ThemeToggle';

export default function Header({ connected }) {
  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-panel shadow-2xl">
      {/* Left Side: Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-accent/20 rounded-lg border border-accent/30">
          <Activity className="text-accent w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-white">
            FlowAI <span className="text-slate-500 font-light text-sm uppercase tracking-widest ml-2">Command</span> 
          </h1>
        </div>
      </div>

      {/* Right Side*/}
      <div className="flex gap-6 items-center">
        {/* Metric 1: Efficiency */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Efficiency Gain</span>
          <p className="text-sm text-traffic-green font-mono font-bold">↑ 34.2%</p>
        </div>
        <ThemeToggle />

        {/* Metric 2: AQI Index */}
        <div className="hidden md:flex flex-col items-end border-l border-slate-800 pl-10">
          <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Avg. PM2.5</span>
          <p className="text-sm text-traffic-amber font-mono font-bold">142 µg/m³</p>
        </div>

        {/* System Status Indicator */}
        <div className="flex items-center gap-3 bg-background/50 px-4 py-1.5 rounded-full border border-slate-800">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'} animate-pulse`} />
          <span className="text-[11px] font-mono text-slate-300">
            {connected ? 'SYSTEM_STABLE' : 'CONNECTION_LOST'}
          </span>
        </div>
      </div>
    </header>
  );
}