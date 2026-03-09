import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isLight) {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [isLight]);

  return (
    <button
      onClick={() => setIsLight(!isLight)}
      className="p-2 rounded-lg bg-panel border border-slate-800 hover:border-accent transition-all flex items-center justify-center shadow-lg"
      title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      {isLight ? (
        <Moon className="w-4 h-4 text-slate-900" />
      ) : (
        <Sun className="w-4 h-4 text-accent animate-pulse" />
      )}
    </button>
  );
}