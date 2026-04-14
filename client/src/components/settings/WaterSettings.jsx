// -----------------------------------------------------------------------------
// Title:       WaterSettings.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-04-13
// Last Modified: 2026-04-13
// Purpose:     Water tracker settings section. Bottle size (oz) and daily goal
//              (bottles) with computed total oz display. Reads/writes
//              useWaterStore directly (setBottleOz, setGoal).
// Inputs:      useWaterStore (bottleOz, goal, setBottleOz, setGoal)
// Outputs:     Accordion section content (rendered inside SettingsView)
// -----------------------------------------------------------------------------

import { useWaterStore } from '../../stores/useWaterStore';

const BLUE = '#60a5fa';
const BLUE_DIM = 'rgba(96, 165, 250, 0.3)';

const inputBase = {
  width: 72, padding: '8px 10px',
  background: 'rgba(15,20,35,0.6)',
  border: '1px solid rgba(100,120,160,0.2)',
  borderRadius: 8, color: 'rgba(200,210,230,0.9)',
  fontSize: 'var(--text-lg)', fontWeight: 600, textAlign: 'center',
  outline: 'none', fontVariantNumeric: 'tabular-nums',
  transition: 'border-color 0.15s',
};

export function waterSummary(store) {
  return `${store.goal} bottles/day, ${store.bottleOz} oz each`;
}

export const waterIcon = (
  <div style={{
    width: 32, height: 32, borderRadius: 8,
    background: BLUE_DIM,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }}>
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none"
      stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3C12 3 6 10 6 14C6 17.3 8.7 20 12 20C15.3 20 18 17.3 18 14C18 10 12 3 12 3Z" />
    </svg>
  </div>
);

export default function WaterSettings() {
  const { bottleOz, goal, setBottleOz, setGoal } = useWaterStore();
  const totalOz = bottleOz * goal;

  return (
    <div style={{ padding: '4px 16px 16px 16px', borderTop: '1px solid rgba(100,120,160,0.12)' }}>
      {/* Bottle size */}
      <div style={{ marginTop: 10 }}>
        <div style={{
          fontSize: 'var(--text-sm)', color: 'rgba(200,210,230,0.5)', marginBottom: 6,
          fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          bottle size
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="number"
            value={bottleOz}
            min={1}
            max={128}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (v > 0 && v <= 128) setBottleOz(v);
            }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(96,165,250,0.4)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(100,120,160,0.2)'; }}
            style={inputBase}
          />
          <span style={{ fontSize: 'var(--text-base)', color: 'rgba(200,210,230,0.5)' }}>oz</span>
        </div>
      </div>

      {/* Daily goal */}
      <div style={{ marginTop: 14 }}>
        <div style={{
          fontSize: 'var(--text-sm)', color: 'rgba(200,210,230,0.5)', marginBottom: 6,
          fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          daily goal
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="number"
            value={goal}
            min={1}
            max={30}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (v > 0 && v <= 30) setGoal(v);
            }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(96,165,250,0.4)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(100,120,160,0.2)'; }}
            style={inputBase}
          />
          <span style={{ fontSize: 'var(--text-base)', color: 'rgba(200,210,230,0.5)' }}>bottles</span>
          <span style={{ fontSize: 'var(--text-base)', color: 'rgba(200,210,230,0.35)' }}>
            ({totalOz} oz)
          </span>
        </div>
      </div>
    </div>
  );
}
