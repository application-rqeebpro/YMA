import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Loader2, 
  MessageCircle,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  UserPlus
} from 'lucide-react';

interface ActivationCodeViewProps {
  onActivationSuccess: (activatedStudent: StudentProfile) => void;
  onBack?: () => void;
  onOpenRegister?: () => void;
  whatsappNumber?: string;
}

export const ActivationCodeView: React.FC<ActivationCodeViewProps> = ({
  onActivationSuccess,
  onBack,
  onOpenRegister,
  whatsappNumber = '785500075',
}) => {
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPhoneField, setShowPhoneField] = useState(false);
  const [requireRegister, setRequireRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isLoggedIn = !!localStorage.getItem('mct_auth_token');

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setRequireRegister(false);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('يرجى إدخال كود التفعيل.');
      return;
    }

    if (!isLoggedIn) {
      if (!phone.trim()) {
        setError('يرجى إدخال رقم هاتفك المسجل لربط كود التفعيل بحسابك.');
        setShowPhoneField(true);
        return;
      }
      if (!password) {
        setError('يرجى إدخال كلمة المرور الخاصة بحسابك لتأكيد التفعيل.');
        return;
      }
    }

    setLoading(true);
    try {
      const existingToken = localStorage.getItem('mct_auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (existingToken) {
        headers['Authorization'] = `Bearer ${existingToken}`;
      }

      const res = await fetch('/api/activate-code', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          code: cleanCode,
          phone: phone.trim() || undefined,
          password: password || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requirePhone) {
          setShowPhoneField(true);
        }
        if (data.requireRegister) {
          setRequireRegister(true);
        }
        throw new Error(data.error || 'كود التفعيل غير صحيح.');
      }

      setSuccessMsg(data.message || 'تم تأكيد وتفعيل الاشتراك بنجاح!');

      // Save returned token to authenticate user immediately
      if (data.token) {
        localStorage.setItem('mct_auth_token', data.token);
      }

      const activatedStudent: StudentProfile = data.student
        ? {
            ...data.student,
            completedLessons: data.student.completedLessons || [],
            quizScores: data.student.quizScores || {},
          }
        : {
            id: data.user?.id || `student-${Date.now()}`,
            name: data.user?.name || 'طالب الأكاديمية',
            phone: data.user?.phone || phone.trim(),
            university: data.user?.university || 'الجامعة الإماراتية الدولية – صنعاء',
            studyLevel: data.user?.studyLevel || 'السنة الأولى',
            major: data.user?.major || 'هندسة الميكاترونكس',
            role: data.user?.role || 'student',
            subscriptionPlan: data.subscription?.plan || 'monthly',
            subscriptionStatus: 'active',
            subscriptionStartDate: data.subscription?.startDate,
            subscriptionEndDate: data.subscription?.expiryDate,
            remainingDays: data.subscription?.remainingDays || 30,
            isActivated: true,
            isExpired: false,
            completedLessons: [],
            quizScores: {},
          };

      localStorage.setItem('mct_student', JSON.stringify(activatedStudent));

      setTimeout(() => {
        onActivationSuccess(activatedStudent);
      }, 1200);

    } catch (err: any) {
      setError(err.message || 'كود التفعيل غير صحيح.');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSupport = () => {
    const cleanNumber = whatsappNumber.startsWith('967') ? whatsappNumber : `967${whatsappNumber.replace(/^0+/, '')}`;
    const msg = `السلام عليكم إدارة أكاديمية الميكاترونكس، قمت بتحويل الرسوم وأريد الحصول على كود التفعيل لتأكيد اشتراكي.`;
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            تأكيد وتفعيل الاشتراك
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            كود التفعيل مخصص لتأكيد اشتراكك للمرة الأولى. بعد التأكيد، يمكنك دائماً تسجيل الدخول برقم هاتفك وكلمة المرور الخاصة بك.
          </p>
        </div>

        {/* Informative Guidance Card */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-slate-800/60 border border-blue-200/80 dark:border-blue-900/50 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">ملاحظة أمنية هامة:</span>
            <p className="text-slate-600 dark:text-slate-300 leading-normal">
              يُستخدم كود التفعيل مرة واحدة فقط لربط الاشتراك بحسابك. في الزيارات القادمة، ستسجل الدخول فقط برقم هاتفك وكلمة المرور دون الحاجة لإدخال الكود مجدداً.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="font-bold">{successMsg}</div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            {requireRegister && onOpenRegister && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 mx-auto transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>إنشاء حساب طالب جديد الآن</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Activation Form */}
        <form onSubmit={handleActivate} className="space-y-4">
          {/* Activation Code Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 text-right">
              كود التفعيل المستلم من الإدارة <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="مثال: AS-XXXX أو AB-XXXX"
                dir="ltr"
                autoFocus
                className="w-full text-center tracking-widest text-lg sm:text-xl font-mono font-black py-4 px-4 rounded-2xl bg-blue-50/50 dark:bg-slate-800/80 border-2 border-blue-400 dark:border-blue-600 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all uppercase"
              />
            </div>
            <p className="text-[11px] text-slate-400 text-right">
              أدخل كود التفعيل المستلم عبر الواتساب لتأكيد الاشتراك وتفعيله.
            </p>
          </div>

          {/* Phone and Password Inputs when not logged in */}
          {(!isLoggedIn || showPhoneField) && (
            <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 text-right">
                  رقم الهاتف المسجل لحسابك <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setError('');
                    }}
                    placeholder="أدخل رقم هاتفك المسجل"
                    dir="ltr"
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all text-sm text-right"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 text-right">
                  كلمة المرور الخاصة بحسابك <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="كلمة المرور التي أنشأتها عند التسجيل"
                    dir="ltr"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all text-sm text-left"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-right">
                  مطلوبة للتحقق من ملكيتك للحساب قبل ربط كود التفعيل به.
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري التحقق وتأكيد الاشتراك...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>تأكيد وتفعيل الاشتراك الآن</span>
              </>
            )}
          </button>
        </form>

        {/* Contact Help */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            لم تستلم كود التفعيل بعد سداد الرسوم؟
          </p>
          <button
            type="button"
            onClick={handleContactSupport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 font-bold text-xs transition-all cursor-pointer border border-emerald-200 dark:border-emerald-800"
          >
            <MessageCircle className="w-4 h-4" />
            <span>تواصل مع الإدارة عبر واتساب ({whatsappNumber})</span>
          </button>

          {onBack && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onBack}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                العودة للخلف
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
