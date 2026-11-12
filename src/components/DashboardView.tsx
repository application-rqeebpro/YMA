import React, { useState, useEffect, useMemo } from 'react';
import { StudentProfile, Subject, Lesson, ExplainLessonResult } from '../types';
import { calculatePersonalizedPath } from '../services/learningPathService';
import { 
  GraduationCap, 
  School, 
  Calendar, 
  Clock, 
  Cpu, 
  BookOpen, 
  Scale, 
  Ruler, 
  Binary, 
  Zap, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  Award,
  ChevronLeft,
  Bookmark,
  Camera,
  Layers,
  HelpCircle,
  KeyRound,
  MessageCircle,
  Lock,
  User,
  FileText,
  Bot,
  Edit3,
  Trash2,
  Compass,
  TrendingUp,
  Target,
  RotateCcw,
  Lightbulb,
  ArrowRight,
  Wrench,
  Calculator,
  Play,
  Video,
  Activity,
  Boxes,
} from 'lucide-react';

interface DashboardViewProps {
  student: StudentProfile;
  subjects: Subject[];
  lessons?: Lesson[];
  onNavigateToTab: (tab: any) => void;
  onSelectSubject: (subjectId: string) => void;
  onSelectLesson?: (lessonId: string) => void;
  onRenewSubscription: () => void;
  onOpenActivation?: () => void;
  onOpenSavedLesson?: (lesson: ExplainLessonResult) => void;
  onOpenProfile?: () => void;
  whatsappNumber?: string;
  onOpenExam?: (subject?: Subject, lesson?: Lesson) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  student,
  subjects,
  lessons = [],
  onNavigateToTab,
  onSelectSubject,
  onSelectLesson,
  onRenewSubscription,
  onOpenActivation,
  onOpenSavedLesson,
  onOpenProfile,
  whatsappNumber = '785500075',
  onOpenExam,
}) => {
  const isPending = !student.isActivated || student.subscriptionStatus === 'pending';
  const isExpired = student.isExpired || (student.remainingDays !== undefined && student.remainingDays <= 0);

  // Load saved explained lessons & personal notes for this student
  const [savedLessons, setSavedLessons] = useState<ExplainLessonResult[]>([]);
  const [studentNotes, setStudentNotes] = useState<Record<string, { text: string; lessonTitle?: string; updatedAt: string }>>({});

  useEffect(() => {
    try {
      const localKey = `mct_explained_lessons_${student.id}`;
      const saved = localStorage.getItem(localKey);
      if (saved) {
        setSavedLessons(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }

    // Fetch personal notes from database
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem('mct_auth_token');
        const res = await fetch(`/api/student/notes?studentId=${student.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data.notes) {
            setStudentNotes(data.notes);
          }
        }
      } catch (err) {
        console.warn('Failed to load notes from API:', err);
      }
    };

    fetchNotes();
  }, [student.id]);

  const handleContactWhatsApp = () => {
    const cleanNumber = whatsappNumber.startsWith('967') ? whatsappNumber : `967${whatsappNumber.replace(/^0+/, '')}`;
    const msg = `السلام عليكم إدارة الأكاديمية، أنا الطالب ${student.name}، أريد تأكيد الدفع وتفعيل حسابي.`;
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleToolClick = (tabName: string) => {
    if (isPending) {
      alert('حسابك في انتظار التفعيل بعد تأكيد الدفع من الإدارة. يرجى إدخال كود التفعيل أو التواصل معنا لتفعيل الحساب.');
      return;
    }
    if (isExpired) {
      alert('انتهت صلاحية اشتراكك. يرجى تجديد الاشتراك للوصول إلى المحتوى والأدوات.');
      return;
    }
    onNavigateToTab(tabName);
  };

  const handleSubjectClick = (subjectId: string) => {
    if (isPending) {
      alert('حسابك في انتظار التفعيل. المقررات التعليمية متاحة فور تفعيل الاشتراك.');
      return;
    }
    if (isExpired) {
      alert('انتهت صلاحية اشتراكك. يرجى التجديد لمتابعة الدروس.');
      return;
    }
    onSelectSubject(subjectId);
  };

  // Calculate dynamic personalized learning path data
  const pathData = useMemo(() => {
    return calculatePersonalizedPath(student, subjects, lessons);
  }, [student, subjects, lessons]);

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      
      {/* 1. Pending Subscription Notice Banner */}
      {isPending && (
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg animate-fade-in">
          <div className="flex items-center gap-3.5 text-center md:text-right">
            <div className="w-12 h-12 rounded-2xl bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                حسابك في انتظار التفعيل بعد تأكيد الدفع من الإدارة.
              </h3>
              <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                تواصل مع الإدارة عبر واتساب لإرسال إشعار السداد أو أدخل كود التفعيل إذا استلمته.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handleContactWhatsApp}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>تأكيد الدفع عبر واتساب</span>
            </button>

            {onOpenActivation && (
              <button
                onClick={onOpenActivation}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <KeyRound className="w-4 h-4" />
                <span>إدخال كود التفعيل</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Expiry Warning Notice if expired */}
      {!isPending && isExpired && (
        <div className="p-5 sm:p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3 text-center sm:text-right">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                انتهى اشتراكك، يرجى التجديد للوصول إلى المحتوى.
              </h3>
              <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-300 mt-0.5">
                تواصل مع الإدارة لتجديد الاشتراك ومتابعة مسيرتك التعليمية.
              </p>
            </div>
          </div>
          <button
            onClick={onRenewSubscription}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تجديد الاشتراك عبر واتساب</span>
          </button>
        </div>
      )}

      {/* 3. Welcome & Student Overview Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 sm:p-8 shadow-2xl shadow-blue-900/15">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100">
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span>مرحبًا بك في لوحة تحكم الطالب — أكاديمية الميكاترونكس اليمنية</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              أهلاً بك يا مهندس {student.name} 🎓
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl">
              "لا تحفظ القانون، افهمه." جاهز اليوم لمواصلة فهم المفاهيم الفيزيائية والكهربائية وحل المسائل الهندسية؟
            </p>
            {onOpenProfile && (
              <div className="pt-1">
                <button
                  onClick={onOpenProfile}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer backdrop-blur-xs border border-white/20 shadow-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>تعديل بياناتي وكلمة المرور</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Subscription Status Pill */}
          <div className="w-full lg:w-auto p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between lg:justify-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-blue-200 block">حالة الاشتراك</span>
                <span className="text-lg font-black text-white">
                  {isPending ? 'بانتظار التفعيل' : isExpired ? 'منتهي' : `${student.remainingDays} يومًا متبقيًا`}
                </span>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              isPending 
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
            }`}>
              {student.subscriptionPlan === 'yearly' ? 'اشتراك سنوي' : 'اشتراك شهري'}
            </span>
          </div>

        </div>

        {/* Decorative background vectors */}
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 3.5. Personalized Learning Path & Recommendation Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-600/80 dark:border-blue-500 shadow-xl p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-600/25 shrink-0">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  مسار التعلم الشخصي الذكي
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${pathData.readinessColor}`}>
                  {pathData.readinessLabel}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                خارطة طريقك الأكاديمية المقترحة 🧭
              </h2>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('learning-path')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <span>استعراض الخارطة الكاملة</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Recommendation Box */}
        {pathData.primaryRecommendation && (
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 ${
            pathData.primaryRecommendation.recommendationType === 'remediation_review'
              ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
              : 'bg-gradient-to-br from-blue-50/60 to-indigo-50/60 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800/60'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold mb-1">
                  <span className={`px-2 py-0.5 rounded-md ${
                    pathData.primaryRecommendation.recommendationType === 'remediation_review'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {pathData.primaryRecommendation.recommendationType === 'remediation_review' ? '⚠️ تدارك وتثبيت' : 'الدرس التالي الموصى به 🎯'}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {pathData.primaryRecommendation.subject.name}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{pathData.primaryRecommendation.estimatedMinutes} دقيقة</span>
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {pathData.primaryRecommendation.title}
                </h3>
              </div>

              {onSelectLesson && (
                <button
                  onClick={() => onSelectLesson(pathData.primaryRecommendation!.lesson.id)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 shrink-0"
                >
                  <span>{pathData.primaryRecommendation.recommendationType === 'remediation_review' ? 'مراجعة الدرس وإعادة الاختبار' : 'ابدأ دراسة هذا الدرس الآن'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
              💡 <strong>سبب الاقتراح:</strong> {pathData.primaryRecommendation.reason}
            </p>
          </div>
        )}

        {/* Path Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] mb-0.5 font-bold">المنهاج المنجز</span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              {pathData.completionRate}%
            </span>
            <span className="text-[10px] text-slate-500 block">({pathData.completedCount} من {pathData.totalLessons} دروس)</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] mb-0.5 font-bold">معدل الاختبارات</span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              {pathData.averageQuizScore > 0 ? `${pathData.averageQuizScore}%` : '-'}
            </span>
            <span className="text-[10px] text-slate-500 block">{pathData.averageQuizScore >= 80 ? 'إتقان مرتفع 🌟' : 'استيعاب متوسط'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] mb-0.5 font-bold">المستوى الدراسي</span>
            <span className="text-base font-black text-slate-900 dark:text-white line-clamp-1">
              {student.studyLevel}
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 block">{student.major}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] mb-0.5 font-bold">الهدف الأسبوعي</span>
            <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
              {pathData.weeklyTarget.recommendedLessons} دروس
            </span>
            <span className="text-[10px] text-slate-500 block">خلال هذا الأسبوع</span>
          </div>
        </div>
      </div>

      {/* ======================================================================== */}
      {/* 4. MAIN ACADEMY SERVICES GRID - RE-ORDERED IN EXACT SEQUENCE 1 THROUGH 8 */}
      {/* 3D ELEVATED GLASSMORPHIC CARDS WITH VIBRANT MATCHED COLOR PALETTES        */}
      {/* ======================================================================== */}
      <div className="space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-purple-600/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>خدمات ومنافع أكاديمية الميكاترونكس الذكية</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold border border-purple-300 dark:border-purple-800">
                  8 خدمات متكاملة
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                بطاقات تفاعلية مرتفعة ثلاثية الأبعاد 3D مصممة لتغطية جميع احتياجات طالب الميكاترونكس
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToTab('daily-challenge')}
              className="px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-500/25 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-500 animate-bounce" />
              <span>تحدي اليوم 🏆</span>
            </button>
          </div>
        </div>

        {/* The 8 Services 3D Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* -------------------------------------------------------------------- */}
          {/* SERVICE 1: قاعة الدكتور الذكي (Smart Doctor View)                    */}
          {/* -------------------------------------------------------------------- */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 border-2 border-purple-500/60 p-6 sm:p-7 text-white shadow-2xl space-y-4 hover:border-purple-400 transition-all group transform hover:-translate-y-1">
            {/* 3D Elevated Number Badge */}
            <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-purple-600/30 backdrop-blur-md border border-purple-400/40 text-purple-200 font-black text-xl flex items-center justify-center shadow-inner pointer-events-none">
              01
            </div>

            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-xs font-bold text-purple-300">
                <GraduationCap className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>الخدمة الأولى • نظام الدكاترة التخصصيين</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>🎓 قاعة الدكتور الذكي</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black shadow-xs">
                  شرح كرتوني على السبورة 🎨
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed">
                ادخل القاعة وأدخل <strong>اسم دكتورك، تخصصك، واسم مادتك</strong> من قائمة مواد الميكاترونكس، وارفع صورة شخصية أو كرتونية لدكتورك، ثم ارفع درسك أو اكتب استفسارك ليتم <strong>الشرح الكرتوني التفاعلي بأسلوب Anime وكتابة بالطباشير مع صوت رجل عربي دافئ ونظيف!</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-purple-800/40 text-[11px] text-purple-200">
              <span className="px-2 py-0.5 rounded-md bg-white/10">👨‍🏫 تخصيص دكتورك والمادة</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">🖼️ رفع صورة كرتونية للدكتور</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">🎙️ نبرة رجل عربي رسمي</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">✏️ سبورة تفاعلية بالطباشير</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => handleToolClick('smart-doctor')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
              >
                <GraduationCap className="w-4 h-4 text-amber-300" />
                <span>دخول قاعة الدكتور الذكي 🎓</span>
              </button>
            </div>
          </div>

          {/* -------------------------------------------------------------------- */}
          {/* SERVICE 2: اشرح لي الدرس (Explain Lesson View)                        */}
          {/* -------------------------------------------------------------------- */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 border-2 border-blue-500/60 p-6 sm:p-7 text-white shadow-2xl space-y-4 hover:border-blue-400 transition-all group transform hover:-translate-y-1">
            {/* 3D Elevated Number Badge */}
            <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-blue-600/30 backdrop-blur-md border border-blue-400/40 text-blue-200 font-black text-xl flex items-center justify-center shadow-inner pointer-events-none">
              02
            </div>

            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-bold text-cyan-300">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>الخدمة الثانية • المدرس الذكي الشامل</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>✨ اشرح لي الدرس</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-blue-500 text-white font-black shadow-xs">
                  تحليل الصور و PDF 📷
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                ارفع <strong>صورة السبورة، أو ملزمتك، أو دفترك، أو ملف PDF</strong>، أو اكتب مسألتك مباشرة، وسيشرح المدرس الذكي الدرس فوراً مع استخراج <strong>القوانين، تحليل المسائل الخطوة بخطوة، وإنشاء ملخص مذاكرة جاهز للاختبار!</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-blue-800/40 text-[11px] text-blue-200">
              <span className="px-2 py-0.5 rounded-md bg-white/10">📷 صور السبورة والملازم</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">📄 ملفات PDF والأبحاث</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">📐 تفكيك المسائل الرياضية</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">💡 تلخيص مركز للاختبارات</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => handleToolClick('explain')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>ابدأ شرح درس اليوم 🚀</span>
              </button>
            </div>
          </div>

          {/* -------------------------------------------------------------------- */}
          {/* SERVICE 3: مختبر أدوات ومكتبات الميكاترونكس الذكية                    */}
          {/* -------------------------------------------------------------------- */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 border-2 border-cyan-500/60 p-6 sm:p-7 text-white shadow-2xl space-y-4 hover:border-cyan-400 transition-all group transform hover:-translate-y-1">
            {/* 3D Elevated Number Badge */}
            <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-cyan-600/30 backdrop-blur-md border border-cyan-400/40 text-cyan-200 font-black text-xl flex items-center justify-center shadow-inner pointer-events-none">
              03
            </div>

            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-xs font-bold text-cyan-300">
                <Wrench className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '9s' }} />
                <span>الخدمة الثالثة • المختبر الهندسي الشامل</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>🔧 مختبر ومكتبات الميكاترونكس الذكية</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-cyan-500 text-slate-950 font-black shadow-xs">
                  Circuit Wizard + أدوات 3D ⚡
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-cyan-100/90 leading-relaxed">
                مختبر ميكاترونكس تفاعلي يجمع بين <strong>مكتبات Circuit Wizard المعتمدة، طاولة أجهزة أدوات المعمل 3D (راسم الذبذبات DSO، مصدر الطاقة DC، الملتيميتر، مولد الترددات، والورنية الرقمية)، ألواح حقيقية (Arduino, ESP32, Raspberry Pi, Relays)، ونماذج مشاريع جاهزة!</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-cyan-900/40 text-[11px] text-cyan-200">
              <span className="px-2 py-0.5 rounded-md bg-white/10">⚡ مكتبة Circuit Wizard</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">📟 أجهزة قياس 3D تفاعلية</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">🧩 قطع وألواح حقيقية (Hardware)</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">🔍 فحص التوافق للأرجل 100%</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => handleToolClick('lab')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
              >
                <Wrench className="w-4 h-4 text-slate-950" />
                <span>دخول مختبر ومكتبات الميكاترونكس 🔧</span>
              </button>
            </div>
          </div>

          {/* -------------------------------------------------------------------- */}
          {/* SERVICE 4: محاكي الأردوينو والدوائر الإلكترونية                         */}
          {/* -------------------------------------------------------------------- */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 border-2 border-cyan-400/60 p-6 sm:p-7 text-white shadow-2xl space-y-4 hover:border-cyan-300 transition-all group transform hover:-translate-y-1">
            {/* 3D Elevated Number Badge */}
            <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-cyan-600/30 backdrop-blur-md border border-cyan-400/40 text-cyan-200 font-black text-xl flex items-center justify-center shadow-inner pointer-events-none">
              04
            </div>

            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-xs font-bold text-cyan-300">
                <Bot className="w-4 h-4 text-cyan-300" />
                <span>الخدمة الرابعة • محاكي التجارب البرمجية</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>🤖 محاكي الأردوينو والدوائر الإلكترونية</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-cyan-500 text-slate-950 font-black shadow-xs">
                  توصيل أسلاك + كود C++
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-cyan-100/90 leading-relaxed">
                قم بتركيب الأجزاء وتوصيل الأسلاك افتراضياً على لوحة Breadboard، واكتب كود Arduino بلغة C++ وشاهده <strong>يعمل مباشرة مع محاكاة حية لإشارات الحساسات والمحركات وتركيب الدوائر الرقمية!</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-cyan-900/40 text-[11px] text-cyan-200">
              <span className="px-2 py-0.5 rounded-md bg-white/10">🔌 توصيل الأسلاك تفاعلياً</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">💻 محرر كود C++ مع أخطاء</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">🕹️ أزرار ومحركات ومحاكاة</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">⚡ Serial Monitor حي</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => handleToolClick('arduino')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-cyan-600/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
              >
                <Bot className="w-4 h-4 text-cyan-300" />
                <span>فتح محاكي الأردوينو والدوائر 🤖</span>
              </button>
            </div>
          </div>

          {/* -------------------------------------------------------------------- */}
          {/* SERVICE 5: منشئ التكليفات الهندسية                                    */}
          {/* -------------------------------------------------------------------- */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/60 p-6 sm:p-7 text-white shadow-2xl space-y-4 hover:border-emerald-400 transition-all group transform hover:-translate-y-1">
            {/* 3D Elevated Number Badge */}
            <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-emerald-600/30 backdrop-blur-md border border-emerald-400/40 text-emerald-200 font-black text-xl flex items-center justify-center shadow-inner pointer-events-none">
              05
            </div>

            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-xs font-bold text-emerald-300">
                <FileText className="w-4 h-4 text-amber-300" />
                <span>الخدمة الخامسة • المساعد الأكاديمي للتقارير</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                <span>📄 منشئ التكليفات الهندسية</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-emerald-500 text-white font-black shadow-xs">
                  تصدير PDF رسمية 📄
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                أنشئ <strong>تقارير المعامل والواجبات الهندسية ومشاريع التخرج والـ PLC</strong> بضغطة زر، مع غلاف جامعي معتمد، محرر معادلات وتفاصيل دقيقة، وإمكانية تصدير ملف <strong>PDF متعدد الصفحات جاهز للطباعة والتسليم!</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-900/40 text-[11px] text-emerald-200">
              <span className="px-2 py-0.5 rounded-md bg-white/10">🧪 تقارير تجارب المختبرات</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">🎓 غلاف أكاديمي باسم جامعتك</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">📝 محرر تفاعلي للتعديل</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">🖨️ تصدير PDF للطباعة</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => handleToolClick('assignments')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
              >
                <FileText className="w-4 h-4 text-amber-300" />
                <span>فتح منشئ التكليفات 📄</span>
              </button>
            </div>
          </div>

          {/* -------------------------------------------------------------------- */}
          {/* SERVICE 6: نماذج الاختبارات والامتحانات الجامعية                       */}
          {/* -------------------------------------------------------------------- */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-orange-950 border-2 border-amber-500/60 p-6 sm:p-7 text-white shadow-2xl space-y-4 hover:border-amber-400 transition-all group transform hover:-translate-y-1">
            {/* 3D Elevated Number Badge */}
            <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-amber-600/30 backdrop-blur-md border border-amber-400/40 text-amber-200 font-black text-xl flex items-center justify-center shadow-inner pointer-events-none">
              06
            </div>

            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-xs font-bold text-amber-300">
                <Award className="w-4 h-4 text-amber-400" />
                <span>الخدمة السادسة • بنك امتحانات الجامعات اليمنية</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                <span>📑 نماذج الاختبارات والامتحانات</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black shadow-xs">
                  سلم الدرجات + PDF/PNG
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                استعرض <strong>امتحانات نهائية ونصفية وكويزات متوقعة</strong> مع أسئلة الاختيار من متعدد والمسائل الحسابية و<strong>سلم الحلول النموذجية والدقيقة</strong>، ونزلها فوراً كملف PDF عالي الجودة للطباعة أو كصورة للتداول!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-900/40 text-[11px] text-amber-200">
              <span className="px-2 py-0.5 rounded-md bg-white/10">🎓 امتحانات نهائية (100 درجة)</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">📋 امتحانات نصفية (50 درجة)</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">✅ سلم الإجابات والتصحيح</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">🖼️ تنزيل كـ PDF أو صورة PNG</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {onOpenExam ? (
                <button
                  onClick={() => onOpenExam(subjects[0])}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
                >
                  <FileText className="w-4 h-4 text-slate-950" />
                  <span>استعراض نماذج الامتحانات 📑</span>
                </button>
              ) : (
                <button
                  onClick={() => handleToolClick('subjects')}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-slate-950" />
                  <span>فتح بنك الأسئلة والاختبارات 📑</span>
                </button>
              )}
            </div>
          </div>

          {/* -------------------------------------------------------------------- */}
          {/* SERVICE 7: مرجع سيرواي الدولي (Serway Physics Reference)            */}
          {/* -------------------------------------------------------------------- */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 border-2 border-blue-500/60 p-6 sm:p-7 text-white shadow-2xl space-y-4 hover:border-blue-400 transition-all group transform hover:-translate-y-1">
            {/* 3D Elevated Number Badge */}
            <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-blue-600/30 backdrop-blur-md border border-blue-400/40 text-blue-200 font-black text-xl flex items-center justify-center shadow-inner pointer-events-none">
              07
            </div>

            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-bold text-blue-200">
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>الخدمة السابعة • المرجع الأكاديمي الدولي</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                <span>📘 مرجع سيرواي (Serway) الدولي</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-black shadow-xs">
                  Serway Physics RAG 🔍
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                تصفح الكتاب الدولي المعتمد في جامعات العالم <strong>Physics for Scientists and Engineers — Serway</strong>، مع محرك <strong>البحث الذكي داخل صفحات الفصول، واستخراج القوانين والمسائل والشرح الأكاديمي!</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-blue-900/40 text-[11px] text-blue-200">
              <span className="px-2 py-0.5 rounded-md bg-white/10">🔍 بحث RAG داخل الفصول</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">📘 فصول المتجهات والحركة والكهرباء</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">🎓 ربط مع قاعة الدكتور الذكي</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">⚡ استخراج المعطيات فوراً</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => handleToolClick('references')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-700 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>تصفح مرجع سيرواي الدولي 📘</span>
              </button>
            </div>
          </div>

          {/* -------------------------------------------------------------------- */}
          {/* SERVICE 8: مكتبة الفيديوهات التعليمية (Video Library View)           */}
          {/* -------------------------------------------------------------------- */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-950 via-slate-900 to-rose-950 border-2 border-red-500/60 p-6 sm:p-7 text-white shadow-2xl space-y-4 hover:border-red-400 transition-all group transform hover:-translate-y-1">
            {/* 3D Elevated Number Badge */}
            <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-red-600/30 backdrop-blur-md border border-red-400/40 text-red-200 font-black text-xl flex items-center justify-center shadow-inner pointer-events-none">
              08
            </div>

            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-xs font-bold text-red-200">
                <Play className="w-4 h-4 text-red-400 fill-red-400" />
                <span>الخدمة الثامنة • المحاضرات المرئية المفهرسة</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                <span>🎬 مكتبة الفيديوهات التعليمية</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-red-600 text-white font-black shadow-xs">
                  Timestamps + قوانين
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-red-100/90 leading-relaxed">
                مكتبة المحاضرات الشاملة لمقررات الميكاترونكس (الفيزياء، الدوائر، برمجة C++، أردوينو) مع <strong>محاور زمنية دقيقة (Timestamps)، تلخيص القوانين، وأسئلة تدريبية تفاعلية!</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-900/40 text-[11px] text-red-200">
              <span className="px-2 py-0.5 rounded-md bg-white/10">⏱️ محاور زمنية دقيقة بالدقيقة</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">📘 فيزياء 1 (سيرواي)</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">⚡ دوائر KCL و KVL</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10">🤖 برمجة C++ والمتحكمات</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => handleToolClick('videos')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-red-600/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>شاهد مكتبة الفيديوهات 🎬</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 5. Student Profile Information Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>معلومات الطالب والاشتراك الأكاديمي</span>
          </h2>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
            isPending 
              ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300' 
              : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
          }`}>
            الحالة: {isPending ? 'بانتظار التفعيل' : isExpired ? 'منتهي' : 'نشط ومفعل'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs sm:text-sm">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] mb-1">الجامعة</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1" title={student.university}>
              {student.university}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] mb-1">المستوى</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {student.studyLevel}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] mb-1">التخصص</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {student.major}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] mb-1">تاريخ البدء</span>
            <span className="font-bold text-slate-800 dark:text-slate-200" dir="ltr">
              {student.subscriptionStartDate ? new Date(student.subscriptionStartDate).toLocaleDateString('en-GB') : '-'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] mb-1">تاريخ الانتهاء</span>
            <span className="font-bold text-slate-800 dark:text-slate-200" dir="ltr">
              {student.subscriptionEndDate ? new Date(student.subscriptionEndDate).toLocaleDateString('en-GB') : '-'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 dark:text-slate-500 block text-[11px] mb-1">الأيام المتبقية</span>
            <span className={`font-extrabold flex items-center gap-1 ${isPending ? 'text-amber-600' : isExpired ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
              <span className={`w-2 h-2 rounded-full ${isPending ? 'bg-amber-500' : isExpired ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              <span>{isPending ? 'بانتظار التفعيل' : `${student.remainingDays || 0} يوم`}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 6. Quick Access Tools Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>الأدوات الهندسية والوصول السريع</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <button
            onClick={() => handleToolClick('subjects')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 text-right space-y-2 group transition-all cursor-pointer shadow-xs relative"
          >
            {isPending && <Lock className="w-3.5 h-3.5 absolute top-3 left-3 text-slate-400" />}
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">المواد الدراسية</div>
              <div className="text-[11px] text-slate-500">مناهج السنة الأولى</div>
            </div>
          </button>

          <button
            onClick={() => handleToolClick('formulas')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 text-right space-y-2 group transition-all cursor-pointer shadow-xs relative"
          >
            {isPending && <Lock className="w-3.5 h-3.5 absolute top-3 left-3 text-slate-400" />}
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">محلل القوانين</div>
              <div className="text-[11px] text-slate-500">تحليل الأبعاد والرموز</div>
            </div>
          </button>

          <button
            onClick={() => handleToolClick('units')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-right space-y-2 group transition-all cursor-pointer shadow-xs relative"
          >
            {isPending && <Lock className="w-3.5 h-3.5 absolute top-3 left-3 text-slate-400" />}
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">محلل الوحدات</div>
              <div className="text-[11px] text-slate-500">تحويلات خطوة بخطوة</div>
            </div>
          </button>

          <button
            onClick={() => handleToolClick('circuits')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 text-right space-y-2 group transition-all cursor-pointer shadow-xs relative"
          >
            {isPending && <Lock className="w-3.5 h-3.5 absolute top-3 left-3 text-slate-400" />}
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">الدوائر الكهربائية 1</div>
              <div className="text-[11px] text-slate-500">أوم ومجزئ الجهد</div>
            </div>
          </button>

          <button
            onClick={() => handleToolClick('math')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 text-right space-y-2 group transition-all cursor-pointer shadow-xs relative"
          >
            {isPending && <Lock className="w-3.5 h-3.5 absolute top-3 left-3 text-slate-400" />}
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Binary className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">الرياضيات الهندسية</div>
              <div className="text-[11px] text-slate-500">معادلات ومتجهات</div>
            </div>
          </button>

          <button
            onClick={() => handleToolClick('calculator')}
            className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/60 dark:to-indigo-950/60 border-2 border-purple-500/50 hover:border-purple-600 text-right space-y-2 group transition-all cursor-pointer shadow-xs relative"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs sm:text-sm text-purple-900 dark:text-purple-200 flex items-center gap-1">
                <span>الحاسبة العلمية</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-600 text-white font-bold">علمية 🧮</span>
              </div>
              <div className="text-[11px] text-purple-600 dark:text-purple-400">كسور، زوايا، أعداد مركبة، وشرح الحل</div>
            </div>
          </button>

        </div>
      </div>

      {/* 6.5. دفتر ملاحظاتي الشخصية المخزنة */}
      {Object.keys(studentNotes).length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-500" />
              <span>دفتر ملاحظاتي الشخصية على الدروس ({Object.keys(studentNotes).length})</span>
            </h2>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              مخزنة بسيرفر الأكاديمية 💾
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(studentNotes).map(([lessonId, note]) => (
              <div
                key={lessonId}
                className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 space-y-2.5 shadow-xs hover:border-amber-400 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{note.lessonTitle || lessonId}</span>
                  </span>
                  {note.updatedAt && (
                    <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-mono">
                      {new Date(note.updatedAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-100 dark:border-amber-900/40 line-clamp-3">
                  {note.text}
                </p>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleToolClick('subjects')}
                    className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>فتح الدرس للتعديل</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Curriculum Subjects Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>المقررات الدراسية المتاحة (الفصل الأول)</span>
          </h2>
          <button
            onClick={() => handleToolClick('subjects')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>عرض كل المواد والدروس</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => handleSubjectClick(subject.id)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/80 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 relative"
            >
              {isPending && <Lock className="w-4 h-4 absolute top-4 left-4 text-slate-400" />}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {subject.code}
                </span>
                <span className="text-xs text-slate-400">{subject.semester}</span>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {subject.name}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {subject.englishName}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {subject.description}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
