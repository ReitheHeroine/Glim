// -----------------------------------------------------------------------------
// Title:       StepsSettings.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-04-13
// Last Modified: 2026-04-13
// Purpose:     Steps tracker settings section. Single daily goal input with
//              auto-derived tier preview bar (25%/50%/75%/100%, first three
//              rounded to nearest 100). Reads/writes useStepsStore.setGoal().
// Inputs:      useStepsStore (goal, setGoal)
// Outputs:     Accordion section content (rendered inside SettingsView)
// -----------------------------------------------------------------------------

import { useStepsStore, computeTiers } from '../../stores/useStepsStore';

const TEAL = '#5eead4';
const TEAL_DIM = 'rgba(94, 234, 212, 0.3)';

const inputBase = {
  width: 90, padding: '8px 10px',
  background: 'rgba(15,20,35,0.6)',
  border: '1px solid rgba(100,120,160,0.2)',
  borderRadius: 8, color: 'rgba(200,210,230,0.9)',
  fontSize: 16, fontWeight: 600, textAlign: 'center',
  outline: 'none', fontVariantNumeric: 'tabular-nums',
  transition: 'border-color 0.15s',
};

export function stepsSummary(store) {
  return `goal: ${store.goal.toLocaleString()}/day`;
}

export const stepsIcon = (
  <div style={{
    width: 32, height: 32, borderRadius: 8,
    background: TEAL_DIM,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }}>
    <svg viewBox="0 0 24 24" width={18} height={18} fill={TEAL} stroke="none" style={{ display: 'block' }}>
      <path d="M6,17 Q5.5,19.5 8.5,19.5 Q10.5,19.5 11.2,18.3 Q11.5,17.7 12,17 Q12.5,17.7 12.8,18.3 Q13.5,19.5 15.5,19.5 Q18.5,19.5 18,17 Q18,15 16.5,12.5 Q15,10 12,9.5 Q9,10 7.5,12.5 Q6,15 6,17Z" />
      <ellipse cx="6.0" cy="7.5" rx="2.2" ry="2.7" transform="rotate(22 6.0 7.5)" />
      <ellipse cx="18.0" cy="7.5" rx="2.2" ry="2.7" transform="rotate(-22 18.0 7.5)" />
      <ellipse cx="9.8" cy="4.5" rx="2.0" ry="2.6" transform="rotate(10 9.8 4.5)" />
      <ellipse cx="14.2" cy="4.5" rx="2.0" ry="2.6" transform="rotate(-10 14.2 4.5)" />
    </svg>
  </div>
);

export default function StepsSettings() {
  const { goal, setGoal } = useStepsStore();
  const tiers = computeTiers(goal);

  // Tier bar segment opacities: 25%, 40%, 60%, 85%
  const segmentOpacities = [0.25, 0.40, 0.60, 0.85];

  return (
    <div style={{ padding: '4px 16px 16px 16px', borderTop: '1px solid rgba(100,120,160,0.12)' }}>
      {/* Daily goal input */}
      <div style={{ marginTop: 10 }}>
        <div style={{
          fontSize: 12, color: 'rgba(200,210,230,0.5)', marginBottom: 6,
          fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          daily goal
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="number"
            value={goal}
            min={1000}
            max={50000}
            step={500}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (v >= 100 && v <= 50000) setGoal(v);
            }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(94,234,212,0.4)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(100,120,160,0.2)'; }}
            style={inputBase}
          />
          <span style={{ fontSize: 13, color: 'rgba(200,210,230,0.5)' }}>steps</span>
        </div>
      </div>

      {/* Tier preview */}
      <div style={{
        marginTop: 10, padding: '10px 12px',
        background: 'rgba(15,20,35,0.4)',
        borderRadius: 8, border: '1px solid rgba(100,120,160,0.12)',
      }}>
        <div style={{
          fontSize: 11, color: 'rgba(200,210,230,0.35)',
          textTransform: 'uppercase', letterSpacing: '0.5px',
          marginBottom: 8, fontWeight: 500,
        }}>
          auto-generated milestones
        </div>
        {/* Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 8, marginBottom: 6 }}>
          {segmentOpacities.map((opacity, i) => (
            <div key={i} style={{
              flex: 1, height: '100%', borderRadius: 2,
              background: `rgba(94, 234, 212, ${opacity})`,
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
        {/* Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {tiers.map((t, i) => (
            <span key={i} style={{
              fontSize: 10, color: 'rgba(200,210,230,0.35)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {t.toLocaleString()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
