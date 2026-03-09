import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { initialIntersections } from './data/mockdata';
import MapSection from './components/MapSection';
import { WS_INTERSECTION_UPDATE } from './constants';

export default function App() {
  const [intersections, setIntersections] = useState(initialIntersections);
  const [emergency, setEmergency] = useState(null);
  const [wsStatus, setWsStatus] = useState('connecting');

  const handleReset = () => {
    setEmergency(null);
    setIntersections(prev => prev.map(node => ({ ...node, emergency_active: false, mode: "Adaptive" })));
  };

  useEffect(() => {
    let ws;
    let reconnectTimeout;
    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) return;
      ws = new WebSocket('ws://localhost:8000/ws');

      ws.onopen = () => {
        if (!isUnmounted) setWsStatus('online');
      };

      ws.onmessage = (e) => {
        if (isUnmounted) return;
        const data = JSON.parse(e.data);
        if (data.type === WS_INTERSECTION_UPDATE || !data.type) {
          setIntersections(data?.intersections ?? []);
          setEmergency(data?.emergency ?? null);
        }
      };

      ws.onclose = () => {
        if (isUnmounted) return;
        setWsStatus('offline');
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);


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

  useEffect(() => {
    const handler = async (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        try {
          await fetch(`http://localhost:8000/emergency/cancel`, { method: 'POST' });
          console.log('🔄 Demo reset via Ctrl+Shift+R');
        } catch (err) {
          console.error('Reset failed:', err);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-main overflow-hidden font-outfit transition-colors duration-300">
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

      <Header
        status={wsStatus}
        nodeCount={intersections.length}
        avgAqi={Math.round(intersections.reduce((acc, n) => acc + n.pm25, 0) / intersections.length) || 0}
      />

      <div className="flex-1 overflow-hidden">
        <main className="grid grid-cols-[62fr_38fr] h-full">
          {/* Left: Map Section */}
          <section className="relative h-full">
            <MapSection
              intersections={intersections}
              emergency={emergency}
              onTrigger={triggerEmergency}
            />
          </section>

          {/* Right: Sidebar */}
          <aside className="bg-panel backdrop-blur-md border-l border-main h-full overflow-hidden">
            <Sidebar intersections={intersections} emergency={emergency} onReset={handleReset} />
          </aside>
        </main>
      </div>
    </div>
  );
}