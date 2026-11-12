import React from 'react';
import { BreadboardHole, PlacedComponent } from '../types/simulator';

interface BreadboardSvgProps {
  selectedHoleId: string | null;
  onSelectHole: (hole: BreadboardHole) => void;
  onStartWireFromHole: (holeId: string) => void;
  highlightedHoles?: string[];
  components: PlacedComponent[];
  onSelectComponent?: (comp: PlacedComponent) => void;
}

export const BreadboardSvg: React.FC<BreadboardSvgProps> = ({
  selectedHoleId,
  onSelectHole,
  onStartWireFromHole,
  highlightedHoles = [],
  components = [],
  onSelectComponent,
}) => {
  const COLS = 30;
  const startX = 60;
  const colSpacing = 19;

  // Generate Breadboard Holes list
  const holes: BreadboardHole[] = [];

  // Top Power Rails
  for (let col = 1; col <= COLS; col++) {
    const cx = startX + (col - 1) * colSpacing;
    holes.push({
      id: `top_power_${col}`,
      section: 'top_rail',
      col,
      rail: 'top_power',
      nodeId: 'top_power_rail',
      x: cx,
      y: 35,
    });
    holes.push({
      id: `top_ground_${col}`,
      section: 'top_rail',
      col,
      rail: 'top_ground',
      nodeId: 'top_ground_rail',
      x: cx,
      y: 52,
    });
  }

  // Top Rows A-E
  const topRows: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
  topRows.forEach((rowLetter, rIdx) => {
    for (let col = 1; col <= COLS; col++) {
      const cx = startX + (col - 1) * colSpacing;
      const cy = 85 + rIdx * 16;
      holes.push({
        id: `${rowLetter}_${col}`,
        section: 'top_rows',
        row: rowLetter,
        col,
        nodeId: `col_${col}_top`,
        x: cx,
        y: cy,
      });
    }
  });

  // Bottom Rows F-J
  const bottomRows: ('F' | 'G' | 'H' | 'I' | 'J')[] = ['F', 'G', 'H', 'I', 'J'];
  bottomRows.forEach((rowLetter, rIdx) => {
    for (let col = 1; col <= COLS; col++) {
      const cx = startX + (col - 1) * colSpacing;
      const cy = 180 + rIdx * 16;
      holes.push({
        id: `${rowLetter}_${col}`,
        section: 'bottom_rows',
        row: rowLetter,
        col,
        nodeId: `col_${col}_bottom`,
        x: cx,
        y: cy,
      });
    }
  });

  // Bottom Power Rails
  for (let col = 1; col <= COLS; col++) {
    const cx = startX + (col - 1) * colSpacing;
    holes.push({
      id: `bottom_power_${col}`,
      section: 'bottom_rail',
      col,
      rail: 'bottom_power',
      nodeId: 'bottom_power_rail',
      x: cx,
      y: 275,
    });
    holes.push({
      id: `bottom_ground_${col}`,
      section: 'bottom_rail',
      col,
      rail: 'bottom_ground',
      nodeId: 'bottom_ground_rail',
      x: cx,
      y: 292,
    });
  }

  // Quick lookup of holes by ID
  const holeLookup = new Map<string, BreadboardHole>();
  holes.forEach((h) => holeLookup.set(h.id, h));

  return (
    <div className="relative select-none bg-slate-900 rounded-3xl p-3 border-2 border-emerald-500/40 shadow-xl overflow-hidden">
      {/* Breadboard Header */}
      <div className="flex items-center justify-between px-2 pb-1 text-[11px] text-emerald-300 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-black text-white">HALF-SIZE SOLDERLESS BREADBOARD</span>
        </div>
        <span className="text-[10px] text-slate-400">400 Tie Points • Dual Power Rails</span>
      </div>

      <svg
        viewBox="20 15 630 300"
        className="w-full max-w-[700px] mx-auto h-auto drop-shadow-2xl"
      >
        <defs>
          <linearGradient id="bbWhite" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          <filter id="holeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#10b981" />
          </filter>
        </defs>

        {/* Plastic Breadboard Body */}
        <rect
          x="30"
          y="20"
          width="610"
          height="285"
          rx="12"
          fill="url(#bbWhite)"
          stroke="#cbd5e1"
          strokeWidth="3"
        />

        {/* Central Divider Ravine */}
        <rect x="35" y="157" width="600" height="15" fill="#cbd5e1" />
        <line x1="35" y1="164.5" x2="635" y2="164.5" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />

        {/* Top Power Rails Strip Markings */}
        {/* Red Line (+) */}
        <line x1="50" y1="28" x2="620" y2="28" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <text x="40" y="38" fill="#ef4444" fontSize="13" fontWeight="bold" fontFamily="sans-serif">+</text>
        <text x="625" y="38" fill="#ef4444" fontSize="13" fontWeight="bold" fontFamily="sans-serif">+</text>

        {/* Blue Line (-) */}
        <line x1="50" y1="60" x2="620" y2="60" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        <text x="40" y="55" fill="#3b82f6" fontSize="15" fontWeight="bold" fontFamily="sans-serif">-</text>
        <text x="625" y="55" fill="#3b82f6" fontSize="15" fontWeight="bold" fontFamily="sans-serif">-</text>

        {/* Bottom Power Rails Strip Markings */}
        {/* Red Line (+) */}
        <line x1="50" y1="268" x2="620" y2="268" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <text x="40" y="278" fill="#ef4444" fontSize="13" fontWeight="bold" fontFamily="sans-serif">+</text>
        <text x="625" y="278" fill="#ef4444" fontSize="13" fontWeight="bold" fontFamily="sans-serif">+</text>

        {/* Blue Line (-) */}
        <line x1="50" y1="300" x2="620" y2="300" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        <text x="40" y="295" fill="#3b82f6" fontSize="15" fontWeight="bold" fontFamily="sans-serif">-</text>
        <text x="625" y="295" fill="#3b82f6" fontSize="15" fontWeight="bold" fontFamily="sans-serif">-</text>

        {/* Column Numbers Printed on Breadboard (1, 5, 10, 15, 20, 25, 30) */}
        {Array.from({ length: COLS }).map((_, idx) => {
          const colNum = idx + 1;
          const cx = startX + idx * colSpacing;
          if (colNum % 5 === 0 || colNum === 1) {
            return (
              <React.Fragment key={`col_lbl_${colNum}`}>
                <text x={cx} y="74" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold">
                  {colNum}
                </text>
                <text x={cx} y="260" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold">
                  {colNum}
                </text>
              </React.Fragment>
            );
          }
          return null;
        })}

        {/* Row Letters (A, B, C, D, E & F, G, H, I, J) */}
        {topRows.map((r, i) => (
          <React.Fragment key={`row_top_${r}`}>
            <text x="48" y={89 + i * 16} textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">
              {r}
            </text>
            <text x="622" y={89 + i * 16} textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">
              {r}
            </text>
          </React.Fragment>
        ))}
        {bottomRows.map((r, i) => (
          <React.Fragment key={`row_bot_${r}`}>
            <text x="48" y={184 + i * 16} textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">
              {r}
            </text>
            <text x="622" y={184 + i * 16} textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">
              {r}
            </text>
          </React.Fragment>
        ))}

        {/* Render Breadboard Holes */}
        {holes.map((hole) => {
          const isSelected = selectedHoleId === hole.id;
          const isHighlighted = highlightedHoles.includes(hole.id);

          return (
            <g
              key={hole.id}
              className="cursor-pointer group"
              onClick={() => {
                onSelectHole(hole);
                onStartWireFromHole(hole.id);
              }}
            >
              {/* Interaction Target */}
              <circle
                cx={hole.x}
                cy={hole.y}
                r="6.5"
                fill={isSelected ? '#10b981' : isHighlighted ? '#a855f7' : 'transparent'}
                fillOpacity={isSelected || isHighlighted ? 0.4 : 0}
                className="group-hover:fill-emerald-400/30 transition-all"
              />

              {/* Square Hole Socket */}
              <rect
                x={hole.x - 3.2}
                y={hole.y - 3.2}
                width="6.4"
                height="6.4"
                rx="1"
                fill={isSelected ? '#059669' : '#1e293b'}
                stroke={isSelected ? '#10b981' : '#64748b'}
                strokeWidth={isSelected ? '1.5' : '0.8'}
                filter={isSelected ? 'url(#holeGlow)' : undefined}
              />
              <circle cx={hole.x} cy={hole.y} r="1.2" fill="#0f172a" />
            </g>
          );
        })}

        {/* Render Placed Components onto Breadboard */}
        {components.map((comp) => {
          // Find hole coordinates of first pin
          const pin1HoleId = comp.pins[0]?.assignedHoleId;
          const pin2HoleId = comp.pins[1]?.assignedHoleId;
          const hole1 = pin1HoleId ? holeLookup.get(pin1HoleId) : null;
          const hole2 = pin2HoleId ? holeLookup.get(pin2HoleId) : null;

          if (!hole1) return null;

          return (
            <g
              key={comp.id}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectComponent) onSelectComponent(comp);
              }}
            >
              {/* LED Component */}
              {comp.type === 'led' && (
                <g>
                  {/* Lead Wire 1 (Anode) */}
                  <line
                    x1={hole1.x}
                    y1={hole1.y}
                    x2={hole1.x}
                    y2={hole1.y - 12}
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Lead Wire 2 (Cathode) */}
                  {hole2 && (
                    <line
                      x1={hole2.x}
                      y1={hole2.y}
                      x2={hole1.x + 8}
                      y2={hole1.y - 12}
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  )}
                  {/* LED Bulb Glow if Lit */}
                  {comp.state?.isLit && (
                    <circle
                      cx={hole1.x + 4}
                      cy={hole1.y - 18}
                      r="16"
                      fill={comp.state?.color || '#ef4444'}
                      fillOpacity="0.4"
                      className="animate-pulse"
                    />
                  )}
                  {/* LED Glass Dome */}
                  <circle
                    cx={hole1.x + 4}
                    cy={hole1.y - 18}
                    r="8.5"
                    fill={comp.state?.isLit ? (comp.state?.color || '#ef4444') : '#991b1b'}
                    stroke="#fee2e2"
                    strokeWidth="1.5"
                  />
                  <path
                    d={`M ${hole1.x - 1} ${hole1.y - 14} L ${hole1.x + 9} ${hole1.y - 14}`}
                    stroke="#b91c1c"
                    strokeWidth="1.5"
                  />
                </g>
              )}

              {/* Resistor Component */}
              {comp.type === 'resistor' && hole2 && (
                <g>
                  {/* Lead Wires */}
                  <line
                    x1={hole1.x}
                    y1={hole1.y}
                    x2={(hole1.x + hole2.x) / 2 - 10}
                    y2={(hole1.y + hole2.y) / 2}
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1={(hole1.x + hole2.x) / 2 + 10}
                    y1={(hole1.y + hole2.y) / 2}
                    x2={hole2.x}
                    y2={hole2.y}
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Resistor Ceramic Body */}
                  <rect
                    x={(hole1.x + hole2.x) / 2 - 12}
                    y={(hole1.y + hole2.y) / 2 - 5}
                    width="24"
                    height="10"
                    rx="3"
                    fill="#d97706"
                    stroke="#92400e"
                    strokeWidth="1"
                  />
                  {/* Color Bands (Red, Red, Brown for 220Ω) */}
                  <rect x={(hole1.x + hole2.x) / 2 - 8} y={(hole1.y + hole2.y) / 2 - 5} width="2" height="10" fill="#dc2626" />
                  <rect x={(hole1.x + hole2.x) / 2 - 4} y={(hole1.y + hole2.y) / 2 - 5} width="2" height="10" fill="#dc2626" />
                  <rect x={(hole1.x + hole2.x) / 2} y={(hole1.y + hole2.y) / 2 - 5} width="2" height="10" fill="#78350f" />
                  <rect x={(hole1.x + hole2.x) / 2 + 5} y={(hole1.y + hole2.y) / 2 - 5} width="2" height="10" fill="#facc15" />
                </g>
              )}

              {/* Push Button */}
              {comp.type === 'push_button' && (
                <g>
                  <rect
                    x={hole1.x - 7}
                    y={hole1.y - 7}
                    width="14"
                    height="14"
                    rx="3"
                    fill="#1e293b"
                    stroke="#64748b"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={hole1.x}
                    cy={hole1.y}
                    r={comp.state?.isPressed ? 3.5 : 4.5}
                    fill={comp.state?.isPressed ? '#10b981' : '#334155'}
                  />
                </g>
              )}

              {/* Buzzer */}
              {comp.type === 'buzzer' && (
                <g>
                  <circle cx={hole1.x} cy={hole1.y - 10} r="14" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                  <circle cx={hole1.x} cy={hole1.y - 10} r="4" fill="#334155" />
                  <text x={hole1.x} y={hole1.y - 9} textAnchor="middle" fill="#38bdf8" fontSize="6" fontWeight="bold">
                    +
                  </text>
                  {comp.state?.buzzerFrequency && comp.state.buzzerFrequency > 0 ? (
                    <circle cx={hole1.x} cy={hole1.y - 10} r="18" fill="none" stroke="#eab308" strokeWidth="1.5" className="animate-ping" />
                  ) : null}
                </g>
              )}

              {/* Potentiometer */}
              {comp.type === 'potentiometer' && (
                <g>
                  <circle cx={hole1.x + 10} cy={hole1.y - 10} r="14" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
                  <circle cx={hole1.x + 10} cy={hole1.y - 10} r="7" fill="#0f172a" />
                  <line
                    x1={hole1.x + 10}
                    y1={hole1.y - 10}
                    x2={hole1.x + 10 + Math.cos(((comp.state?.potValue || 512) / 1023) * 4) * 6}
                    y2={hole1.y - 10 + Math.sin(((comp.state?.potValue || 512) / 1023) * 4) * 6}
                    stroke="#f8fafc"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>
              )}

              {/* Servo Motor */}
              {comp.type === 'servo_motor' && (
                <g>
                  <rect x={hole1.x} y={hole1.y - 25} width="40" height="25" rx="3" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" />
                  <circle cx={hole1.x + 28} cy={hole1.y - 12} r="6" fill="#f8fafc" stroke="#64748b" />
                  {/* Servo Horn Arm */}
                  <line
                    x1={hole1.x + 28}
                    y1={hole1.y - 12}
                    x2={hole1.x + 28 + Math.cos(((comp.state?.angle || 90) * Math.PI) / 180) * 16}
                    y2={hole1.y - 12 - Math.sin(((comp.state?.angle || 90) * Math.PI) / 180) * 16}
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </g>
              )}

              {/* Ultrasonic HC-SR04 */}
              {comp.type === 'ultrasonic' && (
                <g>
                  <rect x={hole1.x} y={hole1.y - 35} width="55" height="28" rx="4" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
                  <circle cx={hole1.x + 14} cy={hole1.y - 21} r="9" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1.5" />
                  <circle cx={hole1.x + 40} cy={hole1.y - 21} r="9" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1.5" />
                  <text x={hole1.x + 27} y={hole1.y - 9} textAnchor="middle" fill="#ffffff" fontSize="5" fontWeight="bold">
                    HC-SR04 {comp.state?.distanceCm || 24}cm
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
