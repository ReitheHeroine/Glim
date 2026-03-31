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
  // Paw print: path-based palm pad with two bottom lobes + 4 toe beans
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" stroke="none" style={{ display: 'block' }}>
      <path d="M6,17 Q5.5,19.5 8.5,19.5 Q10.5,19.5 11.2,18.3 Q11.5,17.7 12,17 Q12.5,17.7 12.8,18.3 Q13.5,19.5 15.5,19.5 Q18.5,19.5 18,17 Q18,15 16.5,12.5 Q15,10 12,9.5 Q9,10 7.5,12.5 Q6,15 6,17Z" />
      <ellipse cx="6.0" cy="7.5" rx="2.2" ry="2.7" transform="rotate(22 6.0 7.5)" />
      <ellipse cx="18.0" cy="7.5" rx="2.2" ry="2.7" transform="rotate(-22 18.0 7.5)" />
      <ellipse cx="9.8" cy="4.5" rx="2.0" ry="2.6" transform="rotate(10 9.8 4.5)" />
      <ellipse cx="14.2" cy="4.5" rx="2.0" ry="2.6" transform="rotate(-10 14.2 4.5)" />
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

const NAV_ITEMS_DESKTOP = [
  { id: 'home',  label: 'home',  Icon: HomeIcon,  panel: null    },
  { id: 'water', label: 'water', Icon: WaterIcon, panel: 'water' },
  { id: 'steps', label: 'steps', Icon: StepsIcon, panel: 'steps' },
  { id: 'tasks', label: 'tasks', Icon: TasksIcon, panel: 'tasks' },
  { id: 'focus', label: 'focus', Icon: FocusIcon, panel: 'focus' },
  { id: 'more',  label: 'more',  Icon: MoreIcon,  panel: null    },
];

const NAV_ITEMS_MOBILE = [
  { id: 'home',  label: 'home',  Icon: HomeIcon,  panel: null    },
  { id: 'water', label: 'water', Icon: WaterIcon, panel: 'water' },
  { id: 'steps', label: 'steps', Icon: StepsIcon, panel: 'steps' },
  { id: 'tasks', label: 'tasks', Icon: TasksIcon, panel: 'tasks' },
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

  const navItems = isMobile ? NAV_ITEMS_MOBILE : NAV_ITEMS_DESKTOP;

  // Sizing verified via DevTools on Rei's 1365x934 screen (desktop)
  const iconSize  = isMobile ? 29 : 28;
  const labelSize = isMobile ? 14 : 15;
  const padding   = isMobile
    ? 'calc(3px + env(safe-area-inset-bottom, 0px))'
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
      background: 'hsl(220, 15%, 8%)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
    }}>
      {navItems.map((item) => {
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
              padding: isMobile ? '3px 13px' : '6px 12px',
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
