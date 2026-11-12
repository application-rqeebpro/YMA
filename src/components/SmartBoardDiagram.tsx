import React, { useState } from 'react';
import { Zap, Play, RotateCcw, Sliders } from 'lucide-react';

interface SmartBoardDiagramProps {
  type: 'circuit' | 'vectors' | 'robot_arm' | 'sensor_sonar' | 'chart' | 'free_body';
  isInteractive?: boolean;
}

export const SmartBoardDiagram: React.FC<SmartBoardDiagramProps> = ({
  type,
  isInteractive = true,
}) => {
  // Interactive parameters
  // Circuit:
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(4);
  const current = (voltage / resistance).toFixed(2);
  const power = (voltage * (voltage / resistance)).toFixed(1);

  // Vectors:
  const [vectorMag, setVectorMag] = useState(10);
  const [vectorAngle, setVectorAngle] = useState(30);
  const rad = (vectorAngle * Math.PI) / 180;
  const rx = (vectorMag * Math.cos(rad)).toFixed(2);
  const ry = (vectorMag * Math.sin(rad)).toFixed(2);

  // Robot Arm:
  const [theta1, setTheta1] = useState(35);
  const [theta2, setTheta2] = useState(45);
  const l1 = 60;
  const l2 = 50;
  const rad1 = (theta1 * Math.PI) / 180;
  const rad2 = ((theta1 + theta2) * Math.PI) / 180;
  const jointX = 140 + l1 * Math.cos(rad1);
  const jointY = 160 - l1 * Math.sin(rad1);
  const endX = jointX + l2 * Math.cos(rad2);
  const endY = jointY - l2 * Math.sin(rad2);

  // Ultrasonic Sensor:
  const [targetDist, setTargetDist] = useState(25); // cm
  const flightTimeUs = Math.round((targetDist * 2 * 10000) / 340); // microsec

  return (
    <div className="rounded-2xl bg-black/40 border border-emerald-500/30 p-3 sm:p-4 text-emerald-300 font-mono text-xs space-y-3">
      {/* 1. OHM'S LAW ELECTRIC CIRCUIT */}
      {type === 'circuit' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5 text-[11px]">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>مخطط الدائرة الكهربائية وقانون أوم (V = I × R)</span>
            </span>
            <span className="text-amber-300 font-bold">
              I = {current} A • P = {power} W
            </span>
          </div>

          <svg viewBox="0 0 320 180" className="w-full h-36 sm:h-44 bg-slate-950/80 rounded-xl border border-slate-800">
            {/* Battery / DC Voltage source */}
            <circle cx="50" cy="90" r="22" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
            <text x="50" y="85" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">+</text>
            <text x="50" y="100" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">-</text>
            <text x="50" y="125" fill="#e2e8f0" fontSize="10" textAnchor="middle">{voltage} V</text>

            {/* Wire Loop with current glow */}
            <path d="M 50 68 L 50 30 L 260 30 L 260 65" fill="none" stroke="#22c55e" strokeWidth="2.5" />
            <path d="M 50 112 L 50 150 L 260 150 L 260 115" fill="none" stroke="#22c55e" strokeWidth="2.5" />

            {/* Animated Electron Arrows */}
            <g className="animate-pulse">
              <polygon points="120,27 130,30 120,33" fill="#facc15" />
              <polygon points="190,27 200,30 190,33" fill="#facc15" />
              <polygon points="200,153 190,150 200,147" fill="#facc15" />
              <polygon points="130,153 120,150 130,147" fill="#facc15" />
            </g>

            {/* Resistor (Zig-zag) */}
            <path
              d="M 260 65 L 250 72 L 270 79 L 250 86 L 270 93 L 250 100 L 270 107 L 260 115"
              fill="none"
              stroke="#f97316"
              strokeWidth="3"
            />
            <text x="295" y="93" fill="#fb923c" fontSize="11" fontWeight="bold" textAnchor="middle">
              R = {resistance} Ω
            </text>

            {/* Ammeter In Loop */}
            <circle cx="150" cy="30" r="14" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
            <text x="150" y="34" fill="#c084fc" fontSize="10" fontWeight="bold" textAnchor="middle">A</text>
            <text x="150" y="16" fill="#e2e8f0" fontSize="9" textAnchor="middle">{current} A</text>
          </svg>

          {isInteractive && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">الجهد (V):</span>
                  <span className="text-blue-400 font-bold">{voltage} V</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="24"
                  step="1"
                  value={voltage}
                  onChange={(e) => setVoltage(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1.5"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">المقاومة (R):</span>
                  <span className="text-orange-400 font-bold">{resistance} Ω</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={resistance}
                  onChange={(e) => setResistance(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer h-1.5"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. SERWAY VECTORS DECOMPOSITION */}
      {type === 'vectors' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5 text-[11px]">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>تحليل المتجه في المستوى (Serway Ch 3: Vectors)</span>
            </span>
            <span className="text-amber-300 font-bold">
              Rx = {rx} N • Ry = {ry} N
            </span>
          </div>

          <svg viewBox="0 0 320 180" className="w-full h-36 sm:h-44 bg-slate-950/80 rounded-xl border border-slate-800">
            {/* Grid Lines */}
            <defs>
              <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="320" height="180" fill="url(#smallGrid)" />

            {/* Axes */}
            <line x1="40" y1="150" x2="290" y2="150" stroke="#94a3b8" strokeWidth="1.5" />
            <polygon points="295,150 288,147 288,153" fill="#94a3b8" />
            <text x="302" y="153" fill="#94a3b8" fontSize="10">+X</text>

            <line x1="60" y1="165" x2="60" y2="20" stroke="#94a3b8" strokeWidth="1.5" />
            <polygon points="60,15 57,22 63,22" fill="#94a3b8" />
            <text x="60" y="10" fill="#94a3b8" fontSize="10" textAnchor="middle">+Y</text>

            {/* Component Rx (along X) */}
            <line
              x1="60"
              y1="150"
              x2={60 + Number(rx) * 16}
              y2="150"
              stroke="#38bdf8"
              strokeWidth="3"
            />
            <polygon
              points={`${60 + Number(rx) * 16},150 ${54 + Number(rx) * 16},147 ${54 + Number(rx) * 16},153`}
              fill="#38bdf8"
            />
            <text x={60 + (Number(rx) * 16) / 2} y="165" fill="#38bdf8" fontSize="9" textAnchor="middle">
              Ax = {rx}
            </text>

            {/* Component Ry (along Y) */}
            <line
              x1="60"
              y1="150"
              x2="60"
              y2={150 - Number(ry) * 16}
              stroke="#f43f5e"
              strokeWidth="3"
            />
            <polygon
              points={`60,${150 - Number(ry) * 16} 57,${156 - Number(ry) * 16} 63,${156 - Number(ry) * 16}`}
              fill="#f43f5e"
            />
            <text x="40" y={150 - (Number(ry) * 16) / 2} fill="#f43f5e" fontSize="9" textAnchor="middle">
              Ay = {ry}
            </text>

            {/* Projection Dashed lines */}
            <line
              x1={60 + Number(rx) * 16}
              y1="150"
              x2={60 + Number(rx) * 16}
              y2={150 - Number(ry) * 16}
              stroke="#64748b"
              strokeDasharray="3,3"
            />
            <line
              x1="60"
              y1={150 - Number(ry) * 16}
              x2={60 + Number(rx) * 16}
              y2={150 - Number(ry) * 16}
              stroke="#64748b"
              strokeDasharray="3,3"
            />

            {/* Main Vector R */}
            <line
              x1="60"
              y1="150"
              x2={60 + Number(rx) * 16}
              y2={150 - Number(ry) * 16}
              stroke="#facc15"
              strokeWidth="3.5"
            />
            <circle cx={60 + Number(rx) * 16} cy={150 - Number(ry) * 16} r="4" fill="#facc15" />
            <text
              x={60 + Number(rx) * 16 + 10}
              y={150 - Number(ry) * 16}
              fill="#facc15"
              fontSize="11"
              fontWeight="bold"
            >
              A = {vectorMag} N
            </text>

            {/* Angle Arc */}
            <path
              d={`M 85 150 A 25 25 0 0 0 ${60 + 25 * Math.cos(rad)} ${150 - 25 * Math.sin(rad)}`}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
            <text x="95" y="142" fill="#e2e8f0" fontSize="9">θ = {vectorAngle}°</text>
          </svg>

          {isInteractive && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">مقدار المتجه (A):</span>
                  <span className="text-amber-400 font-bold">{vectorMag} N</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="14"
                  step="1"
                  value={vectorMag}
                  onChange={(e) => setVectorMag(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">الزاوية (θ):</span>
                  <span className="text-emerald-400 font-bold">{vectorAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="85"
                  step="5"
                  value={vectorAngle}
                  onChange={(e) => setVectorAngle(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. ROBOTIC ARM 2-DOF KINEMATICS */}
      {type === 'robot_arm' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5 text-[11px]">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>كينماتيكا الذراع الروبوتية ثنائية المفاصل (2-DOF)</span>
            </span>
            <span className="text-cyan-300 font-bold">
              X = {endX.toFixed(0)} • Y = {(160 - endY).toFixed(0)}
            </span>
          </div>

          <svg viewBox="0 0 320 180" className="w-full h-36 sm:h-44 bg-slate-950/80 rounded-xl border border-slate-800">
            {/* Robot Base Stand */}
            <rect x="120" y="160" width="40" height="15" fill="#334155" rx="3" />
            <polygon points="120,175 160,175 170,180 110,180" fill="#1e293b" />

            {/* Base Joint 1 */}
            <circle cx="140" cy="160" r="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />

            {/* Link 1 */}
            <line x1="140" y1="160" x2={jointX} y2={jointY} stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />

            {/* Elbow Joint 2 */}
            <circle cx={jointX} cy={jointY} r="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" />

            {/* Link 2 */}
            <line x1={jointX} y1={jointY} x2={endX} y2={endY} stroke="#f59e0b" strokeWidth="5.5" strokeLinecap="round" />

            {/* End Effector Gripper */}
            <circle cx={endX} cy={endY} r="6" fill="#ef4444" />
            <path
              d={`M ${endX - 4} ${endY - 6} L ${endX - 8} ${endY - 12} M ${endX + 4} ${endY - 6} L ${endX + 8} ${endY - 12}`}
              stroke="#ef4444"
              strokeWidth="2.5"
            />
          </svg>

          {isInteractive && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">مفصل القاعدة (θ1):</span>
                  <span className="text-cyan-400 font-bold">{theta1}°</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={theta1}
                  onChange={(e) => setTheta1(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1.5"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">مفصل الكوع (θ2):</span>
                  <span className="text-amber-400 font-bold">{theta2}°</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="90"
                  step="5"
                  value={theta2}
                  onChange={(e) => setTheta2(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. ULTRASONIC SENSOR HC-SR04 */}
      {type === 'sensor_sonar' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5 text-[11px]">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>حساس الموجات فوق الصوتية (Distance = v × t / 2)</span>
            </span>
            <span className="text-teal-300 font-bold">
              المسافة: {targetDist} cm • زمن الصدى: {flightTimeUs} µs
            </span>
          </div>

          <svg viewBox="0 0 320 160" className="w-full h-36 bg-slate-950/80 rounded-xl border border-slate-800">
            {/* HC-SR04 Board */}
            <rect x="20" y="55" width="45" height="60" fill="#0284c7" rx="3" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Transmitter & Receiver Eyes */}
            <circle cx="42" cy="73" r="11" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="42" cy="73" r="6" fill="#0f172a" />
            <circle cx="42" cy="97" r="11" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="42" cy="97" r="6" fill="#0f172a" />
            <text x="42" y="128" fill="#e2e8f0" fontSize="8" textAnchor="middle">HC-SR04</text>

            {/* Ultrasonic Wave Arcs */}
            <g className="animate-pulse">
              <path d="M 70 70 A 20 20 0 0 1 70 100" fill="none" stroke="#22c55e" strokeWidth="2" />
              <path d="M 85 63 A 35 35 0 0 1 85 107" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="4,2" />
              <path d="M 100 56 A 50 50 0 0 1 100 114" fill="none" stroke="#22c55e" strokeWidth="2" />
            </g>

            {/* Obstacle Box */}
            <rect
              x={90 + targetDist * 4.2}
              y="40"
              width="25"
              height="80"
              fill="#ef4444"
              stroke="#fca5a5"
              strokeWidth="2"
              rx="4"
            />
            <text x={90 + targetDist * 4.2 + 12} y="85" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
              عائق
            </text>

            {/* Distance Dimension Line */}
            <line x1="68" y1="135" x2={90 + targetDist * 4.2} y2="135" stroke="#facc15" strokeWidth="1.5" />
            <polygon points="68,135 74,132 74,138" fill="#facc15" />
            <polygon points={`${90 + targetDist * 4.2},135 ${84 + targetDist * 4.2},132 ${84 + targetDist * 4.2},138`} fill="#facc15" />
            <text x={(68 + 90 + targetDist * 4.2) / 2} y="148" fill="#facc15" fontSize="10" fontWeight="bold" textAnchor="middle">
              d = {targetDist} cm
            </text>
          </svg>

          {isInteractive && (
            <div className="space-y-1 pt-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-300">مسافة العائق عن الروبوت:</span>
                <span className="text-teal-400 font-bold">{targetDist} cm</span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                step="1"
                value={targetDist}
                onChange={(e) => setTargetDist(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer h-1.5"
              />
            </div>
          )}
        </div>
      )}

      {/* 5. NEWTON'S 2ND LAW & FREE BODY DIAGRAM */}
      {type === 'free_body' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5 text-[11px]">
            <span className="font-bold text-white">مخطط الجسم الحر (Free Body Diagram — Serway Ch 5)</span>
            <span className="text-amber-300 font-bold">ΣF = m × a</span>
          </div>
          <svg viewBox="0 0 320 160" className="w-full h-36 bg-slate-950/80 rounded-xl border border-slate-800">
            {/* Ground */}
            <line x1="20" y1="125" x2="300" y2="125" stroke="#64748b" strokeWidth="2" />
            {/* Mass Box */}
            <rect x="125" y="75" width="70" height="50" fill="#3b82f6" stroke="#93c5fd" strokeWidth="2" rx="4" />
            <text x="160" y="105" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">m = 5 kg</text>

            {/* Normal Force N (up) */}
            <line x1="160" y1="75" x2="160" y2="25" stroke="#22c55e" strokeWidth="2.5" />
            <polygon points="160,20 156,28 164,28" fill="#22c55e" />
            <text x="175" y="32" fill="#22c55e" fontSize="10" fontWeight="bold">N (رد الفعل)</text>

            {/* Weight W = mg (down) */}
            <line x1="160" y1="125" x2="160" y2="155" stroke="#ef4444" strokeWidth="2.5" />
            <polygon points="160,160 156,152 164,152" fill="#ef4444" />
            <text x="175" y="152" fill="#ef4444" fontSize="10" fontWeight="bold">W = m·g</text>

            {/* Pulling Force F (right) */}
            <line x1="195" y1="100" x2="260" y2="100" stroke="#facc15" strokeWidth="2.5" />
            <polygon points="265,100 257,96 257,104" fill="#facc15" />
            <text x="235" y="90" fill="#facc15" fontSize="10" fontWeight="bold">F_pull = 50 N</text>

            {/* Friction Force f_k (left) */}
            <line x1="125" y1="115" x2="70" y2="115" stroke="#ea580c" strokeWidth="2" />
            <polygon points="65,115 73,111 73,119" fill="#ea580c" />
            <text x="95" y="108" fill="#ea580c" fontSize="9" fontWeight="bold">f_k (احتكاك)</text>
          </svg>
        </div>
      )}
    </div>
  );
};
