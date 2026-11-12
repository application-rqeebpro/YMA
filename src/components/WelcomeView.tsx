import React from 'react';
import { Subject, StudentProfile } from '../types';

interface WelcomeViewProps {
  student?: StudentProfile | null;
  onRegister: () => void;
  onLogin: () => void;
  onLogout?: () => void;
  onOpenProfile?: () => void;
  onOpenActivation?: () => void;
  onOpenAdmin?: () => void;
  onOpenVideos?: () => void;
  onOpenSmartDoctor?: () => void;
  onExploreAsGuest?: () => void;
  onOpenGuide?: () => void;
  onOpenExplainLesson?: () => void;
  onOpenCalculator?: () => void;
  onOpenArduino?: () => void;
  onOpenLab?: () => void;
  onOpenPhysicsLab?: () => void;
  onOpenReferences?: () => void;
  onOpenSubjects?: (filterTrack?: string) => void;
  onOpenDailyChallenge?: () => void;
  onOpenProgress?: () => void;
  onOpenAiModal?: () => void;
  subjects?: Subject[];
  monthlyPriceUSD?: number;
  yearlyPriceUSD?: number;
}

/* ========================================================================= */
/* Custom SVG Icons Matching the User's Attached Screenshot Exactly          */
/* ========================================================================= */

// 1. Lightbulb (اشرح لي)
const BulbIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Glow rays */}
    <path d="M32 4V10M12 16L16.5 20.5M52 16L47.5 20.5M4 34H10M54 34H60" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    {/* Bulb Glass */}
    <path d="M20 28C20 21.3726 25.3726 16 32 16C38.6274 16 44 21.3726 44 28C44 32.5 41.5 36.5 39 40C37.5 42.1 37 44 37 46H27C27 44 26.5 42.1 25 40C22.5 36.5 20 32.5 20 28Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
    {/* Inner filament */}
    <path d="M28 28C28 25.7909 29.7909 24 32 24C34.2091 24 36 25.7909 36 28V36M28 36H36" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
    {/* Socket Base */}
    <rect x="27" y="46" width="10" height="3" rx="1" fill="#94a3b8" />
    <rect x="28" y="49" width="8" height="3" rx="1" fill="#64748b" />
    <path d="M29 52C29 54 31 55 32 55C33 55 35 54 35 52H29Z" fill="#475569" />
  </svg>
);

// 2. Classical University Temple (القاعة الدراسية)
const TempleIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Triangular Pediment */}
    <path d="M32 10L14 22H50L32 10Z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" strokeLinejoin="round" />
    <rect x="12" y="22" width="40" height="4" rx="1" fill="#1e40af" />
    {/* 4 Classical Columns */}
    <rect x="16" y="26" width="5" height="20" rx="1" fill="#60a5fa" stroke="#2563eb" strokeWidth="1.5" />
    <rect x="24" y="26" width="5" height="20" rx="1" fill="#60a5fa" stroke="#2563eb" strokeWidth="1.5" />
    <rect x="35" y="26" width="5" height="20" rx="1" fill="#60a5fa" stroke="#2563eb" strokeWidth="1.5" />
    <rect x="43" y="26" width="5" height="20" rx="1" fill="#60a5fa" stroke="#2563eb" strokeWidth="1.5" />
    {/* Bottom Base Steps */}
    <rect x="12" y="46" width="40" height="4" rx="1" fill="#1e40af" />
    <rect x="9" y="50" width="46" height="4" rx="1" fill="#1e3a8a" />
  </svg>
);

// 3. Smart Lecturer Avatar (المحاضر الذكي)
const LecturerIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body / Suit */}
    <path d="M16 56C16 46 22 42 32 42C42 42 48 46 48 56H16Z" fill="#059669" stroke="#047857" strokeWidth="2" />
    {/* Red tie */}
    <path d="M30 42L32 49L34 42L33 40H31L30 42Z" fill="#dc2626" />
    <path d="M32 49L34 56L32 58L30 56L32 49Z" fill="#ef4444" />
    {/* Head */}
    <circle cx="32" cy="28" r="12" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" />
    {/* Hair */}
    <path d="M20 25C20 18 24 15 32 15C40 15 44 18 44 25C42 22 38 21 32 21C26 21 22 22 20 25Z" fill="#78350f" />
    {/* Glasses */}
    <rect x="24" y="25" width="6" height="5" rx="1.5" fill="#e0f2fe" stroke="#0f172a" strokeWidth="1.5" />
    <rect x="34" y="25" width="6" height="5" rx="1.5" fill="#e0f2fe" stroke="#0f172a" strokeWidth="1.5" />
    <line x1="30" y1="27" x2="34" y2="27" stroke="#0f172a" strokeWidth="1.5" />
    {/* Smile */}
    <path d="M29 34C30.5 35.5 33.5 35.5 35 34" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 4. Microscope (المختبر الافتراضي)
const MicroscopeIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Base */}
    <rect x="18" y="52" width="28" height="6" rx="2" fill="#64748b" stroke="#334155" strokeWidth="2" />
    {/* Curved arm */}
    <path d="M36 52C36 44 44 42 44 32C44 24 38 20 32 20" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
    {/* Stage */}
    <rect x="16" y="40" width="20" height="4" rx="1" fill="#475569" />
    {/* Objective tube & lens */}
    <rect x="22" y="16" width="8" height="18" rx="2" transform="rotate(-25 22 16)" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
    <rect x="26" y="10" width="6" height="8" rx="1" transform="rotate(-25 26 10)" fill="#0369a1" />
    <circle cx="21" cy="38" r="2.5" fill="#f59e0b" />
  </svg>
);

// 5. Stack of Books (المقررات الهندسية)
const BooksStackIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Bottom Book (Red) */}
    <path d="M14 48L32 54L50 48L32 42L14 48Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
    <path d="M14 48V52L32 58V54L14 48Z" fill="#b91c1c" />
    <path d="M50 48V52L32 58V54L50 48Z" fill="#991b1b" />
    {/* Middle Book (Blue) */}
    <path d="M16 38L32 44L48 38L32 32L16 38Z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
    <path d="M16 38V42L32 48V44L16 38Z" fill="#1d4ed8" />
    <path d="M48 38V42L32 48V44L48 38Z" fill="#1e40af" />
    {/* Top Book (Teal) */}
    <path d="M18 28L32 34L46 28L32 22L18 28Z" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
    <path d="M18 28V32L32 38V34L18 28Z" fill="#047857" />
    <path d="M46 28V32L32 38V34L46 28Z" fill="#065f46" />
  </svg>
);

// 6. Set Square Triangle (الحاسبة الهندسية)
const RulerIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer triangle */}
    <path d="M12 52L12 14L50 52H12Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Inner cutout triangle */}
    <path d="M20 46L20 28L38 46H20Z" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
    {/* Tick marks along bottom edge */}
    <line x1="16" y1="52" x2="16" y2="48" stroke="#0284c7" strokeWidth="1.5" />
    <line x1="22" y1="52" x2="22" y2="49" stroke="#0284c7" strokeWidth="1.5" />
    <line x1="28" y1="52" x2="28" y2="48" stroke="#0284c7" strokeWidth="1.5" />
    <line x1="34" y1="52" x2="34" y2="49" stroke="#0284c7" strokeWidth="1.5" />
    <line x1="40" y1="52" x2="40" y2="48" stroke="#0284c7" strokeWidth="1.5" />
    <line x1="46" y1="52" x2="46" y2="49" stroke="#0284c7" strokeWidth="1.5" />
    {/* Tick marks along vertical edge */}
    <line x1="12" y1="48" x2="16" y2="48" stroke="#0284c7" strokeWidth="1.5" />
    <line x1="12" y1="42" x2="15" y2="42" stroke="#0284c7" strokeWidth="1.5" />
    <line x1="12" y1="36" x2="16" y2="36" stroke="#0284c7" strokeWidth="1.5" />
    <line x1="12" y1="30" x2="15" y2="30" stroke="#0284c7" strokeWidth="1.5" />
    <line x1="12" y1="24" x2="16" y2="24" stroke="#0284c7" strokeWidth="1.5" />
  </svg>
);

// 7. Exam Notepad with Pencil (بنك الأسئلة)
const NotepadIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Sheet */}
    <rect x="14" y="10" width="34" height="44" rx="4" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
    {/* Ruled lines */}
    <line x1="20" y1="20" x2="42" y2="20" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="28" x2="42" y2="28" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="36" x2="34" y2="36" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="44" x2="30" y2="44" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
    {/* Yellow Pencil leaning */}
    <g transform="translate(34, 18) rotate(35)">
      <rect x="0" y="0" width="6" height="24" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
      <path d="M0 24L3 30L6 24H0Z" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
      <path d="M2 28L3 30L4 28H2Z" fill="#0f172a" />
      <rect x="0" y="-4" width="6" height="4" fill="#f43f5e" />
    </g>
  </svg>
);

