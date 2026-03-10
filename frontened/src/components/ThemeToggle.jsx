import React, { useState, useEffect } from 'react';

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
  } catch (_) { }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [hovered, setHovered] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    try { localStorage.setItem('theme', theme); } catch (_) { }
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <button
      onClick={toggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        position: 'relative', width: 36, height: 36, borderRadius: 10,
        background: hovered
          ? isDark ? 'rgba(251,191,36,0.12)' : 'rgba(56,189,248,0.12)'
          : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered
          ? isDark ? 'rgba(251,191,36,0.35)' : 'rgba(56,189,248,0.35)'
          : 'rgba(255,255,255,0.1)'}`,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
        boxShadow: hovered
          ? isDark ? '0 0 16px rgba(251,191,36,0.2)' : '0 0 16px rgba(56,189,248,0.2)'
          : 'none',
        overflow: 'hidden',
      }}
    >
      {/* Animated icon using CSS — sun or moon SVG */}
      <div style={{
        position: 'relative', width: 16, height: 16,
        transform: hovered ? (isDark ? 'rotate(45deg)' : 'rotate(-12deg)') : 'rotate(0deg)',
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {isDark ? (
          // Sun icon
          <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" style={{ width: 16, height: 16, filter: hovered ? 'drop-shadow(0 0 6px #fbbf24)' : 'none', transition: 'filter 0.3s' }}>
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          // Moon icon
          <svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" style={{ width: 16, height: 16, filter: hovered ? 'drop-shadow(0 0 6px #38bdf8)' : 'none', transition: 'filter 0.3s' }}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </div>

      {/* Ripple on hover */}
      {hovered && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 10,
          background: `radial-gradient(circle at center, ${isDark ? 'rgba(251,191,36,0.08)' : 'rgba(56,189,248,0.08)'} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}
    </button>
  );
}