import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Binary, 
  Zap, 
  Scale, 
  Sparkles,
  Camera
} from 'lucide-react';

export type TabType = 
  | 'dashboard' 
  | 'daily-challenge'
  | 'videos'
  | 'learning-path'
  | 'explain'
  | 'smart-doctor'
  | 'assignments'
  | 'arduino'
  | 'lab'
  | 'physics-lab'
  | 'calculator'
  | 'references'
  | 'subjects' 
  | 'formulas' 
  | 'units' 
  | 'math' 
  | 'circuits' 
  | 'ai';


interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'explain' as TabType, label: 'اشرح درسي', icon: Camera, highlight: true },
    { id: 'subjects' as TabType, label: 'المواد', icon: BookOpen },
    { id: 'formulas' as TabType, label: 'القوانين', icon: Scale },
    { id: 'circuits' as TabType, label: 'الدوائر', icon: Zap },
    { id: 'ai' as TabType, label: 'المساعد', icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:hidden pb-safe">
      <div className="grid grid-cols-6 h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all relative py-1 cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-all ${
                isActive ? 'bg-blue-50 dark:bg-blue-950/60 scale-110' : ''
              } ${item.highlight && !isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                <Icon className={`w-5 h-5 ${item.id === 'ai' && isActive ? 'text-amber-500' : ''}`} />
                {item.id === 'explain' && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                )}
                {item.id === 'ai' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <span className="text-[10px] tracking-tight truncate w-full text-center">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