// 8. Arcade Joystick (المحاكاة الهندسية)
const JoystickIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Base */}
    <path d="M16 48L22 38H42L48 48L42 54H22L16 48Z" fill="#334155" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
    <ellipse cx="32" cy="40" rx="7" ry="3" fill="#64748b" />
    {/* Shaft */}
    <line x1="32" y1="40" x2="32" y2="22" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
    {/* Red Ball */}
    <circle cx="32" cy="18" r="9" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
    <circle cx="30" cy="15" r="2.5" fill="#fca5a5" />
  </svg>
);

// 9. Open Book (المكتبة الرقمية)
const OpenBookIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left Cover & Page */}
    <path d="M32 44C24 40 14 42 10 44V22C14 20 24 18 32 22V44Z" fill="#fee2e2" stroke="#ef4444" strokeWidth="2" />
    {/* Right Cover & Page */}
    <path d="M32 44C40 40 50 42 54 44V22C50 20 40 18 32 22V44Z" fill="#fee2e2" stroke="#ef4444" strokeWidth="2" />
    {/* Text lines */}
    <line x1="16" y1="26" x2="26" y2="24" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="16" y1="32" x2="26" y2="30" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="38" y1="24" x2="48" y2="26" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="38" y1="30" x2="48" y2="32" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
    {/* Spine */}
    <line x1="32" y1="22" x2="32" y2="44" stroke="#dc2626" strokeWidth="2.5" />
  </svg>
);

// 10. Analytics Bar Chart (تقدمك الدراسي)
const ChartIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Card Frame */}
    <rect x="12" y="12" width="40" height="40" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
    {/* Bars */}
    <rect x="18" y="32" width="6" height="14" rx="1" fill="#10b981" />
    <rect x="28" y="22" width="6" height="24" rx="1" fill="#3b82f6" />
    <rect x="38" y="27" width="6" height="19" rx="1" fill="#ef4444" />
    {/* Baseline */}
    <line x1="15" y1="46" x2="49" y2="46" stroke="#94a3b8" strokeWidth="2" />
  </svg>
);

// Specialization Icons
const LightningIcon: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M34 6L16 34H32L28 58L48 28H32L34 6Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const MechanicalGearIcon: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="16" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
    <circle cx="32" cy="32" r="8" fill="#ffffff" />
    {/* 8 Teeth */}
    <g fill="#0284c7">
      <rect x="29" y="8" width="6" height="8" rx="1.5" />
      <rect x="29" y="48" width="6" height="8" rx="1.5" />
      <rect x="8" y="29" width="8" height="6" rx="1.5" />
      <rect x="48" y="29" width="8" height="6" rx="1.5" />
      <rect x="15" y="15" width="6" height="8" rx="1.5" transform="rotate(45 18 19)" />
      <rect x="43" y="43" width="6" height="8" rx="1.5" transform="rotate(45 46 47)" />
      <rect x="15" y="43" width="6" height="8" rx="1.5" transform="rotate(-45 18 47)" />
      <rect x="43" y="15" width="6" height="8" rx="1.5" transform="rotate(-45 46 19)" />
    </g>
  </svg>
);

