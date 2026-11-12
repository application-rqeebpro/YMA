import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, Share, PlusSquare } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'button' | 'banner' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If app is already installed and running in standalone mode, hide prompt
  if (isInstalled) {
    return null;
  }

  // Variant: Standard Header / Quick Action Button
  if (variant === 'button') {
    return (
      <>
        <button
          onClick={isInstallable ? install : () => setShowGuide(true)}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer ${className}`}
          title="تثبيت التطبيق على التلفون"
        >
          <Smartphone className="w-4 h-4 animate-bounce shrink-0" />
          <span>تثبيت التطبيق</span>
        </button>

        {/* Modal Guide when auto-prompt isn't ready or on iOS */}
        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
              <button
                onClick={() => setShowGuide(false)}
                className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-md">
                  <Smartphone className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  تثبيت أكاديمية الميكاترونكس
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  يمكنك تثبيت التطبيق مباشرة على شاشة تلفونك الرئيسية للوصول السريع بدون الحاجة لفتح المتصفح في كل مرة.
                </p>
              </div>

              {/* iOS Instructions */}
              {isIOS ? (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-right text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <p className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <Share className="w-4 h-4 shrink-0" />
                    <span>خطوات التثبيت على آيفون / آيباد (Safari):</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-300">
                    <li>اضغط على زر <span className="font-bold text-blue-600">مشاركة (Share)</span> في أسفل المتصفح.</li>
                    <li>اختر <span className="font-bold text-blue-600">إضافة إلى الشاشة الرئيسية (Add to Home Screen)</span>.</li>
                    <li>اضغط على <span className="font-bold text-blue-600">إضافة (Add)</span> في الأعلى لتثبيته كـ تطبيق مستقل.</li>
                  </ol>
                </div>
              ) : (
                /* Android / Chrome Instructions */
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-right text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <PlusSquare className="w-4 h-4 shrink-0" />
                    <span>خطوات التثبيت على أندرويد (Chrome/Edge):</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-300">
                    <li>اضغط على خيارات المتصفح <span className="font-bold text-emerald-600">⋮ (الثلاث نقاط)</span> أعلى الشاشة.</li>
                    <li>اختر <span className="font-bold text-emerald-600">تثبيت التطبيق (Install app)</span> أو <span className="font-bold text-emerald-600">إضافة للشاشة الرئيسية</span>.</li>
                    <li>سيظهر التطبيق كـ أيقونة مستقلا بملء الشاشة على هاتف.</li>
                  </ol>
                </div>
              )}

              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Variant: Banner Card
  return (
    <div className={`p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-xl space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-black text-sm sm:text-base">تثبيت التطبيق على هاتفك</h4>
            <p className="text-xs text-blue-100">تصفح أسرع بدقة ملء الشاشة وبدون الحاجة لفتح المتصفح كل مرة</p>
          </div>
        </div>
        <button
          onClick={isInstallable ? install : () => setShowGuide(true)}
          className="px-4 py-2 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs sm:text-sm shadow-md shrink-0 transition-transform active:scale-95 cursor-pointer"
        >
          تثبيت الآن
        </button>
      </div>
    </div>
  );
};
