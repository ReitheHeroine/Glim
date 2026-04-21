// -----------------------------------------------------------------------------
// Title:       FocusShell.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-04-20
// Last Modified: 2026-04-20
// Purpose:     Reusable container for every focus-mode feature. Renders a two-row
//              header (back arrow + title + mini-Glim, with a bubble zone
//              underneath) and a scrollable content area below. The content area
//              routes by the current `feature` prop, so adding a new focus
//              feature only requires a new content component and a branch in
//              the switch below.
// Inputs:      feature (string) - the current focus feature name; used both as
//              the header title and to route content.
// Outputs:     Full-bleed focus-mode container (consumed by DesktopPet.jsx
//              inside the mode-based render switch).
// -----------------------------------------------------------------------------

import { useCreatureStore } from '../stores/useCreatureStore';
import { useMessageStore } from '../stores/useMessageStore';
import { useUIStore } from '../stores/useUIStore';
import MiniGlim from './MiniGlim';
import SettingsView from './SettingsView';

// ---- Feature -> content routing ----
// Each focus feature renders its content-only component. Adding a new feature
// means: build the content component, add a branch here, and call
// openFocusMode('feature name') from wherever it is triggered.
function FeatureContent({ feature }) {
  switch (feature) {
    case 'settings':
      return <SettingsView />;
    // case 'food library': return <NutritionLibraryManager />;
    // case 'todos':        return <TodosView />;
    // case 'pomodoro':     return <PomodoroView />;
    default:
      return null;
  }
}

export default function FocusShell({ feature }) {
  const closeFocusMode = useUIStore((s) => s.closeFocusMode);

  // Creature state - mini-Glim shares the palette with the full creature.
  const { hue, sat, pupilOffset, isBlinking, antennaPerk, specialAnim } =
    useCreatureStore();
  const isSleeping = specialAnim === 'sleep';

  // Speech bubble shares its source with the full companion-mode bubble.
  const { message, showBubble } = useMessageStore();

  return (
    <div style={{
      position:       'absolute',
      inset:          0,
      display:        'flex',
      flexDirection:  'column',
      background:     '#0f1028',
      fontFamily:     "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* ===== Header ===== */}
      <div style={{
        background:    'rgba(15, 16, 40, 0.95)',
        borderBottom:  '1px solid rgba(200,210,230,0.06)',
        flexShrink:    0,
      }}>
        {/* Row 1: back / title / mini-Glim */}
        <div style={{
          display:      'flex',
          alignItems:   'center',
          padding:      'calc(env(safe-area-inset-top, 0px) + 8px) 16px 0',
          height:       96,
          boxSizing:    'border-box',
          gap:          12,
        }}>
          <button
            onClick={() => closeFocusMode()}
            aria-label="back"
            style={{
              width:           44,
              height:          44,
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              padding:         0,
              border:          'none',
              borderRadius:    '50%',
              background:      'transparent',
              color:           'rgba(200,210,230,0.6)',
              cursor:          'pointer',
              fontFamily:      'inherit',
              flexShrink:      0,
            }}
            onPointerDown={(e) => {
              e.currentTarget.style.background = 'rgba(200,210,230,0.18)';
            }}
            onPointerUp={(e) => {
              e.currentTarget.style.background = 'rgba(200,210,230,0.06)';
            }}
            onPointerLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            onPointerEnter={(e) => {
              e.currentTarget.style.background = 'rgba(200,210,230,0.06)';
            }}
          >
            {/* Chevron */}
            <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor"
                strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <span style={{
            flex:           1,
            textAlign:      'center',
            fontSize:       16,
            fontFamily:     "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
            textTransform:  'lowercase',
            letterSpacing:  '0.06em',
            color:          'rgba(200,210,230,0.8)',
          }}>
            {feature || ''}
          </span>

          {/* Mini-Glim (44x44 tap area, 48px SVG overflows - antennae tips
              extend beyond the face disc, which is expected) */}
          <div style={{
            width:           44,
            height:          44,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            flexShrink:      0,
            overflow:        'visible',
          }}>
            <MiniGlim
              hue={hue}
              sat={sat}
              pupilOffset={pupilOffset}
              isBlinking={isBlinking}
              isSleeping={isSleeping}
              antennaPerk={antennaPerk}
              size={48}
            />
          </div>
        </div>

        {/* Row 2: bubble zone (fixed-height slot; bubble is right-aligned so
            it sits under mini-Glim) */}
        <div style={{
          position:  'relative',
          height:    32,
          padding:   '0 16px',
        }}>
          {showBubble && message && (
            <div style={{
              position:        'absolute',
              right:           16,
              top:             2,
              maxWidth:        160,
              padding:         '5px 10px',
              borderRadius:    10,
              background:      'rgba(30, 40, 65, 0.9)',
              backdropFilter:  'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border:          '1px solid rgba(100, 120, 160, 0.25)',
              fontSize:        11,
              color:           'rgba(200, 210, 230, 0.8)',
              whiteSpace:      'nowrap',
              overflow:        'hidden',
              textOverflow:    'ellipsis',
            }}>
              {/* Upward-pointing tail (rotated square) */}
              <div style={{
                position:     'absolute',
                top:          -5,
                right:        16,
                width:        8,
                height:       8,
                background:   'rgba(30, 40, 65, 0.9)',
                borderTop:    '1px solid rgba(100, 120, 160, 0.25)',
                borderLeft:   '1px solid rgba(100, 120, 160, 0.25)',
                transform:    'rotate(45deg)',
              }} />
              {message}
            </div>
          )}
        </div>
      </div>

      {/* ===== Content area ===== */}
      <div style={{
        flex:           1,
        overflowY:      'auto',
        overflowX:      'hidden',
        padding:        '12px 16px 16px',
        background:     '#0f1028',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(200,210,230,0.15) transparent',
      }}>
        {/* Key on feature so React remounts content when switchFocusFeature()
            swaps features - gives a clean content-level state reset. */}
        <FeatureContent key={feature} feature={feature} />
      </div>
    </div>
  );
}
