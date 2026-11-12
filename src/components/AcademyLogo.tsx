import React, { useRef } from 'react';

interface AcademyLogoProps {
  variant?: 'full' | 'icon' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
  onAdminTrigger?: () => void;
}

export const AcademyLogo: React.FC<AcademyLogoProps> = ({
  variant = 'full',
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick,
  onAdminTrigger,
}) => {
  const clickCountRef = useRef(0);
  const resetTimerRef = useRef<any>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }

    if (onAdminTrigger) {
      clickCountRef.current += 1;

      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }

      if (clickCountRef.current >= 30) {
        clickCountRef.current = 0;
        onAdminTrigger();
      } else {
        // Keep counting consecutive clicks within a 10 second window
        resetTimerRef.current = setTimeout(() => {
          clickCountRef.current = 0;
        }, 10000);
      }
    }
  };

  // Size mappings
  const iconSizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-8 h-8',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20 sm:w-24 sm:h-24',
  };

  const renderEmblem = () => (
    <img
      src="/logo.png"
      alt="أكاديمية الميكاترونكس اليمنية-YMA"
      className={`${iconSizeClasses[size]} shrink-0 object-contain rounded-xl drop-shadow-sm select-none transition-transform`}
      loading="eager"
    />
  );

  if (variant === 'icon') {
    return (
      <div 
        onClick={handleClick}
        className={`relative flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform ${className}`}
        title="أكاديمية الميكاترونكس اليمنية-YMA"
      >
        {renderEmblem()}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div 
        onClick={handleClick}
        className={`flex flex-col items-center justify-center text-center p-4 rounded-3xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/60 shadow-lg shadow-blue-500/10 cursor-pointer hover:scale-[1.02] transition-transform ${className}`}
      >
        {renderEmblem()}
        <span className="font-black text-slate-900 dark:text-white tracking-tight text-sm sm:text-base mt-2">
          أكاديمية الميكاترونكس اليمنية
        </span>
        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold tracking-widest mt-0.5">
          YMA
        </span>
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className={`flex items-center gap-2 select-none shrink-0 min-w-0 cursor-pointer group ${className}`}
      title="أكاديمية الميكاترونكس اليمنية-YMA"
    >
      <div className="relative shrink-0 transition-transform group-hover:scale-105">
        {renderEmblem()}
      </div>
      <div className="flex flex-col justify-center min-w-0 text-right leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-black text-slate-900 dark:text-white tracking-tight text-xs sm:text-sm whitespace-nowrap">
            أكاديمية الميكاترونكس اليمنية
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-[10px] font-black text-blue-700 dark:text-blue-300 shrink-0">
            YMA
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5 hidden md:block">
            تعلم الميكاترونكس بطريقة أسهل
          </span>
        )}
      </div>
    </div>
  );
};
