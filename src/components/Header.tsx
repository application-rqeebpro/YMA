import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { AcademyLogo } from './AcademyLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Moon, 
  Sun, 
  LogOut, 
  LogIn, 
  Sparkles, 
  User, 
} from 'lucide-react';

interface HeaderProps {
  student: StudentProfile | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAdmin: () => void;
  onOpenAiModal: () => void;
  onOpenVideos?: () => void;
  onOpenSmartDoctor?: () => void;
  onOpenDailyChallenge?: () => void;
  onOpenExplainLesson?: () => void;
  onOpenAssignments?: () => void;
  onOpenArduino?: () => void;
  onOpenLab?: () => void;
  onOpenCalculator?: () => void;
  onOpenReferences?: () => void;
  onOpenLearningPath?: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenActivation?: () => void;
  onOpenProfile?: () => void;
  onOpenGuide?: () => void;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  student,
  darkMode,
  onToggleDarkMode,
  onOpenAdmin,
  onOpenLogin,
  onOpenProfile,
  onLogout,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-3">
          
          {/* Logo & Branding - Protected from collapsing */}
          <div className="shrink-0 min-w-0 flex items-center">
            <AcademyLogo onClick={onNavigateHome} onAdminTrigger={onOpenAdmin} size="md" />
          </div>

          {/* ========================================================= */}
          {/* HEADER RIGHT ACTIONS (Clean, spaced, no overcrowding)     */}
          {/* ========================================================= */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            
            {/* PWA Install Button (Shown on desktop/tablet to prevent mobile crowding) */}
            <div className="hidden md:block">
              <PWAInstallButton variant="button" />
            </div>

            {/* Dark Mode Toggle (Compact, neat icon) */}
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title={darkMode ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
              aria-label="تبديل المظهر"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              )}
            </button>

            {/* The Authentic "لوحة الطالب" Button */}
            {student ? (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={onOpenProfile}
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 border-blue-900 dark:border-blue-400 text-blue-900 dark:text-blue-300 hover:bg-blue-900 hover:text-white dark:hover:bg-blue-950 font-black text-xs sm:text-sm transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 whitespace-nowrap active:scale-95"
                  title="عرض بيانات الحساب والاشتراك"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${student.isActivated ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="hidden sm:inline">لوحة الطالب ({student.name.split(' ')[0]})</span>
                  <span className="sm:hidden">لوحة الطالب</span>
                </button>

                <button
                  onClick={onLogout}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                  title="تسجيل الخروج"
                  aria-label="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl border-2 border-blue-900 dark:border-blue-400 text-blue-900 dark:text-blue-300 hover:bg-blue-900 hover:text-white dark:hover:bg-blue-950 font-black text-xs sm:text-sm transition-all cursor-pointer shadow-2xs whitespace-nowrap active:scale-95 shrink-0"
              >
                لوحة الطالب
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
