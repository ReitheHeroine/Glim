// -----------------------------------------------------------------------------
// Title:       RemindersSettings.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-04-13
// Last Modified: 2026-04-13
// Purpose:     Reminder interval settings section for the focus-mode settings
//              view. Three sliders (wellness, move, eyes) with amber accent.
//              Reads/writes useSettingsStore directly.
// Inputs:      useSettingsStore (intervals + setters)
// Outputs:     Accordion section content (rendered inside SettingsView)
// -----------------------------------------------------------------------------

import { useSettingsStore } from '../../stores/useSettingsStore';

const AMBER = '#fbbf24';
const AMBER_DIM = 'rgba(251, 191, 36, 0.3)';

const sliderThumbStyle = `
  input[type="range"].amber-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px; height: 18px; border-radius: 50%;
    background: ${AMBER}; border: none; cursor: pointer;
  }
  input[type="range"].amber-slider::-moz-range-thumb {
    width: 18px; height: 18px; border-radius: 50%;
    background: ${AMBER}; border: none; cursor: pointer;
  }
`;

function Slider({ label, value, min, max, onChange }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{
        fontSize: 12, color: 'rgba(200,210,230,0.5)', marginBottom: 6,
        fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="range"
          className="amber-slider"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onClick={(e) => e.stopPropagation()}
          style={{
            WebkitAppearance: 'none', appearance: 'none',
            flex: 1, height: 4, borderRadius: 2,
            background: 'rgba(100,120,160,0.2)', outline: 'none',
          }}
        />
        <span style={{
          fontSize: 14, fontWeight: 600, minWidth: 42, textAlign: 'right',
          fontVariantNumeric: 'tabular-nums', color: AMBER,
        }}>
          {value} min
        </span>
      </div>
    </div>
  );
}

export function remindersSummary(store) {
  return `wellness ${store.wellnessInterval}m, move ${store.moveInterval}m, eyes ${store.eyesInterval}m`;
}

export const remindersIcon = (
  <div style={{
    width: 32, height: 32, borderRadius: 8,
    background: AMBER_DIM,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, flexShrink: 0,
  }}>
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  </div>
);

export default function RemindersSettings() {
  const {
    wellnessInterval, moveInterval, eyesInterval,
    setWellnessInterval, setMoveInterval, setEyesInterval,
  } = useSettingsStore();

  return (
    <div style={{ padding: '4px 16px 16px 16px', borderTop: '1px solid rgba(100,120,160,0.12)' }}>
      <style>{sliderThumbStyle}</style>
      <Slider label="wellness check-in" value={wellnessInterval} min={10} max={60} onChange={setWellnessInterval} />
      <Slider label="move reminder" value={moveInterval} min={15} max={90} onChange={setMoveInterval} />
      <Slider label="eye break" value={eyesInterval} min={10} max={60} onChange={setEyesInterval} />
    </div>
  );
}
