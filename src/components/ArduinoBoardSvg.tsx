import React from 'react';
import { ArduinoPinId, ArduinoPinInfo } from '../types/simulator';
import { ARDUINO_PINS } from '../data/simulatorData';

interface ArduinoBoardSvgProps {
  selectedPinId: string | null;
  onSelectPin: (pin: ArduinoPinInfo) => void;
  onStartWireFromPin: (pinId: ArduinoPinId) => void;
  highlightedPins?: string[];
  isSimulating?: boolean;
}

export const ArduinoBoardSvg: React.FC<ArduinoBoardSvgProps> = ({
  selectedPinId,
  onSelectPin,
  onStartWireFromPin,
  highlightedPins = [],
  isSimulating = false,
}) => {
  return (
    <div className="relative select-none bg-slate-900 rounded-3xl p-3 border-2 border-cyan-500/40 shadow-xl overflow-hidden">
      {/* Board Top Branding Tag */}
      <div className="flex items-center justify-between px-2 pb-1 text-[11px] text-cyan-300 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-black text-white">ARDUINO UNO R3</span>
        </div>
        <span className="text-[10px] text-slate-400">ATmega328P • 16MHz</span>
      </div>

      <svg
        viewBox="170 20 320 320"
        className="w-full max-w-[520px] mx-auto h-auto drop-shadow-2xl"
      >
        <defs>
          {/* Arduino PCB Teal Texture */}
          <linearGradient id="arduinoPcb" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00646e" />
            <stop offset="50%" stopColor="#00838f" />
            <stop offset="100%" stopColor="#004d56" />
          </linearGradient>

          <linearGradient id="chipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <filter id="pinGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#38bdf8" />
          </filter>
        </defs>

        {/* Arduino Board PCB Outer Shape */}
        <path
          d="M 190 40 
             L 480 40 
             A 10 10 0 0 1 490 50 
             L 490 310 
             A 10 10 0 0 1 480 320 
             L 200 320 
             A 10 10 0 0 1 190 310 
             L 190 140 
             L 180 135 
             L 180 65 
             L 190 60 
             Z"
          fill="url(#arduinoPcb)"
          stroke="#00acc1"
          strokeWidth="2.5"
          rx="8"
        />

        {/* Silver Mounting Holes */}
        <circle cx="205" cy="80" r="5.5" fill="#334155" stroke="#94a3b8" strokeWidth="2.5" />
        <circle cx="470" cy="80" r="5.5" fill="#334155" stroke="#94a3b8" strokeWidth="2.5" />
        <circle cx="470" cy="290" r="5.5" fill="#334155" stroke="#94a3b8" strokeWidth="2.5" />
        <circle cx="215" cy="290" r="5.5" fill="#334155" stroke="#94a3b8" strokeWidth="2.5" />

        {/* USB Type-B Port (Metal Housing) */}
        <rect x="175" y="65" width="28" height="38" rx="2" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="180" y="73" width="18" height="22" rx="1" fill="#475569" />

        {/* DC Barrel Jack Power Input */}
        <rect x="175" y="240" width="30" height="35" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        <circle cx="190" cy="257.5" r="4.5" fill="#64748b" />

        {/* Main ATmega328P Dual In-Line Package (DIP-28 IC) */}
        <rect x="300" y="160" width="130" height="42" rx="4" fill="url(#chipGrad)" stroke="#334155" strokeWidth="1.5" />
        <text x="365" y="184" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">
          ATMEGA328P-PU
        </text>
        {/* DIP Pins legs */}
        {Array.from({ length: 14 }).map((_, i) => (
          <React.Fragment key={i}>
            <rect x={306 + i * 8.5} y="156" width="3.5" height="4" fill="#cbd5e1" />
            <rect x={306 + i * 8.5} y="202" width="3.5" height="4" fill="#cbd5e1" />
          </React.Fragment>
        ))}

        {/* 16MHz Crystal Oscillator */}
        <rect x="280" y="180" width="14" height="26" rx="6" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
        <text x="287" y="196" textAnchor="middle" fill="#334155" fontSize="5" fontWeight="bold">16.0</text>

        {/* Reset Button */}
        <rect x="210" y="100" width="12" height="12" rx="2" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
        <circle cx="216" cy="106" r="3" fill="#fca5a5" />

        {/* Onboard LEDs (ON & L = Pin 13) */}
        <circle cx="270" cy="120" r="3.5" fill={isSimulating ? '#22c55e' : '#15803d'} stroke="#86efac" />
        <text x="270" y="132" textAnchor="middle" fill="#86efac" fontSize="6" fontWeight="bold">ON</text>

        <circle cx="285" cy="120" r="3.5" fill={isSimulating ? '#eab308' : '#713f12'} stroke="#fef08a" />
        <text x="285" y="132" textAnchor="middle" fill="#fef08a" fontSize="6" fontWeight="bold">L (13)</text>

        {/* ======================================================== */}
        {/* DIGITAL & POWER PIN HEADERS (Female Headers Blocks) */}
        {/* ======================================================== */}
        {/* Top Header Plastic Bar */}
        <rect x="200" y="42" width="255" height="17" rx="2" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
        {/* Bottom Header Plastic Bar (Power & Analog) */}
        <rect x="230" y="302" width="220" height="17" rx="2" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />

        {/* Section Labels Printed on PCB */}
        <text x="440" y="37" textAnchor="end" fill="#ffffff" fontSize="7" fontWeight="bold">
          DIGITAL (PWM ~)
        </text>
        <text x="275" y="333" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">
          POWER
        </text>
        <text x="400" y="333" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">
          ANALOG IN
        </text>

        {/* Render Interactive Clickable Pins */}
        {ARDUINO_PINS.map((pin) => {
          const isSelected = selectedPinId === pin.id;
          const isHighlighted = highlightedPins.includes(pin.id);

          let pinColor = '#f8fafc'; // Default silver socket
          if (pin.type === 'power') pinColor = '#ef4444';
          if (pin.type === 'ground') pinColor = '#3b82f6';
          if (pin.type === 'analog') pinColor = '#10b981';
          if (pin.isPWM) pinColor = '#f59e0b';

          return (
            <g
              key={pin.id}
              className="cursor-pointer group"
              onClick={() => {
                onSelectPin(pin);
                onStartWireFromPin(pin.id);
              }}
            >
              {/* Interaction Hit Area Target */}
              <circle
                cx={pin.x}
                cy={pin.y}
                r="7.5"
                fill={isSelected ? '#38bdf8' : isHighlighted ? '#a855f7' : 'transparent'}
                fillOpacity={isSelected || isHighlighted ? 0.4 : 0}
                stroke={isSelected ? '#38bdf8' : isHighlighted ? '#c084fc' : 'none'}
                strokeWidth="1.5"
                className="group-hover:stroke-cyan-400 transition-all"
              />

              {/* Pin Female Socket Hole */}
              <rect
                x={pin.x - 3.5}
                y={pin.y - 3.5}
                width="7"
                height="7"
                rx="1"
                fill="#020617"
                stroke={isSelected ? '#38bdf8' : pinColor}
                strokeWidth={isSelected ? '1.8' : '1'}
                filter={isSelected ? 'url(#pinGlow)' : undefined}
              />
              <circle cx={pin.x} cy={pin.y} r="1.5" fill="#f8fafc" />

              {/* Pin Label on PCB */}
              <text
                x={pin.x}
                y={pin.y > 150 ? pin.y - 8 : pin.y + 14}
                textAnchor="middle"
                fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                fontSize="6"
                fontWeight={isSelected ? 'bold' : 'normal'}
                fontFamily="monospace"
                className="group-hover:fill-cyan-300 select-none"
              >
                {pin.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
