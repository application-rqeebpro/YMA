import React, { useState, useMemo } from 'react';
import { StudentProfile, Subject, Lesson, LearningTrackId } from '../types';
import { calculatePersonalizedPath } from '../services/learningPathService';
import {
  Compass,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Zap,
  Atom,
  Binary,
  Bot,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Target,
  FileText,
  Lightbulb,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

interface PersonalizedLearningPathViewProps {
  student: StudentProfile;
  subjects: Subject[];
  lessons: Lesson[];
  onSelectLesson: (lessonId: string) => void;
  onSelectSubject?: (subjectId: string) => void;
  onNavigateToTool?: (toolId: string) => void;
  onBackToDashboard?: () => void;
}

export const PersonalizedLearningPathView: React.FC<PersonalizedLearningPathViewProps> = ({
  student,
  subjects,
  lessons,
  onSelectLesson,
  onSelectSubject,
  onNavigateToTool,
  onBackToDashboard,
}) => {
  const [activeTrack, setActiveTrack] = useState<LearningTrackId>('curriculum');

  // Compute adaptive personalized path data
  const pathData = useMemo(() => {
    return calculatePersonalizedPath(student, subjects, lessons);
  }, [student, subjects, lessons]);

  // Filter milestones based on selected track
  const filteredMilestones = useMemo(() => {
    if (activeTrack === 'curriculum') {
      return pathData.milestones;
    }
    if (activeTrack === 'circuits') {
      return pathData.milestones.filter(m => m.subjectId.includes('circuit'));
    }
    if (activeTrack === 'physics-mechanics') {
      return pathData.milestones.filter(m => m.subjectId.includes('phys') || m.subjectId.includes('math'));
    }
    if (activeTrack === 'robotics-programming') {
      return pathData.milestones.filter(m => m.subjectId.includes('prog') || m.subjectId.includes('eng'));
    }
    if (activeTrack === 'remediation') {
      return pathData.milestones.filter(m => m.status === 'review_needed');
    }
    return pathData.milestones;
  }, [activeTrack, pathData.milestones]);

  const hasRemediation = pathData.remediationItems.length > 0;

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-right" dir="rtl">
      
      {/* 1. Header & Title Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-blue-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-bold text-cyan-300">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>خارطة طريق تعليمية ذكية وتكيفية</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>مسار التعلم الشخصي</span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-black shadow-xs">
                مخصص لك
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              يقترح عليك النظام الدروس التالية والاختبارات المستهدفة بناءً على مستواك في <strong>{student.university}</strong>، ومعدل إجاباتك في الاختبارات القصيرة، لضمان استيعاب عميق ورفع درجاتك الجامعية.
            </p>
          </div>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 self-start md:self-center"
            >
              <span>العودة للرئيسية</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Decorative vectors */}
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. Key Academic Indicators (Metrics Row) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Progress Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold">إنجاز المنهاج</span>
            <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {pathData.completionRate}%
            </span>
            <span className="text-xs text-slate-400">
              ({pathData.completedCount} من {pathData.totalLessons} دروس)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${pathData.completionRate}%` }}
            />
          </div>
        </div>

        {/* Quiz Mastery Average */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold">معدل الاختبارات</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {pathData.averageQuizScore > 0 ? `${pathData.averageQuizScore}%` : '-'}
            </span>
            <span className="text-xs text-slate-400">
              {pathData.averageQuizScore >= 80 ? 'إتقان ممتاز 🌟' : pathData.averageQuizScore >= 60 ? 'جيد جداً' : 'بحاجة لرفع المعدل'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            متوسط درجاتك في أسئلة الفهم السريعة
          </p>
        </div>

        {/* Academic Readiness Status */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold">الجاهزية الأكاديمية</span>
            <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <span className={`inline-block px-3 py-1 rounded-xl text-xs sm:text-sm font-black border ${pathData.readinessColor}`}>
              {pathData.readinessLabel}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            مقياس التمكن للمستوى {student.studyLevel}
          </p>
        </div>

        {/* Weekly Target Goal */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold">الهدف الأسبوعي</span>
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>{pathData.weeklyTarget.recommendedLessons} دروس</span>
            <span className="text-xs text-slate-400 font-normal">({pathData.weeklyTarget.recommendedHours} ساعات)</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
            {pathData.weeklyTarget.statusText}
          </p>
        </div>

      </div>

      {/* 3. Featured Next Step Hero Card (الدرس المقترح التالي) */}
      {pathData.primaryRecommendation && (
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-500 dark:border-blue-500 shadow-lg p-5 sm:p-7 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 ${
                pathData.primaryRecommendation.recommendationType === 'remediation_review'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              }`}>
                {pathData.primaryRecommendation.recommendationType === 'remediation_review' ? (
                  <RotateCcw className="w-6 h-6 animate-spin" style={{ animationDuration: '10s' }} />
                ) : (
                  <Sparkles className="w-6 h-6" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    pathData.primaryRecommendation.recommendationType === 'remediation_review'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                  }`}>
                    {pathData.primaryRecommendation.recommendationType === 'remediation_review'
                      ? '⚠️ تدارك وتثبيت المفهوم'
                      : pathData.primaryRecommendation.recommendationType === 'starter'
                      ? '🏁 نقطة البداية الموصى بها'
                      : '🚀 خطوتك التالية في المسار'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {pathData.primaryRecommendation.subject.name}
                  </span>
                </div>

                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {pathData.primaryRecommendation.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>وقت القراءة المتوقع: {pathData.primaryRecommendation.estimatedMinutes} دقيقة</span>
            </div>
          </div>

          {/* Rationale & Explanation */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>لماذا يقترح النظام هذا الدرس الآن؟</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {pathData.primaryRecommendation.reason}
            </p>
          </div>

          {/* Key Topics Covered */}
          {pathData.primaryRecommendation.keyTopics.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-400">أبرز المفاهيم المغطاة:</span>
              {pathData.primaryRecommendation.keyTopics.map((topic, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-100 dark:border-blue-900/40">
                  {topic}
                </span>
              ))}
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onSelectLesson(pathData.primaryRecommendation!.lesson.id)}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <span>{pathData.primaryRecommendation.recommendationType === 'remediation_review' ? 'مراجعة الدرس وإعادة الاختبار' : 'ابدأ دراسة هذا الدرس الآن'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {pathData.primaryRecommendation.relatedTool && onNavigateToTool && (
              <button
                onClick={() => onNavigateToTool(pathData.primaryRecommendation!.relatedTool!)}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2"
              >
                {pathData.primaryRecommendation.relatedTool === 'arduino' ? (
                  <>
                    <Bot className="w-4 h-4 text-cyan-500" />
                    <span>تطبيق عملي بمحاكي Arduino</span>
                  </>
                ) : pathData.primaryRecommendation.relatedTool === 'formulas' ? (
                  <>
                    <Atom className="w-4 h-4 text-blue-500" />
                    <span>تحليل قوانين الدرس ووحداته</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-emerald-500" />
                    <span>إنشاء تكليف هندسي للدرس</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Adaptive AI Academic Coach Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border border-indigo-200 dark:border-indigo-800 flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <Sparkles className="w-5 h-5 text-amber-300" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-indigo-950 dark:text-indigo-200">
              توجيه المرشد الأكاديمي الذكي
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-mono">
              توجيه مخصص
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {pathData.aiAdvisorTip}
          </p>
        </div>
      </div>

      {/* 5. Remediation Alert (If student has low scores on any completed lesson) */}
      {hasRemediation && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span>دروس تحتاج إعادة تثبيت ومراجعة ({pathData.remediationItems.length})</span>
            </div>
            <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
              الدرجة أقل من 65% في الاختبار القصير
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pathData.remediationItems.map(item => (
              <div
                key={item.lesson.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                    {item.lesson.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>{item.subject.name}</span>
                    <span className="text-amber-600 font-bold">الدرجة السابقة: {item.scoreAchieved}%</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectLesson(item.lesson.id)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer transition-all flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة المراجعة</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Tracks Navigation Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>خارطة الدروس والمراحل الأكاديمية</span>
          </h2>
          <span className="text-xs text-slate-400">
            {filteredMilestones.length} مراحل دراسية
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTrack('curriculum')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              activeTrack === 'curriculum'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>المسار العام الشامل</span>
          </button>

          <button
            onClick={() => setActiveTrack('circuits')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              activeTrack === 'circuits'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>الدوائر الكهربائية</span>
          </button>

          <button
            onClick={() => setActiveTrack('physics-mechanics')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              activeTrack === 'physics-mechanics'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Atom className="w-4 h-4" />
            <span>الفيزياء والرياضيات</span>
          </button>

          <button
            onClick={() => setActiveTrack('robotics-programming')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              activeTrack === 'robotics-programming'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>البرمجة والميكاترونكس</span>
          </button>

          {hasRemediation && (
            <button
              onClick={() => setActiveTrack('remediation')}
              className={`px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                activeTrack === 'remediation'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-300 dark:border-amber-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>بحاجة مراجعة ({pathData.remediationItems.length})</span>
            </button>
          )}
        </div>

        {/* 7. Milestones Roadmap List */}
        <div className="space-y-3">
          {filteredMilestones.map((milestone, idx) => {
            const isCompleted = milestone.status === 'completed';
            const isReview = milestone.status === 'review_needed';
            const isCurrent = milestone.status === 'current';

            return (
              <div
                key={milestone.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCurrent
                    ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 shadow-md ring-1 ring-blue-500'
                    : isReview
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                    : isCompleted
                    ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
                }`}
              >
                
                {/* Milestone Info */}
                <div className="flex items-start sm:items-center gap-3.5">
                  {/* Step Number Badge */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black shrink-0 text-sm ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isReview
                      ? 'bg-amber-500 text-slate-950'
                      : isCurrent
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isReview ? (
                      <RotateCcw className="w-5 h-5" />
                    ) : (
                      <span>{milestone.stepNumber}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {milestone.category}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-600 text-white">
                          الدرس التالي المقترح 🎯
                        </span>
                      )}
                      {milestone.score !== undefined && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          milestone.score >= 80 
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : milestone.score >= 65
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}>
                          نتيجة الاختبار: {milestone.score}%
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      {milestone.lessonTitle}
                    </h3>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                {/* Open Lesson CTA Button */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => onSelectLesson(milestone.lessonId)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : isReview
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : isCompleted
                        ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    <span>{isCompleted ? 'مراجعة الدرس' : isReview ? 'تثبيت واختبار' : 'فتح الدرس'}</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Strengths & Acquired Engineering Skills */}
      {pathData.strengths.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
            <Award className="w-5 h-5 text-amber-500" />
            <span>نقاط القوة والأوسمة الهندسية المكتسبة</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pathData.strengths.map((item, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-emerald-950 dark:text-emerald-200">
                    {item.skill}
                  </h4>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                    {item.subjectName}
                  </span>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-500 text-white">
                  {item.score}% 🌟
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
