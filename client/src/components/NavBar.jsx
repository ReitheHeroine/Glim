// -----------------------------------------------------------------------------
// Title:       NavBar.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-27
// Last Modified: 2026-03-30
// Purpose:     Persistent bottom navigation bar. Six slots: home (mountains +
//              stars), focus (clock), tasks (double checkmarks), water (teardrop),
//              steps (paw print), more (three dots). Home returns to companion
//              mode and closes any open panel. All icons use currentColor so
//              active/inactive is a single color change on the parent.
//              Desktop sizing (icons 28px, labels 15px) verified via DevTools.
//              Mobile sizing (icons 18px, labels 7px) unchanged.
// Inputs:      Reads activeNav, activePanel, setActiveNav, setActivePanel
//              from useUIStore. No props.
// Outputs:     Fixed bottom nav bar
// -----------------------------------------------------------------------------

import { useState, useEffect } from 'react';
import { useUIStore } from '../stores/useUIStore';

// ===== Icon components (accept size prop) =====

function HomeIcon({ size }) {
  return (
    <svg viewBox="0 0 22 22" width={size} height={size} style={{ display: 'block' }}>
      <path d="M3 17 L7 9 L10 13 L14 6 L19 17"
        fill="none" stroke="currentColor" strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 17 h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="6" cy="5" r="0.8" fill="currentColor" />
      <circle cx="10" cy="4" r="0.8" fill="currentColor" />
      <circle cx="17" cy="5" r="0.8" fill="currentColor" />
    </svg>
  );
}

function FocusIcon({ size }) {
  return (
    <svg viewBox="0 0 22 22" width={size} height={size} style={{ display: 'block' }}>
      <circle cx="11" cy="11" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M11 6v5l3 2.5" stroke="currentColor" strokeWidth="1.3"
        strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function TasksIcon({ size }) {
  return (
    <svg viewBox="0 0 22 22" width={size} height={size} style={{ display: 'block' }}>
      <path d="M6 8 L9 11 L16 4" fill="none" stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 14 L9 17 L16 10" fill="none" stroke="currentColor" strokeWidth="1.3"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WaterIcon({ size }) {
  return (
    <svg viewBox="0 0 22 22" width={size} height={size} style={{ display: 'block' }}>
      <path d="M11 3 C9 6.5 5 11.5 5 15 A6 6 0 0 0 17 15 C17 11.5 13 6.5 11 3Z"
        fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function StepsIcon({ size }) {
  // Paw print: main pad + 4 toe pads
  return (
    <svg viewBox="0 0 22 22" width={size} height={size} style={{ display: 'block' }}>
      <ellipse cx="11" cy="14.5" rx="4.5" ry="3.5" fill="currentColor" />
      <ellipse cx="5.5" cy="9.5" rx="1.8" ry="2.2" fill="currentColor"
        transform="rotate(-20 5.5 9.5)" />
      <ellipse cx="9" cy="7.5" rx="1.8" ry="2.2" fill="currentColor" />
      <ellipse cx="13" cy="7.5" rx="1.8" ry="2.2" fill="currentColor" />
      <ellipse cx="16.5" cy="9.5" rx="1.8" ry="2.2" fill="currentColor"
        transform="rotate(20 16.5 9.5)" />
    </svg>
  );
}

function MoreIcon({ size }) {
  return (
    <svg viewBox="0 0 22 22" width={size} height={size} style={{ display: 'block' }}>
      <circle cx="5" cy="11" r="1.8" fill="currentColor" />
      <circle cx="11" cy="11" r="1.8" fill="currentColor" />
      <circle cx="17" cy="11" r="1.8" fill="currentColor" />
    </svg>
  );
}

// ===== Nav items config =====

const NAV_ITEMS = [
  { id: 'home',  label: 'home',  Icon: HomeIcon,  panel: null    },
  { id: 'focus', label: 'focus', Icon: FocusIcon, panel: 'focus' },
  { id: 'tasks', label: 'tasks', Icon: TasksIcon, panel: 'tasks' },
  { id: 'water', label: 'water', Icon: WaterIcon, panel: 'water' },
  { id: 'steps', label: 'steps', Icon: StepsIcon, panel: 'steps' },
  { id: 'more',  label: 'more',  Icon: MoreIcon,  panel: null    },
];

// ===== Component =====

export default function NavBar() {
  const { activeNav, setActiveNav, setActivePanel } = useUIStore();

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 600);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Sizing verified via DevTools on Rei's 1365x934 screen (desktop)
  const iconSize  = isMobile ? 18 : 28;
  const labelSize = isMobile ? 7  : 15;
  const padding   = isMobile
    ? 'calc(8px + env(safe-area-inset-bottom, 0px))'
    : 'calc(10px + env(safe-area-inset-bottom, 0px))';

  const handleTap = (item) => {
    if (item.id === 'home') {
      setActiveNav('home');
      setActivePanel(null);
    } else if (item.id === 'more') {
      // More menu not yet implemented
      setActiveNav('more');
    } else {
      setActiveNav(item.id);
      setActivePanel(item.panel);
    }
  };

  return (
    <div style={{
      position: 'relative',
      zIndex: 20,
      flexShrink: 0,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: `5px 12px ${padding}`,
      background: 'rgba(255,255,255,0.06)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
    }}>
      {NAV_ITEMS.map((item) => {
        const isActive = activeNav === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleTap(item)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '6px 12px',
              minHeight: 44,
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? 'rgba(200,210,230,0.85)' : 'rgba(200,210,230,0.35)',
              transition: 'color 0.2s ease',
            }}
          >
            <item.Icon size={iconSize} />
            <span style={{
              fontFamily: "'Courier New', monospace",
              fontSize: labelSize,
              letterSpacing: '0.5px',
            }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
