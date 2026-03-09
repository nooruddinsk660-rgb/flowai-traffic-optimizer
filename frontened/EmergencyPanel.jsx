import React from 'react';
import { ShieldAlert, Volume2, Eye, X } from 'lucide-react';

export default function EmergencyPanel({ emergency, onReset }) {
  // If no emergency is active, the roadmap says to show nothing or a "System Stable" state
  if (!emergency) return null;

  return (
    <div className="mb-6 p-4 bg-red-600 rounded-xl flex justify-between items-center shadow-[0_0_40px_rgba(220,38,38,0.4)] animate-pulse border border-white/20">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-lg">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Priority Corridor</p>
            
            {/* Roadmap Requirement: Source Identification */}
            <div className="flex gap-1 bg-black/20 px-1.5 py-0.5 rounded border border-white/10">
              {(emergency.source === 'audio' || emergency.source === 'dual') && (
                <Volume2 className="w-3 h-3 text-white" title="Audio Detection" />
              )}
              {(emergency.source === 'visual' || emergency.source === 'dual') && (
                <Eye className="w-3 h-3 text-white" title="Visual Detection" />
              )}
            </div>
          </div>
          <p className="text-[11px] font-bold text-white/90 leading-tight truncate w-48">
            {emergency.route || "Emergency Vehicle Detected"}
          </p>
        </div>
      </div>

      <button 
        onClick={onReset} 
        className="bg-white text-red-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors shadow-lg"
        title="Clear Corridor"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}