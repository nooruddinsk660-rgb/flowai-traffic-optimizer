import React from 'react';
import { Wifi, WifiOff, Activity, Zap } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header({ status = 'offline', connected, nodeCount = 8, avgAqi = 0 }) {
  // Support both 'connected' boolean (from App.jsx:82) and 'status' string (from App.jsx:86)
  const isOnline = connected !== undefined ? connected : (status === 'online');

  return (
    <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between bg-panel backdrop-blur-xl z-[1002] transition-colors duration-300">
      {/* Left Side: Brand & Logo */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="bg-sky-500/10 p-2 rounded-lg border border-sky-500/20">
          <Activity className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <h1 className="text-sm font-black tracking-[0.3em] uppercase flex items-center gap-2 text-main">
            FlowAI <span className="text-slate-500 font-light">traffic_optimizer</span>
          </h1>
          <p className="text-[9px] text-muted font-mono tracking-tighter opacity-60">GRID_CORE_V1.0.4</p>
        </div>
      </div>

      {/* Middle: Live Data Feed */}
      <div className="hidden md:flex items-center gap-12 bg-white/[0.02] px-8 py-2 rounded-full border border-main">
        <div className="flex flex-col items-center">
          <span className="text-[9px] uppercase text-muted font-bold tracking-[0.2em] mb-0.5">Efficiency</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-xs">
            <Zap className="w-3 h-3 fill-emerald-400/20" /> 34.2%
          </div>
        </div>

        <div className="w-px h-6 bg-white/5" />

        <div className="flex flex-col items-center">
          <span className="text-[9px] uppercase text-muted font-bold tracking-[0.2em] mb-0.5">Avg. PM2.5</span>
          <span className="text-amber-500 font-mono font-bold text-xs">{avgAqi} <span className="text-[9px] opacity-70">µg/m³</span></span>
        </div>

        <div className="w-px h-6 bg-white/5" />

        <div className="flex flex-col items-center">
          <span className="text-[9px] uppercase text-muted font-bold tracking-[0.2em] mb-0.5">Active Nodes</span>
          <span className="text-sky-400 font-mono font-bold text-xs">{nodeCount} <span className="text-[9px] opacity-70">SYST</span></span>
        </div>
      </div>

      {/* Right: Controls & Network */}
      <div className="flex items-center gap-6 min-w-[200px] justify-end">
        <ThemeToggle />

        <div className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full border transition-all duration-500 ${isOnline
            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.05)]'
            : 'bg-red-500/5 border-red-500/20 text-red-500 animate-pulse'
          }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`} />
          <span className="text-[9px] font-black uppercase tracking-[0.1em]">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  );
}