// -----------------------------------------------------------------------------
// Title:       CompanionPanel.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-27
// Last Modified: 2026-03-30
// Purpose:     Slide-up companion mode panel. Renders when activePanel is set
//              in useUIStore. Animates up from the bottom over 300ms. Supports
//              drag-handle-to-dismiss (drag > 80px triggers close) and
//              tap-outside-to-dismiss. Panel sits above the nav bar.
//              Content is a placeholder per panel type until Phase 2 trackers
//              are built.
// Inputs:      Reads activePanel, setActivePanel, setActiveNav from useUIStore.
//              No props.
// Outputs:     Fixed-position overlay (backdrop) + slide-up panel
// -----------------------------------------------------------------------------

import { useState, useRef, useEffect } from 'react';
import { useUIStore } from '../stores/useUIStore';
import WaterPanel from './WaterPanel';
import StepsPanel from './StepsPanel';

// ===== Placeholder content per panel type =====

function PanelContent({ type }) {
  const style = {
    fontFamily: "'Courier New', monospace",
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    padding: '32px 20px',
    lineHeight: 1.6,
  };
  const labels = {
    focus:     'pomodoro timer',
    tasks:     'to-do list',
    nutrition: 'nutrition tracker',
  };
  return (
    <div style={style}>
      <div style={{ fontSize: 24, marginBottom: 12, opacity: 0.3 }}>
        {type === 'focus' ? '⏱' : type === 'tasks' ? '✓' : '🌿'}
      </div>
      <div>{labels[type] || type}</div>
      <div style={{ marginTop: 6, fontSize: 11, opacity: 0.6 }}>coming soon</div>
    </div>
  );
}

// ===== Component =====

export default function CompanionPanel() {
  const { activePanel, setActivePanel, setActiveNav, navBarHeight } = useUIStore();

  // Drag-to-dismiss state
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [visible, setVisible] = useState(false);
  const startYRef = useRef(null);

  // Animate in on mount (next frame so CSS transition fires)
  useEffect(() => {
    if (activePanel) {
      requestAnimationFrame(() => setVisible(true));
    }
  }, [activePanel]);

  const dismiss = () => {
    setVisible(false);
    // Wait for slide-out before clearing store
    setTimeout(() => {
      setActivePanel(null);
      setActiveNav('home');
    }, 300);
  };

  // Drag handle pointer events
  const handleHandlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    startYRef.current = e.clientY;
    setIsDragging(true);
  };

  const handleHandlePointerMove = (e) => {
    if (!isDragging || startYRef.current === null) return;
    const dy = Math.max(0, e.clientY - startYRef.current);
    setDragY(dy);
  };

  const handleHandlePointerUp = () => {
    if (dragY > 80) {
      dismiss();
    } else {
      setDragY(0);
    }
    setIsDragging(false);
    startYRef.current = null;
  };

  if (!activePanel) return null;

  const panelBottom = `${navBarHeight}px`;

  return (
    <>
      {/* Backdrop - tap outside to dismiss */}
      <div
        onClick={dismiss}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: navBarHeight + 'px',
          zIndex: 39,
          // No background - creature stays visible, backdrop is transparent
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: panelBottom,
        height: '42vh',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(8,6,20,0.92)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px 20px 0 0',
        border: '1px solid rgba(255,255,255,0.1)',
        borderBottom: 'none',
        transform: visible ? `translateY(${dragY}px)` : 'translateY(100%)',
        transition: isDragging ? 'none' : 'transform 300ms ease-out',
        touchAction: 'none',
      }}>
        {/* Drag handle */}
        <div
          onPointerDown={handleHandlePointerDown}
          onPointerMove={handleHandlePointerMove}
          onPointerUp={handleHandlePointerUp}
          onPointerCancel={handleHandlePointerUp}
          style={{
            padding: '12px 0 8px',
            cursor: 'grab',
            flexShrink: 0,
            touchAction: 'none',
          }}
        >
          <div style={{
            width: 36,
            height: 4,
            background: 'rgba(255,255,255,0.18)',
            borderRadius: 2,
            margin: '0 auto',
          }} />
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {activePanel === 'water'  ? <WaterPanel /> :
           activePanel === 'steps'  ? <StepsPanel /> :
           <PanelContent type={activePanel} />}
        </div>
      </div>
    </>
  );
}
