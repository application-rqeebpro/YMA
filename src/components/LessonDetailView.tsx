import React, { useState } from 'react';
import { Lesson, QuizQuestion } from '../types';
import { LessonNoteWidget } from './LessonNoteWidget';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Scale, 
  Ruler, 
  Lightbulb, 
  AlertTriangle, 
  HelpCircle, 
  Award, 
  Clock, 
  Check, 
  X, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  Play,
  Video
} from 'lucide-react';

interface LessonDetailViewProps {
  lesson: Lesson;
  onBack: () => void;
  onOpenAiForLesson: (lessonTitle: string) => void;
  onMarkComplete: (lessonId: string, quizScore?: number) => void;
  isCompleted: boolean;
  savedQuizScore?: number;
  onOpenExam?: (lesson: Lesson) => void;
}

export const LessonDetailView: React.FC<LessonDetailViewProps> = ({
  lesson,
  onBack,
  onOpenAiForLesson,
  onMarkComplete,
  isCompleted,
  savedQuizScore,
  onOpenExam,
}) => {
  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | number | boolean>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(savedQuizScore !== undefined);
  const [quizScore, setQuizScore] = useState<number>(savedQuizScore || 0);
  const [revealedPracticeHints, setRevealedPracticeHints] = useState<Record<number, boolean>>({});
  const [revealedPracticeSolutions, setRevealedPracticeSolutions] = useState<Record<number, boolean>>({});

  // Active sub-navigation tab for quick jumping inside the 15 sections
  const [activeSectionId, setActiveSectionId] = useState<string>('intro');

  const handleSelectQuizAnswer = (qId: string, ans: string | number | boolean) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: ans,
    }));
  };

  const handleCalculateQuizScore = () => {
    if (!lesson.quiz || lesson.quiz.length === 0) return;

    let correctCount = 0;
    lesson.quiz.forEach((q) => {
      const studentAns = selectedAnswers[q.id];
      if (studentAns !== undefined) {
        if (studentAns === q.correctAnswer) {
          correctCount++;
        } else if (typeof q.correctAnswer === 'number' && q.options && studentAns === q.options[q.correctAnswer]) {
          correctCount++;
        }
      }
    });

    const percentage = Math.round((correctCount / lesson.quiz.length) * 100);
    setQuizScore(percentage);
    setQuizSubmitted(true);
    onMarkComplete(lesson.id, percentage);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const toggleHint = (idx: number) => {
    setRevealedPracticeHints((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleSolution = (idx: number) => {
    setRevealedPracticeSolutions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Top Header with Breadcrumbs & Action */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>الرجوع للدروس</span>
          </button>

          <div className="flex items-center gap-2">
            {onOpenExam && (
              <button
                onClick={() => onOpenExam(lesson)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
                title="استخراج نموذج اختبار رسمي متوقع لهذا الدرس كصورة أو ملف PDF"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>نموذج اختبار الدرس (PDF / صورة)</span>
              </button>
            )}

            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{lesson.readingTimeMinutes} دقيقة</span>
            </span>

            {isCompleted ? (
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>أتممت هذا الدرس</span>
              </span>
            ) : (
              <button
                onClick={() => onMarkComplete(lesson.id)}
                className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
              >
                تحديد كمكتمل
              </button>
            )}
          </div>
        </div>

        {/* 1. اسم الدرس */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-extrabold">
              الدرس {lesson.order}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              المنهج اليمني المعتمد - ميكاترونكس
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {lesson.title}
          </h1>
        </div>

        {/* Quick section jumps navigation bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800 no-scrollbar text-xs">
          <a href="#section-intro" className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap font-medium hover:text-blue-600">
            الشرح المبسط
          </a>
          <a href="#section-terms" className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap font-medium hover:text-blue-600">
            المصطلحات والتشبيهات
          </a>
          <a href="#section-formulas" className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap font-medium hover:text-blue-600">
            تحليل القوانين والأبعاد
          </a>
          <a href="#section-examples" className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap font-medium hover:text-blue-600">
            أمثلة محلولة
          </a>
          <a href="#section-mistakes" className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap font-medium hover:text-blue-600">
            أخطاء شائعة
          </a>
          <a href="#section-practice" className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap font-medium hover:text-blue-600">
            تمارين تدريبية
          </a>
          <a href="#section-quiz" className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 whitespace-nowrap font-bold hover:underline">
            اختبار الدرس (Quiz)
          </a>
          <a href="#section-summary" className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap font-medium hover:text-blue-600">
            ملخص الدرس
          </a>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 📝 ملاحظاتي الشخصية على هذا الدرس */}
      {/* ============================================================ */}
      <LessonNoteWidget lessonId={lesson.id} lessonTitle={lesson.title} />

      {/* ============================================================ */}
      {/* 🎬 فيديو شرح الدرس والمحاضرة المرئية المعتمدة */}
      {/* ============================================================ */}
      {lesson.videoEmbedId && (
        <section id="section-video" className="bg-slate-950 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-xl space-y-4">
          <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black tracking-wider flex items-center gap-1">
                  <Play className="w-3 h-3 fill-white" />
                  <span>محاضرة مرئية معتمدة</span>
                </span>
                {lesson.videoDuration && (
                  <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{lesson.videoDuration}</span>
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-xl font-black text-white">
                {lesson.videoTitle || `فيديو شرح درس: ${lesson.title}`}
              </h3>
              {lesson.videoInstructor && (
                <p className="text-xs text-blue-200">
                  المُحاضر: {lesson.videoInstructor}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://www.youtube.com/watch?v=${lesson.videoEmbedId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <span>مشاهدة في YouTube</span>
              </a>
            </div>
          </div>

          {/* Responsive 16:9 Video Embed */}
          <div className="px-3 sm:px-6">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-800">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${lesson.videoEmbedId}?rel=0`}
                title={lesson.videoTitle || lesson.title}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Timestamps if available */}
          {lesson.videoTimestamps && lesson.videoTimestamps.length > 0 && (
            <div className="p-4 sm:p-6 bg-slate-900/60 border-t border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                ⏱️ محاور الفيديو والانتقال المباشر للمفهوم:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {lesson.videoTimestamps.map((ts, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5"
                  >
                    <span className="text-blue-400 font-mono font-bold">{ts.time}</span>
                    <span>{ts.title}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* 2 & 3. الشرح المبسط جدًا من الصفر + الفكرة الأساسية */}
      {/* ============================================================ */}
      <section id="section-intro" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* 3. الفكرة الأساسية */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 border border-blue-200/80 dark:border-blue-800/80 space-y-1">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-extrabold text-sm">
            <Lightbulb className="w-4 h-4" />
            <span>3. الفكرة الأساسية للدرس:</span>
          </div>
          <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base font-bold leading-relaxed">
            {lesson.coreConcept}
          </p>
        </div>

        {/* 2. شرح مبسط جدًا للدرس من الصفر */}
        <div className="space-y-2 pt-2">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>2. شرح مبسط جدًا (من الصفر وكأنك تدرسه لأول مرة):</span>
          </h2>
          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
            {lesson.simpleExplanation}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. شرح المصطلحات الصعبة مع تشبيهات من الواقع */}
      {/* ============================================================ */}
      <section id="section-terms" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>4. شرح المصطلحات الهندسية مع تشبيهات من الواقع:</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          ربط المصطلحات بتشبيهات عملية ملموسة حتى ترسخ في ذهنك ولا تنساها أبدًا:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(lesson.terms || []).map((t, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 dark:text-white text-base">
                  {t.term}
                </span>
                {(t as any).englishTerm && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold">
                    {(t as any).englishTerm}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {t.definition}
              </p>
              {(t.practicalAnalogy || (t as any).realWorldAnalogy) && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <span className="font-bold shrink-0">💡 تشبيه واقعي:</span>
                  <span>{t.practicalAnalogy || (t as any).realWorldAnalogy}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5, 6, 7, 8, 9. القوانين وتحليلها والرموز والوحدات والأبعاد */}
      {/* ============================================================ */}
      <section id="section-formulas" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            <span>5 - 9. القوانين المستخدمة وتحليلها الرياضي والأبعاد:</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            "لا تحفظ القانون، افهمه." - تفصيل الرموز، الوحدات، والأبعاد الفيزيائية
          </p>
        </div>

        <div className="space-y-6">
          {(lesson.formulas || []).map((f, fIdx) => (
            <div key={fIdx} className="rounded-2xl border-2 border-blue-100 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/10 p-5 sm:p-6 space-y-5">
              
              {/* Formula & Name Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-850 p-4 rounded-xl border border-blue-200 dark:border-blue-800 shadow-xs">
                <div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">5. القانون المستخدم</span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{f.name}</h3>
                </div>
                <div className="font-mono text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-center" dir="ltr">
                  {f.formulaText || (f as any).equation || f.formulaLatex}
                </div>
              </div>

              {/* 6. تحليل القانون (ما معناه؟ لماذا؟ متى نستخدمه؟ متى لا نستخدمه؟) */}
              <div className="space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>6. التحليل الهندسي للقانون:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-extrabold text-blue-600 block mb-1">ما معناه؟</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{f.meaning}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-extrabold text-indigo-600 block mb-1">لماذا نستخدمه؟</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{f.whyWeUseIt || (f as any).whyUse}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 block mb-1">متى نستخدمه؟</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{f.whenToUse}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
                    <span className="font-extrabold text-rose-700 dark:text-rose-400 block mb-1">متى لا نستخدمه؟</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{f.whenNotToUse}</p>
                  </div>
                </div>
              </div>

              {/* 7 & 8 & 9. شرح الرموز والوحدات والأبعاد */}
              <div className="space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-purple-500" />
                  <span>7 - 9. شرح الرموز والوحدات الدولية (SI) والأبعاد الفيزيائية:</span>
                </h4>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-right text-xs sm:text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="p-2.5">الرمز (Symbol)</th>
                        <th className="p-2.5">اسم الكمية الفيزيائية</th>
                        <th className="p-2.5">الوحدة الدولية (SI)</th>
                        <th className="p-2.5">الأبعاد الفيزيائية (Dimensions)</th>
                        <th className="p-2.5">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                      {(f.symbols || []).map((sym, sIdx) => (
                        <tr key={sIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-2.5 font-mono font-black text-blue-600 dark:text-blue-400 text-sm" dir="ltr">
                            {sym.symbol}
                          </td>
                          <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                            {sym.name}
                          </td>
                          <td className="p-2.5 font-mono text-emerald-600 dark:text-emerald-400" dir="ltr">
                            {sym.unit}
                          </td>
                          <td className="p-2.5 font-mono font-bold text-purple-600 dark:text-purple-400" dir="ltr">
                            {sym.dimension}
                          </td>
                          <td className="p-2.5 text-xs text-slate-500 dark:text-slate-400">
                            {sym.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {(f.dimensionsAnalysis?.verificationExplanation || (f as any).dimensionalProof) && (
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-200 flex items-center justify-between">
                    <span className="font-bold">تحليل تجانس الأبعاد (Dimensional Homogeneity):</span>
                    <span className="font-mono font-bold" dir="ltr">{f.dimensionsAnalysis?.verificationExplanation || (f as any).dimensionalProof}</span>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 10 & 11. أمثلة محلولة خطوة بخطوة مع خطوات الحل المرقمة */}
      {/* ============================================================ */}
      <section id="section-examples" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>10 & 11. أمثلة محلولة خطوة بخطوة مع خطوات الحل المرقمة:</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            تعلم منهجية المهندس في تفريغ المعطيات واختيار القانون والتعويض
          </p>
        </div>

        <div className="space-y-6">
          {(lesson.solvedExamples || []).map((ex, exIdx) => {
            const givenItems = ex.givenData || (ex as any).given || [];
            return (
              <div key={exIdx} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-5 sm:p-6 space-y-4">
                
                {/* Example Question */}
                <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                      مثال نموذجي {exIdx + 1}
                    </span>
                    {ex.title && (
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        {ex.title}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                    {ex.question}
                  </h3>
                </div>

                {/* Given & Required */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-extrabold text-blue-600 block mb-1">المعطيات (Given):</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300 font-mono" dir="ltr">
                      {givenItems.map((g: string, i: number) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-extrabold text-indigo-600 block mb-1">المطلوب والقانون المستخدم:</span>
                    <p className="text-slate-700 dark:text-slate-300 font-bold mb-1">المطلوب: {ex.required}</p>
                    {ex.formulaUsed && (
                      <p className="font-mono text-blue-600 dark:text-blue-400 font-bold" dir="ltr">{ex.formulaUsed}</p>
                    )}
                  </div>
                </div>

                {/* 11. خطوات الحل المرقمة بالتفصيل */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    11. خطوات الحل المرقمة:
                  </span>
                  <div className="space-y-2">
                    {(ex.steps || []).map((step: any, sIdx: number) => {
                      const desc = typeof step === 'string' ? step : step.description;
                      const formula = typeof step === 'object' ? step.formula : null;
                      const calc = typeof step === 'object' ? step.calculation : null;
                      const res = typeof step === 'object' ? step.result : null;

                      return (
                        <div key={sIdx} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs sm:text-sm">
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                              {desc}
                            </span>
                          </div>
                          {(formula || calc) && (
                            <div className="mr-9 font-mono text-xs bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 space-y-0.5" dir="ltr">
                              {formula && <div>{formula}</div>}
                              {calc && <div className="text-slate-600 dark:text-slate-300">{calc}</div>}
                            </div>
                          )}
                          {res && (
                            <div className="mr-9 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              النتيجة: {res}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Final Answer Banner */}
                <div className="p-3.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
                  <span className="font-extrabold text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
                    الناتج النهائي الصحيح مع الوحدة:
                  </span>
                  <span className="font-mono font-black text-sm sm:text-base text-emerald-700 dark:text-emerald-300" dir="ltr">
                    {ex.finalAnswer}
                  </span>
                </div>

                {/* Engineering tip */}
                {(ex.engineeringTip || (ex as any).engineeringNote) && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                    💡 ملاحظة هندسية: {ex.engineeringTip || (ex as any).engineeringNote}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 12. أخطاء شائعة يقع فيها الطلاب مع تصحيحها */}
      {/* ============================================================ */}
      <section id="section-mistakes" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <span>12. أخطاء شائعة يقع فيها الطلاب مع تصحيحها:</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          تجنب هذه الأفخاخ الشائعة في الاختبارات الجامعية لتضمن الدرجة الكاملة
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(lesson.commonMistakes || []).map((m, mIdx) => (
            <div key={mIdx} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 bg-slate-50 dark:bg-slate-800/60">
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <X className="w-4 h-4" />
                  <span>الخطأ الشائع:</span>
                </span>
                <p className="text-xs sm:text-sm text-rose-900 dark:text-rose-200 font-medium">
                  {m.mistake}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>التصحيح الصحيح:</span>
                </span>
                <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 font-medium">
                  {m.correction}
                </p>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 italic px-1">
                السبب: {m.why || (m as any).whyWrong}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 13. أسئلة تدريبية مع إمكانية إظهار الحل */}
      {/* ============================================================ */}
      <section id="section-practice" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <span>13. أسئلة تدريبية مع إمكانية إظهار التلميح والحل:</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          جرب حل المسألة بنفسك على ورقة أولاً، ثم استعن بالتلميح أو اكشف الحل للتأكد
        </p>

        <div className="space-y-4">
          {(lesson.practiceQuestions || []).map((q, qIdx) => {
            const hasHint = revealedPracticeHints[qIdx];
            const hasSol = revealedPracticeSolutions[qIdx];
            const solText = (q as any).answer || (q as any).solution;

            return (
              <div key={qIdx} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-relaxed">
                    مسألة تدريبية {qIdx + 1}: {q.question}
                  </h3>
                  {(q as any).difficulty && (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                      (q as any).difficulty === 'متوسط' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {(q as any).difficulty}
                    </span>
                  )}
                </div>

                {/* Hint Toggle */}
                {q.hint && (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleHint(qIdx)}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{hasHint ? 'إخفاء التلميح' : 'إظهار تلميح للحل'}</span>
                    </button>
                    {hasHint && (
                      <div className="mt-1.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
                        {q.hint}
                      </div>
                    )}
                  </div>
                )}

                {/* Solution Toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSolution(qIdx)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{hasSol ? 'إخفاء الحل النموذجي' : 'إظهار الحل النموذجي الكامل'}</span>
                    {hasSol ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {hasSol && (
                    <div className="mt-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-2">
                      <p className="leading-relaxed font-mono whitespace-pre-line" dir="ltr">
                        {solText}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 14. اختبار قصير في نهاية الدرس (Quiz) */}
      {/* ============================================================ */}
      <section id="section-quiz" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 dark:border-amber-700 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>تقييم الفهم الفوري</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              14. اختبار قصير في نهاية الدرس (Quiz):
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              أجب عن الأسئلة للتحقق من فهمك التام وحساب نتيجتك وحفظها بملفك
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenExam && (
              <button
                onClick={() => onOpenExam(lesson)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
                title="تصدير كنموذج امتحان رسمي مع الحلول والدرجات بصيغة PDF أو صورة"
              >
                <FileText className="w-4 h-4" />
                <span>نموذج امتحان متوقع (PDF / صورة) 📑</span>
              </button>
            )}

            {quizSubmitted && (
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-center sm:text-right">
                <span className="text-xs text-slate-500 block">نتيجتك في الاختبار</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {quizScore}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quiz questions */}
        <div className="space-y-6">
          {(lesson.quiz || []).map((q, idx) => {
            const studentAns = selectedAnswers[q.id];
            const isAnswered = studentAns !== undefined;
            const isMatch = studentAns === q.correctAnswer || (typeof q.correctAnswer === 'number' && q.options && studentAns === q.options[q.correctAnswer]);
            const isCorrect = quizSubmitted && isAnswered && isMatch;
            const isWrong = quizSubmitted && isAnswered && !isMatch;

            return (
              <div key={q.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    السؤال {idx + 1}: {q.question}
                  </h3>
                  {quizSubmitted && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shrink-0 ${
                      isCorrect ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>{isCorrect ? 'صحيح' : 'غير صحيح'}</span>
                    </span>
                  )}
                </div>

                {/* Question options */}
                {q.options && q.options.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = studentAns === opt || studentAns === optIdx;
                      let optionClasses = 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200';

                      if (isSelected) {
                        optionClasses = 'bg-blue-600 text-white border-blue-600 font-bold';
                      }

                      if (quizSubmitted) {
                        const isCorrectOpt = opt === q.correctAnswer || optIdx === q.correctAnswer;
                        if (isCorrectOpt) {
                          optionClasses = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                        } else if (isSelected && !isCorrectOpt) {
                          optionClasses = 'bg-rose-600 text-white border-rose-600';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() => handleSelectQuizAnswer(q.id, opt)}
                          className={`p-3 rounded-xl border text-right text-xs sm:text-sm transition-all cursor-pointer ${optionClasses}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs shrink-0">
                              {optIdx + 1}
                            </span>
                            <span>{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: 'صح', label: 'صح (True)' },
                      { val: 'خطأ', label: 'خطأ (False)' },
                    ].map((btn) => {
                      const isSelected = studentAns === btn.val;
                      let btnClasses = 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200';

                      if (isSelected) {
                        btnClasses = 'bg-blue-600 text-white border-blue-600 font-bold';
                      }

                      if (quizSubmitted) {
                        if (btn.val === q.correctAnswer) {
                          btnClasses = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                        } else if (isSelected && btn.val !== q.correctAnswer) {
                          btnClasses = 'bg-rose-600 text-white border-rose-600';
                        }
                      }

                      return (
                        <button
                          key={btn.val}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() => handleSelectQuizAnswer(q.id, btn.val)}
                          className={`p-3 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all cursor-pointer ${btnClasses}`}
                        >
                          {btn.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Explanation after submission */}
                {quizSubmitted && q.explanation && (
                  <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200">
                    <span className="font-bold">توضيح الإجابة:</span> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quiz Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-700">
          {!quizSubmitted ? (
            <button
              onClick={handleCalculateQuizScore}
              disabled={Object.keys(selectedAnswers).length === 0}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm shadow-md cursor-pointer transition-all"
            >
              تصحيح الاختبار وعرض النتيجة
            </button>
          ) : (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleResetQuiz}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة الاختبار</span>
              </button>
              <span className="text-xs text-emerald-600 font-bold">
                تم حفظ نتيجتك ({quizScore}%) في ملفك الشخصي!
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 15. ملخص سريع للدرس (Cheat Sheet) */}
      {/* ============================================================ */}
      <section id="section-summary" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <span>15. ملخص سريع للدرس (Cheat Sheet للمراجعة السريعة):</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          الخلاصة المركزة التي تحتاجها ليلة الاختبار:
        </p>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          {(lesson.summary || []).map((point, pIdx) => (
            <div key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
              <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
              <span className="leading-relaxed">{point}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Floating/Sticky Action Banner for AI Assistant */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-right">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-6 h-6 text-amber-300 animate-spin" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg">
              هل لديك سؤال أو مسألة غير واضحة في درس "{lesson.title}"؟
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
              اسأل مساعد الميكاترونكس الذكي وسيشرح لك خطوة بخطوة باللغة العربية.
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenAiForLesson(lesson.title)}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-blue-800 font-extrabold text-sm hover:bg-blue-50 shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>اسأل مساعد الميكاترونكس عن هذا الدرس</span>
        </button>
      </div>

    </div>
  );
};