/* ========================================================================= */
/* MAIN COMPONENT                                                            */
/* ========================================================================= */

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  student,
  onRegister,
  onLogin,
  onLogout,
  onOpenProfile,
  onOpenActivation,
  onOpenAdmin,
  onOpenVideos,
  onOpenSmartDoctor,
  onExploreAsGuest,
  onOpenGuide,
  onOpenExplainLesson,
  onOpenCalculator,
  onOpenArduino,
  onOpenLab,
  onOpenPhysicsLab,
  onOpenReferences,
  onOpenSubjects,
  onOpenDailyChallenge,
  onOpenProgress,
  onOpenAiModal,
  subjects = [],
}) => {
  const isPending = Boolean(student && (!student.isActivated || student.subscriptionStatus === 'pending'));
  const isExpired = Boolean(student && (student.isExpired || (student.remainingDays !== undefined && student.remainingDays <= 0)));

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-10 sm:space-y-12" dir="rtl">
      
      {/* ========================================================= */}
      {/* 1. HERO SECTION (Matching user's screenshot exactly)       */}
      {/* ========================================================= */}
      <section className="relative w-full rounded-[24px] sm:rounded-[32px] bg-gradient-to-b from-[#0b5cce] via-[#0952ba] to-[#0760d6] shadow-xl overflow-hidden px-6 py-10 sm:py-14 md:py-16 flex flex-col justify-end min-h-[300px] sm:min-h-[350px]">
        
        {/* Subtle Ambient Depth */}
        <div className="absolute inset-0 bg-radial from-white/10 via-transparent to-black/15 pointer-events-none" />

        {/* If student is logged in, show their welcoming badge inside the blue banner */}
        {student && (
          <div className="relative z-10 w-full max-w-xl mx-auto text-center space-y-3 mb-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs sm:text-sm font-bold text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>مرحباً بك يا مهندس {student.name} 🎓</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
              أكاديمية الميكاترونكس اليمنية-YMA
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-md mx-auto">
              بوابتك الهندسية المتكاملة — اختر أي خدمة أدناه للمتابعة فوراً بدون تعقيد
            </p>
            <div className="inline-block pt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-black shadow-xs ${
                isPending
                  ? 'bg-amber-400 text-slate-950'
                  : isExpired
                  ? 'bg-rose-500 text-white'
                  : 'bg-emerald-500 text-white'
              }`}>
                {isPending
                  ? 'الحساب بانتظار تأكيد التفعيل ⏳'
                  : isExpired
                  ? 'انتهى الاشتراك — يرجى التجديد ⚠️'
                  : `اشتراك نشط ✨ متبقي ${student.remainingDays ?? 30} يوم`}
              </span>
            </div>
          </div>
        )}

        {/* Central Action Buttons Container */}
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center gap-3">
          
          {student ? (
            /* Logged in Student Quick Controls */
            <>
              <div className="w-full flex items-center justify-center gap-3">
                {/* Primary Study Trigger */}
                <button
                  onClick={() => onOpenSubjects ? onOpenSubjects() : onOpenSmartDoctor?.()}
                  className="flex-1 py-3 px-5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-transform active:scale-95 cursor-pointer text-center"
                >
                  ابدأ التعلم الآن 🚀
                </button>

                {/* Profile / Account Trigger */}
                <button
                  onClick={onOpenProfile}
                  className="flex-1 py-3 px-5 rounded-xl border-2 border-white text-white hover:bg-white/15 font-black text-xs sm:text-sm transition-transform active:scale-95 cursor-pointer text-center"
                >
                  بيانات حسابي 👤
                </button>
              </div>

              {/* Instant AI Smart Tutor Trigger */}
              <button
                onClick={onOpenAiModal}
                className="w-full py-3 px-6 rounded-xl border-2 border-white text-white hover:bg-white/15 font-black text-xs sm:text-sm transition-transform active:scale-95 cursor-pointer text-center shadow-xs flex items-center justify-center gap-2"
              >
                <span>المحاضر الذكي (اسأل في أي مسألة)</span>
                <span>🤖</span>
              </button>
            </>
          ) : (
            /* Visitor / Guest Controls matching screenshot */
            <>
              {/* Row of 2 primary buttons */}
              <div className="w-full flex items-center justify-center gap-3">
                
                {/* Student Login (Solid Amber) */}
                <button
                  onClick={onLogin}
                  className="flex-1 py-3 px-6 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black text-sm sm:text-base shadow-lg transition-transform active:scale-95 cursor-pointer text-center"
                >
                  دخول الطالب
                </button>

                {/* Create Account (White Outline) */}
                <button
                  onClick={onRegister}
                  className="flex-1 py-3 px-6 rounded-xl border-2 border-white text-white hover:bg-white/15 font-black text-sm sm:text-base transition-transform active:scale-95 cursor-pointer text-center"
                >
                  إنشاء حساب
                </button>

              </div>

              {/* Explore Academy (Centered White Outline) */}
              <button
                onClick={onExploreAsGuest || onLogin}
                className="w-full py-3 px-8 rounded-xl border-2 border-white text-white hover:bg-white/15 font-black text-sm sm:text-base transition-transform active:scale-95 cursor-pointer text-center shadow-xs"
              >
                استكشف الأكاديمية
              </button>
            </>
          )}

        </div>

      </section>

      {/* ========================================================= */}
      {/* 2. ACADEMY SERVICES SECTION (خدمات الأكاديمية)              */}
      {/* ========================================================= */}
      <section className="space-y-4 sm:space-y-5">
        
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-right">
          خدمات الأكاديمية
        </h2>

        {/* 10 Services Grid (5 columns x 2 rows on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          
          {/* Card 1: اشرح لي (Highlighted Teal Border + Dot) */}
          <button
            onClick={onOpenExplainLesson || onExploreAsGuest}
            className="relative rounded-2xl bg-white dark:bg-slate-900 border-2 border-teal-300 dark:border-teal-700/80 p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group"
          >
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-teal-400" />
            <BulbIcon className="w-12 h-12 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base mt-2">
              اشرح لي
            </span>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold mt-0.5">
              نص، صورة أو فيديو
            </span>
          </button>

          {/* Card 2: القاعة الدراسية (Highlighted Amber Border + Dot) */}
          <button
            onClick={onOpenSmartDoctor || onExploreAsGuest}
            className="relative rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-700/80 p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group"
          >
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-amber-400" />
            <TempleIcon className="w-12 h-12 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-black text-[#92400e] dark:text-amber-300 text-sm sm:text-base mt-2">
              القاعة الدراسية
            </span>
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold mt-0.5">
              الدكتور والسبورة الذكية
            </span>
          </button>

          {/* Card 3: المحاضر الذكي */}
          <button
            onClick={onOpenSmartDoctor || onExploreAsGuest}
            className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group"
          >
            <LecturerIcon className="w-12 h-12 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base mt-3">
              المحاضر الذكي
            </span>
          </button>

          {/* Card 4: المختبر الافتراضي (فيزياء ومشاريع 3D) */}
          <button
            onClick={onOpenPhysicsLab || onOpenLab || onOpenArduino || onExploreAsGuest}
            className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group"
          >
            <MicroscopeIcon className="w-12 h-12 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base mt-2">
              المختبر الافتراضي
            </span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">
              فيزياء حركية ومشاريع 3D
            </span>
          </button>

          {/* Card 5: المقررات الهندسية */}
          <button
            onClick={() => onOpenSubjects ? onOpenSubjects() : onExploreAsGuest?.()}
            className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group"
          >
            <BooksStackIcon className="w-12 h-12 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base mt-3">
              المقررات الهندسية
            </span>
          </button>

          {/* Card 6: الحاسبة الهندسية */}
          <button
            onClick={onOpenCalculator || onExploreAsGuest}
            className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group"
          >
            <RulerIcon className="w-12 h-12 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base mt-3">
              الحاسبة الهندسية
            </span>
          </button>

          {/* Card 7: بنك الأسئلة */}
          <button
            onClick={onOpenDailyChallenge || onLogin}
            className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group"
          >
            <NotepadIcon className="w-12 h-12 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base mt-3">
              بنك الأسئلة
            </span>
          </button>

          {/* Card 8: المحاكاة الهندسية */}
          <button
            onClick={onOpenLab || onOpenArduino || onExploreAsGuest}
            className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group"
          >
            <JoystickIcon className="w-12 h-12 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base mt-3">
              المحاكاة الهندسية
            </span>
          </button>

          {/* Card 9: المكتبة الرقمية */}
          <button
            onClick={onOpenReferences || onExploreAsGuest}
            className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group"
          >
            <OpenBookIcon className="w-12 h-12 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base mt-3">
              المكتبة الرقمية
            </span>
          </button>

          {/* Card 10: تقدمك الدراسي */}
          <button
            onClick={onOpenProgress || onLogin}
            className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group"
          >
            <ChartIcon className="w-12 h-12 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base mt-3">
              تقدمك الدراسي
            </span>
          </button>

        </div>

      </section>

      {/* ========================================================= */}
      {/* 3. SPECIALIZATIONS SECTION (التخصصات)                     */}
      {/* ========================================================= */}
      <section className="space-y-4 sm:space-y-5">
        
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-right">
          التخصصات
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Specialization 1: الكهرباء والإلكترونيات */}
          <button
            onClick={() => onOpenSubjects ? onOpenSubjects('electrical') : onExploreAsGuest?.()}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition cursor-pointer hover:scale-[1.01] group"
          >
            <LightningIcon className="w-14 h-14 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-black text-slate-900 dark:text-white text-base sm:text-lg mt-3">
              الكهرباء والإلكترونيات
            </span>
            <span className="text-xs text-slate-500 font-medium mt-1">
              الدوائر، المتحكمات الدقيقة، الإلكترونيات
            </span>
          </button>

          {/* Specialization 2: الميكانيكا */}
          <button
            onClick={() => onOpenSubjects ? onOpenSubjects('mechanical') : onExploreAsGuest?.()}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition cursor-pointer hover:scale-[1.01] group"
          >
            <MechanicalGearIcon className="w-14 h-14 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-black text-slate-900 dark:text-white text-base sm:text-lg mt-3">
              الميكانيكا
            </span>
            <span className="text-xs text-slate-500 font-medium mt-1">
              الفيزياء الميكانيكية، التصميم والمحركات
            </span>
          </button>

        </div>

      </section>

    </div>
  );
};
