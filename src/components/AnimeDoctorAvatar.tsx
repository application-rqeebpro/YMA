import React, { useEffect, useState } from 'react';
import { SpecialistDoctor } from '../data/smartDoctorData';

interface AnimeDoctorAvatarProps {
  doctor: SpecialistDoctor;
  action?: 'speaking_straight' | 'pointing_left_board' | 'pointing_formula' | 'looking_at_diagram' | 'explaining_hand_gestures' | 'celebrating_solution' | 'warning_mistake';
  expression?: 'neutral' | 'friendly' | 'enthusiastic' | 'focused' | 'alert';
  isSpeaking: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export const AnimeDoctorAvatar: React.FC<AnimeDoctorAvatarProps> = ({
  doctor,
  action = 'speaking_straight',
  expression = 'friendly',
  isSpeaking,
  className = '',
  size = 'md',
}) => {
  // Eye blink state
  const [isBlinking, setIsBlinking] = useState(false);
  // Mouth frame for lip-sync effect
  const [mouthFrame, setMouthFrame] = useState(0);

  // Blinking loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Mouth animation when speaking
  useEffect(() => {
    if (!isSpeaking) {
      setMouthFrame(0);
      return;
    }
    const mouthInterval = setInterval(() => {
      setMouthFrame((prev) => (prev + 1) % 4);
    }, 130);
    return () => clearInterval(mouthInterval);
  }, [isSpeaking]);

  const sizeClasses = {
    sm: 'w-20 h-28',
    md: 'w-36 h-48 sm:w-44 sm:h-56',
    lg: 'w-48 h-64 sm:w-60 sm:h-80',
    hero: 'w-56 h-72 sm:w-72 sm:h-96',
  }[size];

  // Colors based on doctor styles
  const coatColor = doctor.coatColor || '#1e3a8a';
  const hairColor = doctor.hairColor || '#334155';
  const accentColor = doctor.accentColor || '#3b82f6';
  const skinTone = '#fed7aa'; // Warm anime skin tone
  const skinShadow = '#fdba74';

  // Determine pointer arm angle based on action
  const isPointing = action === 'pointing_left_board' || action === 'pointing_formula' || action === 'looking_at_diagram';
  const isWarning = action === 'warning_mistake';
  const isCelebrating = action === 'celebrating_solution';

  // Head tilt based on action
  const headRotate = isPointing ? '-6deg' : '0deg';

  // If doctor has custom uploaded photo or chosen academic icon
  if ((doctor.avatarType === 'photo' && doctor.photoUrl) || doctor.avatarType === 'icon') {
    const iconSymbol = doctor.iconSymbol || '🎓';

    return (
      <div className={`relative select-none transition-all duration-300 flex flex-col items-center justify-end ${sizeClasses} ${className}`}>
        <div className={`relative w-full h-full rounded-3xl overflow-hidden border-4 shadow-2xl bg-slate-900 group flex flex-col items-center justify-between p-3 ${
          isSpeaking ? 'border-amber-400 ring-4 ring-amber-400/30' : 'border-amber-400/80'
        }`}>
          {/* Avatar Image or Academic Icon */}
          {doctor.avatarType === 'photo' && doctor.photoUrl ? (
            <img
              src={doctor.photoUrl}
              alt={doctor.name}
              className="w-full h-full object-cover object-top rounded-2xl transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-3 border border-amber-400/40 text-center space-y-2">
              <span className="text-4xl sm:text-5xl drop-shadow-lg transform transition-transform group-hover:scale-110">
                {iconSymbol}
              </span>
              <span className="text-[10px] font-black text-amber-300 bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/30">
                أيقونة المحاضر
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 pointer-events-none" />
          
          <div className="absolute bottom-2 inset-x-2 p-2 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-amber-400/50 text-center text-white z-10 shadow-lg">
            <span className="block text-xs font-black text-amber-300 truncate">
              {doctor.name}
            </span>
            <span className="block text-[9px] text-slate-300 truncate font-semibold">
              {doctor.title || doctor.specialty}
            </span>
          </div>

          {/* Academic Badge Tag */}
          <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-md border border-amber-300 z-10">
            🎓 دكتور المادة
          </div>

          {/* Speaking Indicator */}
          {isSpeaking && (
            <div className="absolute top-2 left-2 bg-emerald-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>يشرح الآن...</span>
            </div>
          )}
        </div>

        {/* Floating Speaking Pill */}
        {isSpeaking && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg border border-blue-400 flex items-center gap-1.5 animate-bounce z-20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>يتحدث بصوت رجالي فصيح...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative select-none transition-all duration-300 ${sizeClasses} ${className}`}>
      <svg
        viewBox="0 0 300 400"
        className="w-full h-full drop-shadow-xl overflow-visible"
        style={{ transformOrigin: 'bottom center' }}
      >
        <defs>
          <linearGradient id={`coatGrad-${doctor.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={coatColor} />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id={`hairGrad-${doctor.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={hairColor} />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="tieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* ======================================================== */}
        {/* 1. BODY & ACADEMIC COAT */}
        {/* ======================================================== */}
        <g id="body-group">
          {/* Shoulders and Lab Coat / Suit */}
          <path
            d="M 60 270 Q 150 250 240 270 L 260 400 L 40 400 Z"
            fill={`url(#coatGrad-${doctor.id})`}
            filter="url(#softShadow)"
          />

          {/* White Shirt Collar */}
          <polygon points="120,250 150,295 180,250" fill="#ffffff" />
          <polygon points="135,250 150,285 165,250" fill="#e2e8f0" />

          {/* Academic Tie */}
          <polygon points="146,270 154,270 157,340 150,355 143,340" fill="url(#tieGrad)" />

          {/* Coat Lapels */}
          <path
            d="M 110 260 L 140 330 L 125 400 L 80 400 Z"
            fill={coatColor}
            stroke="#0f172a"
            strokeWidth="1.5"
          />
          <path
            d="M 190 260 L 160 330 L 175 400 L 220 400 Z"
            fill={coatColor}
            stroke="#0f172a"
            strokeWidth="1.5"
          />

          {/* ID Badge / Pocket */}
          <rect x="75" y="310" width="35" height="25" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          <rect x="80" y="315" width="12" height="15" rx="2" fill={accentColor} />
          <line x1="96" y1="318" x2="105" y2="318" stroke="#64748b" strokeWidth="2" />
          <line x1="96" y1="324" x2="103" y2="324" stroke="#94a3b8" strokeWidth="1.5" />
        </g>

        {/* ======================================================== */}
        {/* 2. ARMS & POINTER / GESTURES */}
        {/* ======================================================== */}
        <g id="arms-group">
          {/* Right Arm (resting/gesturing) */}
          <path
            d="M 230 270 Q 255 330 245 380"
            fill="none"
            stroke={coatColor}
            strokeWidth="28"
            strokeLinecap="round"
          />
          <circle cx="245" cy="385" r="12" fill={skinTone} />

          {/* Left Arm: Dynamic pointer or explaining gesture */}
          {isPointing ? (
            /* Left Arm holding pointer extended towards blackboard (to the left) */
            <g className="transition-all duration-300">
              {/* Sleeve pointing left */}
              <path
                d="M 70 275 Q 30 260 5 230"
                fill="none"
                stroke={coatColor}
                strokeWidth="28"
                strokeLinecap="round"
              />
              {/* Hand holding pointer */}
              <circle cx="5" cy="228" r="11" fill={skinTone} />

              {/* Wooden Academic Pointer Stick */}
              <line
                x1="8"
                y1="230"
                x2="-85"
                y2="170"
                stroke="#d97706"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Gold pointer tip */}
              <circle cx="-85" cy="170" r="4.5" fill="#facc15" />
              {/* Glowing laser dot effect */}
              <circle cx="-85" cy="170" r="8" fill="#ef4444" opacity="0.6" className="animate-ping" />
              <circle cx="-85" cy="170" r="3.5" fill="#ef4444" />
            </g>
          ) : isCelebrating ? (
            /* Celebrating Arm: Thumbs up */
            <g>
              <path
                d="M 70 275 Q 40 250 45 200"
                fill="none"
                stroke={coatColor}
                strokeWidth="28"
                strokeLinecap="round"
              />
              <circle cx="45" cy="195" r="12" fill={skinTone} />
              {/* Thumb up */}
              <path d="M 45 195 L 45 175 Q 48 170 52 175 L 52 195" fill={skinTone} stroke={skinShadow} />
            </g>
          ) : isWarning ? (
            /* Warning Arm: Index finger raised */
            <g>
              <path
                d="M 70 275 Q 50 240 55 190"
                fill="none"
                stroke={coatColor}
                strokeWidth="28"
                strokeLinecap="round"
              />
              <circle cx="55" cy="185" r="12" fill={skinTone} />
              {/* Raised Index finger */}
              <line x1="55" y1="185" x2="55" y2="160" stroke={skinTone} strokeWidth="6" strokeLinecap="round" />
            </g>
          ) : (
            /* Natural resting/explaining arm */
            <g>
              <path
                d="M 70 275 Q 45 330 55 380"
                fill="none"
                stroke={coatColor}
                strokeWidth="28"
                strokeLinecap="round"
              />
              <circle cx="55" cy="385" r="12" fill={skinTone} />
            </g>
          )}
        </g>

        {/* ======================================================== */}
        {/* 3. HEAD & ANIME FACE */}
        {/* ======================================================== */}
        <g
          id="head-group"
          style={{ transform: `rotate(${headRotate})`, transformOrigin: '150px 240px' }}
          className="transition-transform duration-300"
        >
          {/* Neck */}
          <rect x="135" y="215" width="30" height="40" fill={skinShadow} rx="6" />

          {/* Chin & Jaw (Anime V-shape jaw) */}
          <path
            d="M 100 150 Q 95 210 150 240 Q 205 210 200 150 Z"
            fill={skinTone}
            stroke={skinShadow}
            strokeWidth="1"
          />

          {/* Cheeks blush */}
          <ellipse cx="115" cy="185" rx="10" ry="5" fill="#fca5a5" opacity="0.45" />
          <ellipse cx="185" cy="185" rx="10" ry="5" fill="#fca5a5" opacity="0.45" />

          {/* Anime Hair Base (Behind ears) */}
          <path
            d="M 90 140 Q 80 80 150 65 Q 220 80 210 140 Q 225 180 210 200 Q 200 160 190 150 Q 150 170 110 150 Q 100 160 90 200 Z"
            fill={`url(#hairGrad-${doctor.id})`}
          />

          {/* Ears */}
          <ellipse cx="94" cy="165" rx="8" ry="14" fill={skinTone} stroke={skinShadow} />
          <ellipse cx="206" cy="165" rx="8" ry="14" fill={skinTone} stroke={skinShadow} />

          {/* ======================================================== */}
          {/* EYES (Anime Eyes with Blinking and Highlights) */}
          {/* ======================================================== */}
          <g id="eyes">
            {isBlinking ? (
              /* Closed / Blinking Eyes (Cute curved arcs) */
              <>
                <path d="M 112 165 Q 125 172 138 165" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
                <path d="M 162 165 Q 175 172 188 165" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : (
              /* Open Expressive Anime Eyes */
              <>
                {/* Left Eye */}
                <ellipse cx="125" cy="162" rx="14" ry="18" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                {/* Iris */}
                <ellipse cx="125" cy="163" rx="10" ry="13" fill={accentColor} />
                <ellipse cx="125" cy="163" rx="6" ry="8" fill="#0f172a" />
                {/* Light Highlights */}
                <circle cx="122" cy="158" r="4" fill="#ffffff" />
                <circle cx="128" cy="167" r="2" fill="#ffffff" />
                {/* Eyelash */}
                <path d="M 110 152 Q 125 145 140 152" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />

                {/* Right Eye */}
                <ellipse cx="175" cy="162" rx="14" ry="18" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                {/* Iris */}
                <ellipse cx="175" cy="163" rx="10" ry="13" fill={accentColor} />
                <ellipse cx="175" cy="163" rx="6" ry="8" fill="#0f172a" />
                {/* Light Highlights */}
                <circle cx="172" cy="158" r="4" fill="#ffffff" />
                <circle cx="178" cy="167" r="2" fill="#ffffff" />
                {/* Eyelash */}
                <path d="M 160 152 Q 175 145 190 152" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
              </>
            )}

            {/* Eyebrows based on expression */}
            {expression === 'alert' || expression === 'focused' ? (
              <>
                <path d="M 112 143 L 138 147" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
                <path d="M 188 143 L 162 147" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
              </>
            ) : expression === 'enthusiastic' ? (
              <>
                <path d="M 112 140 Q 125 133 138 142" stroke={hairColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
                <path d="M 188 140 Q 175 133 162 142" stroke={hairColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
              </>
            ) : (
              <>
                <path d="M 112 144 Q 125 140 138 146" stroke={hairColor} strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M 188 144 Q 175 140 162 146" stroke={hairColor} strokeWidth="3" strokeLinecap="round" fill="none" />
              </>
            )}
          </g>

          {/* Academic Eyeglasses (Smart Doctor touch) */}
          <g id="glasses">
            {/* Left rim */}
            <rect x="108" y="148" width="34" height="26" rx="6" fill="none" stroke="#475569" strokeWidth="2.5" />
            {/* Right rim */}
            <rect x="158" y="148" width="34" height="26" rx="6" fill="none" stroke="#475569" strokeWidth="2.5" />
            {/* Bridge */}
            <path d="M 142 158 Q 150 155 158 158" fill="none" stroke="#475569" strokeWidth="2.5" />
            {/* Lens subtle blue reflex */}
            <line x1="114" y1="152" x2="124" y2="152" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
            <line x1="164" y1="152" x2="174" y2="152" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
          </g>

          {/* Nose */}
          <path d="M 148 178 L 152 188 L 146 190" fill="none" stroke={skinShadow} strokeWidth="2" strokeLinecap="round" />

          {/* ======================================================== */}
          {/* MOUTH: Lip-sync animation */}
          {/* ======================================================== */}
          <g id="mouth">
            {!isSpeaking ? (
              /* Closed, pleasant smile */
              <path d="M 140 208 Q 150 216 160 208" fill="none" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" />
            ) : mouthFrame === 0 ? (
              /* Small open */
              <ellipse cx="150" cy="210" rx="6" ry="4" fill="#881337" stroke="#991b1b" strokeWidth="1.5" />
            ) : mouthFrame === 1 ? (
              /* Wide open speaking (vowel) */
              <path
                d="M 141 206 Q 150 218 159 206 Z"
                fill="#881337"
                stroke="#991b1b"
                strokeWidth="1.5"
              />
            ) : mouthFrame === 2 ? (
              /* Round open (O / U) */
              <ellipse cx="150" cy="211" rx="8" ry="7" fill="#881337" stroke="#991b1b" strokeWidth="1.5">
                <ellipse cx="150" cy="213" rx="5" ry="3" fill="#f43f5e" />
              </ellipse>
            ) : (
              /* Enthusiastic open smile */
              <path
                d="M 138 206 Q 150 220 162 206 Z"
                fill="#881337"
                stroke="#991b1b"
                strokeWidth="1.5"
              />
            )}
          </g>

          {/* ======================================================== */}
          {/* FRONT ANIME HAIR (Bangs & Tufts) */}
          {/* ======================================================== */}
          <g id="front-hair">
            <path
              d="M 90 120 Q 110 75 150 70 Q 190 75 210 120 Q 185 105 160 125 Q 150 100 135 125 Q 120 105 90 120 Z"
              fill={`url(#hairGrad-${doctor.id})`}
            />
            {/* Stray anime tufts */}
            <path d="M 130 90 Q 120 115 110 125 Q 125 118 135 105 Z" fill={hairColor} />
            <path d="M 170 90 Q 180 115 190 125 Q 175 118 165 105 Z" fill={hairColor} />
          </g>
        </g>
      </svg>

      {/* Floating Status / Speaking indicator pill */}
      {isSpeaking && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg border border-blue-400 flex items-center gap-1.5 animate-bounce">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>يشرح الآن...</span>
        </div>
      )}
    </div>
  );
};
