import React from 'react';
import { CircuitWire, WireColor } from '../types/simulator';

interface CircuitWiringSvgProps {
  wires: CircuitWire[];
  pendingWireStart: { id: string; x: number; y: number } | null;
  cursorPos: { x: number; y: number } | null;
  selectedWireColor: WireColor;
  onRemoveWire: (wireId: string) => void;
  pointLookup: Map<string, { x: number; y: number }>;
}

export const CircuitWiringSvg: React.FC<CircuitWiringSvgProps> = ({
  wires,
  pendingWireStart,
  cursorPos,
  selectedWireColor,
  onRemoveWire,
  pointLookup,
}) => {
  const getWireStroke = (color: WireColor) => {
    switch (color) {
      case 'red': return '#ef4444';     // 5V / Power
      case 'black': return '#0f172a';   // Ground GND
      case 'yellow': return '#eab308';  // Signal
      case 'blue': return '#3b82f6';    // Control / PWM
      case 'green': return '#10b981';
      case 'orange': return '#f97316';
      case 'purple': return '#a855f7';
      case 'white': return '#f8fafc';
      default: return '#eab308';
    }
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
      <defs>
        {/* Shadow for wires to give 3D cable depth */}
        <filter id="wireShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Render Established Wires */}
      {wires.map((wire) => {
        const fromPt = pointLookup.get(wire.fromId);
        const toPt = pointLookup.get(wire.toId);
        if (!fromPt || !toPt) return null;

        // Bezier curve control point for realistic wire sag
        const dx = toPt.x - fromPt.x;
        const dy = toPt.y - fromPt.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const sag = Math.min(60, dist * 0.25);
        const midX = (fromPt.x + toPt.x) / 2;
        const midY = (fromPt.y + toPt.y) / 2 + sag;

        const pathD = `M ${fromPt.x} ${fromPt.y} Q ${midX} ${midY} ${toPt.x} ${toPt.y}`;
        const strokeColor = getWireStroke(wire.color);

        return (
          <g key={wire.id} className="pointer-events-auto cursor-pointer group">
            {/* Outer Glow / Clickable Hit Area */}
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="12"
              strokeOpacity="0"
              className="group-hover:stroke-opacity-20 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('هل تريد حذف هذا السلك؟')) {
                  onRemoveWire(wire.id);
                }
              }}
            />

            {/* Wire Shadow */}
            <path
              d={pathD}
              fill="none"
              stroke="#000000"
              strokeWidth="3.5"
              strokeOpacity="0.3"
              strokeLinecap="round"
              transform="translate(1, 3)"
            />

            {/* Main Colored Cable */}
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#wireShadow)"
            />

            {/* Core Cable Highlight */}
            <path
              d={pathD}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1"
              strokeOpacity="0.3"
              strokeLinecap="round"
            />

            {/* Connector Pin Heads at ends */}
            <circle cx={fromPt.x} cy={fromPt.y} r="3.5" fill="#334155" stroke={strokeColor} strokeWidth="1.5" />
            <circle cx={toPt.x} cy={toPt.y} r="3.5" fill="#334155" stroke={strokeColor} strokeWidth="1.5" />
          </g>
        );
      })}

      {/* Render Wire Being Currently Drawn (In-flight) */}
      {pendingWireStart && cursorPos && (
        <g>
          <line
            x1={pendingWireStart.x}
            y1={pendingWireStart.y}
            x2={cursorPos.x}
            y2={cursorPos.y}
            stroke={getWireStroke(selectedWireColor)}
            strokeWidth="3"
            strokeDasharray="4,4"
            strokeLinecap="round"
            className="animate-pulse"
          />
          <circle cx={pendingWireStart.x} cy={pendingWireStart.y} r="4" fill={getWireStroke(selectedWireColor)} />
          <circle cx={cursorPos.x} cy={cursorPos.y} r="3" fill="#ffffff" stroke={getWireStroke(selectedWireColor)} strokeWidth="2" />
        </g>
      )}
    </svg>
  );
};
