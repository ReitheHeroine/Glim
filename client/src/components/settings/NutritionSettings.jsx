// -----------------------------------------------------------------------------
// Title:       NutritionSettings.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-04-13
// Last Modified: 2026-04-13
// Purpose:     Nutrition goal settings section. Four nutrients (protein, fiber,
//              fruit, veggie), each with min and ideal fields. Two-tier system
//              drives the three bar states in the nutrition companion panel.
//              Reads/writes useNutritionStore.setGoal() directly.
// Inputs:      useNutritionStore (goals, setGoal)
// Outputs:     Accordion section content (rendered inside SettingsView)
// -----------------------------------------------------------------------------

import { useNutritionStore } from '../../stores/useNutritionStore';

const GREEN = '#4ade80';
const GREEN_DIM = 'rgba(74, 222, 128, 0.3)';

const tierInputBase = {
  width: 54, padding: '6px 6px',
  background: 'rgba(15,20,35,0.6)',
  border: '1px solid rgba(100,120,160,0.2)',
  borderRadius: 6, color: 'rgba(200,210,230,0.9)',
  fontSize: 16, fontWeight: 600, textAlign: 'center',
  outline: 'none', fontVariantNumeric: 'tabular-nums',
  transition: 'border-color 0.15s',
};

const NUTRIENTS = [
  { key: 'protein', label: 'protein', unit: 'g',   max: 500 },
  { key: 'fiber',   label: 'fiber',   unit: 'g',   max: 100 },
  { key: 'fruit',   label: 'fruit',   unit: 'srv', max: 20  },
  { key: 'veggie',  label: 'veggie',  unit: 'srv', max: 20  },
];

export function nutritionSummary(store) {
  const g = store.goals;
  return `protein ${g.protein.min}-${g.protein.ideal}g, fiber ${g.fiber.min}-${g.fiber.ideal}g, fruit ${g.fruit.min}-${g.fruit.ideal}, veg ${g.veggie.min}-${g.veggie.ideal}`;
}

export const nutritionIcon = (
  <div style={{
    width: 32, height: 32, borderRadius: 8,
    background: GREEN_DIM,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }}>
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none"
      stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 9C5.5 10.5 4.5 13 5 15.5c.3 2 1.5 3.5 3 4.5 1 .6 2 .8 2.8.5.5-.2.8-.6 1.2-1 .4.4.7.8 1.2 1 .8.3 1.8.1 2.8-.5 1.5-1 2.7-2.5 3-4.5.5-2.5-.5-5-2.5-6.5C14.5 8 13.2 7.5 12 7.5S9.5 8 7.5 9z" />
      <ellipse cx="14" cy="5" rx="2.2" ry="1.2" transform="rotate(-45 14 5)" />
    </svg>
  </div>
);

function NutrientRow({ nutrient, goals, setGoal }) {
  const { key, label, unit, max } = nutrient;
  const { min, ideal } = goals[key];

  const handleMin = (e) => {
    const v = parseInt(e.target.value);
    if (!isNaN(v) && v >= 0 && v <= max) setGoal(key, v, ideal);
  };

  const handleIdeal = (e) => {
    const v = parseInt(e.target.value);
    if (!isNaN(v) && v >= 0 && v <= max) setGoal(key, min, v);
  };

  const focusStyle = (e) => { e.target.style.borderColor = 'rgba(74,222,128,0.4)'; };
  const blurStyle = (e) => { e.target.style.borderColor = 'rgba(100,120,160,0.2)'; };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}
      onClick={(e) => e.stopPropagation()}>
      <div style={{
        width: 56, fontSize: 13, color: 'rgba(200,210,230,0.5)',
        fontWeight: 500, flexShrink: 0,
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
        <span style={{
          fontSize: 10, color: 'rgba(200,210,230,0.35)',
          textTransform: 'uppercase', letterSpacing: '0.4px',
          width: 28, textAlign: 'right', flexShrink: 0,
        }}>min</span>
        <input
          type="number"
          value={min}
          min={0}
          max={max}
          onChange={handleMin}
          onFocus={focusStyle}
          onBlur={blurStyle}
          style={tierInputBase}
        />
        <span style={{ color: 'rgba(200,210,230,0.35)', fontSize: 11, flexShrink: 0 }}>-</span>
        <span style={{
          fontSize: 10, color: 'rgba(200,210,230,0.35)',
          textTransform: 'uppercase', letterSpacing: '0.4px',
          width: 28, textAlign: 'right', flexShrink: 0,
        }}>ideal</span>
        <input
          type="number"
          value={ideal}
          min={0}
          max={max}
          onChange={handleIdeal}
          onFocus={focusStyle}
          onBlur={blurStyle}
          style={tierInputBase}
        />
        <span style={{ fontSize: 11, color: 'rgba(200,210,230,0.35)', flexShrink: 0 }}>
          {unit}
        </span>
      </div>
    </div>
  );
}

export default function NutritionSettings() {
  const { goals, setGoal } = useNutritionStore();

  return (
    <div style={{ padding: '4px 16px 16px 16px', borderTop: '1px solid rgba(100,120,160,0.12)' }}>
      {/* Column headers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, marginBottom: 4 }}>
        <div style={{ width: 56, flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          <span style={{
            fontSize: 10, color: 'rgba(200,210,230,0.35)',
            textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600,
            marginLeft: 30, width: 54, textAlign: 'center',
          }}>min</span>
          <span style={{
            fontSize: 10, color: 'rgba(200,210,230,0.35)',
            textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600,
            marginLeft: 22, width: 54, textAlign: 'center',
          }}>ideal</span>
        </div>
      </div>

      {NUTRIENTS.map((n) => (
        <NutrientRow key={n.key} nutrient={n} goals={goals} setGoal={setGoal} />
      ))}
    </div>
  );
}
