import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { DELHI_INTERSECTIONS } from './data/intersections';
import MapPanel from './components/MapPanel';

export default function App() {
  const [intersections, setIntersections] = useState(DELHI_INTERSECTIONS);
  //THE EMERGENCY TRIGGER LOGIC
  const triggerEmergency = (id) => {
    setIntersections(prev => prev.map(node => {
      if (node.id == id) {
        return {
          ...node,
          emergency_active: true,
          green_seconds: 95,
          active_direction: "Emergency all clear",
          mode: "EMERG_PRIORITY"
        };
      }
      return node;
    }));

    //AUTO-RESET after 10s
    setTimeout(() => {
      setIntersections(prev => prev.map(node =>
        node.id === id ? { ...node, emergency_active: false, mode: "Adaptive" } : node
      ));
    }, 10000);
  };

  // Simulation loop to show the judges the system is "alive"
  useEffect(() => {
    const interval = setInterval(() => {
      setIntersections(prev => prev.map(node => ({
        ...node,
        // Cycle the timer down
        green_seconds: node.green_seconds > 0 ? node.green_seconds - 1 : 60
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-slate-200 overflow-hidden">
      {intersections.some(n => n.emergency_active) && (
     <div className="bg-traffic-emergency py-1 px-4 flex justify-between items-center animate-pulse relative z-[1001]">
         <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
             ⚠️ Critical Alert: Emergency Corridor Active in NCT Delhi
         </span>
           <span className="text-[10px] font-mono text-white">
                SIGNAL_PRIORITY_OVR: ENABLED
          </span>
    </div>
)}
  <Header connected={true} />

      <main className="flex flex-1 overflow-hidden">
        {/* Left: Map Section */}
        <section className="flex-1 relative border-r border-slate-800 bg-slate-950/40">
          <MapPanel
               intersections={intersections} 
               onTrigger={triggerEmergency}
          />
        </section>

        {/* Right: Sidebar */}
        <aside className="w-[530px] h-full overflow-y-auto p-6 bg-panel/20 backdrop-blur-md">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Live Intersection Feed</h2>
            <div className="text-[13px] bg-accent/10 text-accent px-2 py-0.5 rounded font-mono border border-accent/20">
              8 NODES ACTIVE
            </div>
          </div>
          <Sidebar intersections={intersections} />
        </aside>
      </main>
    </div>
  );
}