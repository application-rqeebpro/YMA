import React, { useState } from 'react';
import { AcademyLogo } from './AcademyLogo';
import { 
  User, 
  Phone, 
  School, 
  Cpu, 
  ArrowLeft, 
  AlertCircle, 
  Lock, 
  Mail, 
  Loader2,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { StudyLevel, StudentProfile } from '../types';

interface RegistrationViewProps {
  onProceedToPlans: (data: {
    name: string;
    phone: string;
    university: string;
    studyLevel: StudyLevel;
    major: string;
    email?: string;
    password?: string;
  }) => void;
  onBack: () => void;
  onOpenLogin?: () => void;
  onOpenGuide?: () => void;
  onRegistrationSuccess?: (student: StudentProfile, token: string) => void;
}

const UNIVERSITIES = [
  'الجامعة الإماراتية الدولية – صنعاء',
  'جامعة صنعاء',
  'جامعة العلوم والتكنولوجيا',
  'الجامعة اليمنية',
  'جامعة المستقبل',
  'جامعة الملكة أروى',
  'جامعة ذمار',
  'جامعة تعز',
  'جامعة إب',
  'جامعة عدن',
  'جامعة أخرى',
] as const;

type UniversityOption = typeof UNIVERSITIES[number];

const STUDY_LEVELS: StudyLevel[] = [
  'السنة الأولى',
  'السنة الثانية',
  'السنة الثالثة',
  'السنة الرابعة',
  'السنة الخامسة',
];

export const RegistrationView: React.FC<RegistrationViewProps> = ({
  onProceedToPlans,
  onBack,
  onOpenLogin,
  onOpenGuide,
  onRegistrationSuccess,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [selectedUni, setSelectedUni] = useState<UniversityOption>('الجامعة الإماراتية الدولية – صنعاء');
  const [customUni, setCustomUni] = useState('');
  const [studyLevel, setStudyLevel] = useState<StudyLevel>('السنة الأولى');
  const [major, setMajor] = useState('هندسة الميكاترونكس');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAlreadyRegistered(false);

    if (!name.trim()) {
      setError('يرجى إدخال اسم الطالب الكامل.');
      return;
    }

    if (!phone.trim()) {
      setError('يرجى إدخال رقم الهاتف للتواصل وتأكيد الحساب.');
      return;
    }

    if (!password || password.length < 4) {
      setError('يرجى إدخال كلمة مرور مكونة من 4 خانات على الأقل لحماية حسابك واستخدامها لتسجيل الدخول لاحقًا.');
      return;
    }

    const finalUniversity = selectedUni === 'جامعة أخرى' ? (customUni.trim() || 'جامعة يمنية') : selectedUni;

    setLoading(true);
    try {
      // Register student in backend
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          password: password,
          university: finalUniversity,
          studyLevel,
          major: major.trim() || 'هندسة الميكاترونكس',
          activationCode: activationCode.trim() || undefined,
          plan: 'monthly',
        }),
      });

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || 'استجابة غير متوقعة من الخادم.');
      }

      if (!res.ok) {
        if (data.alreadyRegistered) {
          setIsAlreadyRegistered(true);
        }
        setError(data.error || 'حدث خطأ أثناء تسجيل الحساب');
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('mct_auth_token', data.token);
      }

      if (data.student) {
        localStorage.setItem('mct_student', JSON.stringify(data.student));
      }

      // If already active or activation code succeeded, redirect directly to dashboard
      if (data.subscription?.isActivated || data.student?.isActivated) {
        if (onRegistrationSuccess && data.student && data.token) {
          onRegistrationSuccess(data.student, data.token);
          return;
        }
      }

      onProceedToPlans({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        password: password,
        university: finalUniversity,
        studyLevel,
        major: major.trim() || 'هندسة الميكاترونكس',
      });
    } catch (err: any) {
      let msg = err?.message || 'تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.';
      if (
        msg.includes('FUNCTION_INVOCATION_FAILED') ||
        msg.includes('500') ||
        msg.includes('Server error') ||
        msg.includes('server error') ||
        msg.includes('bom1') ||
        msg.includes('<!DOCTYPE') ||
        msg.includes('<html')
      ) {
        msg = 'الخادم قيد التهيئة وتأكيد البيانات. يرجى إعادة المحاولة الآن أو تسجيل الدخول مباشرة.';
        setIsAlreadyRegistered(true);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        {/* Top Interactive Platform Instructions & Guide Banner */}
        {onOpenGuide && (
          <div className="p-4.5 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-lg space-y-2.5 border border-blue-400/40">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full">
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>دليل الاستخدام والتعليمات</span>
              </span>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-md">
                موصى به للطلاب الجدد 📖
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black leading-snug">
              كيفية استخدام الموقع والعمل فيه بالكامل؟
            </h3>
            <p className="text-xs text-blue-100 leading-relaxed font-medium">
              تعرّف بالتفصيل والدقة على طريقة عمل الخدمات: الدكتور الذكي، مرجع سيرواي، محاكي الدوائر، اشرح لي درسي، والحاسبة العلمية.
            </p>
            <button
              type="button"
              onClick={onOpenGuide}
              className="w-full mt-1 py-2.5 px-4 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>اقرأ دليل التعليمات وطريقة العمل بالموقع بالتفصيل 📖</span>
            </button>
          </div>
        )}

        {/* Title */}
        <div className="text-center space-y-2">
          <AcademyLogo variant="icon" size="lg" className="mx-auto" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            تسجيل بيانات الطالب
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            أدخل بياناتك للانتقال إلى اختيار خطة الاشتراك وتفعيل حسابك
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs sm:text-sm border border-rose-200 dark:border-rose-900 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {(isAlreadyRegistered || onOpenLogin) && (
              <div className="pt-1 pr-6">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                >
                  <span>تسجيل الدخول إلى حسابك الآن</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. اسم الطالب الكامل */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              اسم الطالب الكامل <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم الثلاثي أو الرباعي"
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
          </div>

          {/* 2. رقم الهاتف */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              رقم الهاتف (واتساب) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="رقم الهاتف المسجل"
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="ltr"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              يُستخدم لتسجيل الدخول والتواصل مع إدارة الأكاديمية عبر واتساب
            </p>
          </div>

          {/* 3. كلمة المرور */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              كلمة المرور للحساب <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="ltr"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">
              ⚠️ مهم جداً: احفظ كلمة المرور جيداً! ستسجل الدخول بها دائماً ولن يتمكن أحد من الدخول برقمك بدونها.
            </p>
          </div>

          {/* 4. كود التفعيل (اختياري) */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
              كود التفعيل <span className="text-xs text-amber-700/80 dark:text-amber-400/80 font-normal">(اختياري – إن كان لديك كود مسبقاً لتأكيد الاشتراك فوراً)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                placeholder="مثال: AS-XXXX أو AB-XXXX"
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-amber-500 text-center tracking-wider"
                dir="ltr"
              />
              <KeyRound className="w-4 h-4 text-amber-600 absolute right-3.5 top-3" />
            </div>
            <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80">
              كود التفعيل يُستخدم لتأكيد وتفعيل الاشتراك لأول مرة فقط، وستسجل الدخول دائماً بكلمة المرور الخاصة بك.
            </p>
          </div>

          {/* 5. البريد الإلكتروني (إن أمكن) */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              البريد الإلكتروني <span className="text-xs text-slate-400 font-normal">(اختياري)</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني (اختياري)"
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="ltr"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
          </div>

          {/* 6. اسم الجامعة */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              اسم الجامعة <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedUni}
                onChange={(e) => setSelectedUni(e.target.value as UniversityOption)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                {UNIVERSITIES.map((uni) => (
                  <option key={uni} value={uni}>
                    {uni}
                  </option>
                ))}
              </select>
              <School className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>

            {selectedUni === 'جامعة أخرى' && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customUni}
                  onChange={(e) => setCustomUni(e.target.value)}
                  placeholder="اكتب اسم جامعتك يدويًا هنا..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* 6. المستوى الدراسي */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              المستوى الدراسي <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STUDY_LEVELS.map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setStudyLevel(level)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    studyLevel === level
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* 7. التخصص */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              التخصص <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="هندسة الميكاترونكس"
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Cpu className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              رجوع
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تسجيل الحساب...</span>
                </>
              ) : (
                <>
                  <span>متابعة لاختيار الخطة</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {onOpenLogin && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onOpenLogin}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                لديك حساب بالفعل؟ تسجيل الدخول
              </button>
            </div>
          )}

        </form>

      </div>
    </div>
  );
};
