import React from 'react';
import { 
  Lightbulb, 
  Check, 
  X, 
  Scale, 
  Ruler, 
  Atom, 
  Calculator, 
  FileCheck, 
  Zap, 
  ExternalLink, 
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Target,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Clock,
  Compass,
  FileText,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { ExplainLessonResult } from '../types';
import { LessonNoteWidget } from './LessonNoteWidget';

interface ExplainFourteenSectionsProps {
  analysisResult: ExplainLessonResult;
  quizAnswers: Record<string, string | number | boolean>;
  setQuizAnswers: React.Dispatch<React.SetStateAction<Record<string, string | number | boolean>>>;
  revealedQuiz: Record<string, boolean>;
  setRevealedQuiz: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onOpenExplainPoint: (pointText?: string) => void;
  onNavigateToTool: (tabId: string, contextData?: any) => void;
  onSimplifyMore: () => void;
  onRequestMoreExamples: () => void;
  onTestMe: () => void;
}

export const ExplainFourteenSections: React.FC<ExplainFourteenSectionsProps> = ({
  analysisResult,
  quizAnswers,
  setQuizAnswers,
  revealedQuiz,
  setRevealedQuiz,
  onOpenExplainPoint,
  onNavigateToTool,
  onSimplifyMore,
  onRequestMoreExamples,
  onTestMe,
}) => {
  return (
    <div className="space-y-10">

      {/* 1. اسم الدرس */}
      <section id="section-1" className="scroll-mt-24 p-6 rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white border border-blue-800/80 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-black">
                1. اسم الدرس ومادته ومستواه
              </span>
              <span className="text-xs text-blue-300 font-bold">
                {analysisResult.subjectName}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white pt-1">
              📚 {analysisResult.lessonTitle}
            </h2>
          </div>
          <div className="text-left sm:text-right text-xs text-blue-200">
            <span className="block font-bold">هندسة الميكاترونكس - المستوى الأول</span>
            <span className="block text-[11px] text-blue-300/80 mt-0.5">
              {new Date(analysisResult.createdAt).toLocaleDateString('ar-YE', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </section>

      {/* 📝 ملاحظاتي الشخصية على هذا الدرس الشامل */}
      <LessonNoteWidget
        lessonId={`explain_${analysisResult.lessonTitle || 'general'}`}
        lessonTitle={analysisResult.lessonTitle || 'الدرس المفسر بالذكاء الاصطناعي'}
      />

      {/* 📸 تفكيك وشرح الصور بالتفصيل (صورة صورة / صفحة صفحة) */}
      {analysisResult.imagesBreakdown && analysisResult.imagesBreakdown.length > 0 && (
        <section id="section-images-breakdown" className="scroll-mt-24 p-6 sm:p-7 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/30">
                    خاصية الشرح التسلسلي (صورة صورة)
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    إجمالي {analysisResult.imagesBreakdown.length} صور / صفحات
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">
                  📸 تفكيك وشرح المستند صورة صورة
                </h3>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {analysisResult.imagesBreakdown.map((item, idx) => (
              <div 
                key={`img-item-${idx}`}
                className="p-5 sm:p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-4 hover:border-amber-500/50 transition-all shadow-md"
              >
                <div className="flex flex-col md:flex-row gap-5 items-start">
                  {item.previewUrl && (
                    <div className="w-full md:w-56 shrink-0 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center p-2 group relative">
                      <img 
                        src={item.previewUrl} 
                        alt={item.imageTitle} 
                        className="max-h-48 w-full object-contain rounded-lg group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-amber-300 font-black text-xs border border-amber-500/30">
                        صورة #{item.imageIndex || (idx + 1)}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                        {item.imageIndex || (idx + 1)}
                      </span>
                      <h4 className="text-lg font-black text-amber-300">
                        {item.imageTitle || `الصورة رقم ${idx + 1}`}
                      </h4>
                    </div>

                    {item.summary && (
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-sm leading-relaxed">
                        <span className="font-bold text-amber-400 block mb-1">💡 ملخص هذه الصورة:</span>
                        {item.summary}
                      </div>
                    )}

                    {item.extractedContent && (
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 text-amber-100 text-xs font-mono dir-ltr text-left overflow-x-auto">
                        <span className="font-bold text-slate-400 block mb-1 text-right dir-rtl font-sans text-xs">📝 النصوص والمعادلات المستخرجة:</span>
                        {item.extractedContent}
                      </div>
                    )}

                    {item.detailedExplanation && (
                      <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/50 text-slate-200 text-sm leading-relaxed space-y-2">
                        <span className="font-bold text-blue-300 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                          <span>الشرح التفصيلي لهذه الصورة:</span>
                        </span>
                        <p className="whitespace-pre-wrap">{item.detailedExplanation}</p>
                      </div>
                    )}

                    {item.keyTakeaways && item.keyTakeaways.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-amber-300">📌 النقاط الرئيسية في هذه الصورة:</span>
                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pr-2">
                          {item.keyTakeaways.map((point, pIdx) => (
                            <li key={pIdx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.solvedProblemsInImage && item.solvedProblemsInImage.length > 0 && (
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs space-y-1">
                        <span className="font-bold text-emerald-300 block">🧮 المسائل والتمارين المحلولة في هذه الصورة:</span>
                        {item.solvedProblemsInImage.map((prob, prIdx) => (
                          <div key={prIdx} className="bg-emerald-900/40 p-2 rounded border border-emerald-800/40">{prob}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. الدرس ببساطة (الفكرة العامة) */}
      <section id="section-2" className="scroll-mt-24 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-slate-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-base sm:text-lg text-blue-950 dark:text-blue-200 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
            <span>2. الدرس ببساطة (الفكرة العامة)</span>
          </h3>
          <button
            type="button"
            onClick={() => onOpenExplainPoint(analysisResult.simpleIdea)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            اشرح بتشبيه آخر
          </button>
        </div>

        <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
          {analysisResult.simpleIdea}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/50 space-y-1">
            <span className="text-xs font-black text-blue-700 dark:text-blue-400 block">
              ❓ لماذا ندرس هذا الموضوع؟
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              يمثل هذا المفهوم حجر الأساس لفهم سلوك الأنظمة الميكانيكية والكهربائية المتكاملة، وتجنب احتراق المكونات أو انهيار الحركة أثناء تشغيل الروبوتات.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/50 space-y-1">
            <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 block">
              🤖 أين يستخدم في هندسة الميكاترونكس؟
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              في تصميم مشغلات المحركات (Motor Drivers)، حساب عزوم المفاصل، موازنة الروبوتات، وحساب دوائر التغذية والحساسات بدقة.
            </p>
          </div>
        </div>
      </section>

      {/* 3. أهم الأفكار */}
      {analysisResult.coreTakeaways && analysisResult.coreTakeaways.length > 0 && (
        <section id="section-3" className="scroll-mt-24 space-y-4">
          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>3. أهم الأفكار الأساسية في الدرس</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysisResult.coreTakeaways.map((point, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3 shadow-xs"
              >
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-black text-xs shrink-0 flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. شرح المفاهيم */}
      {analysisResult.conceptExplanations && analysisResult.conceptExplanations.length > 0 && (
        <section id="section-4" className="scroll-mt-24 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500 shrink-0" />
              <span>4. شرح المفاهيم بالتفصيل والتشبيهات</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">
              {analysisResult.conceptExplanations.length} مفاهيم
            </span>
          </div>

          <div className="space-y-3.5">
            {analysisResult.conceptExplanations.map((concept, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="font-black text-base text-slate-900 dark:text-white">
                      {concept.concept}
                    </h4>
                    {concept.conceptEn && (
                      <span className="font-mono text-xs text-slate-400 font-bold" dir="ltr">
                        ({concept.conceptEn})
                      </span>
                    )}
                  </div>
                  {concept.isAdditionalNote && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                      💡 معلومة إضافية للتوضيح
                    </span>
                  )}
                </div>

                {/* Explanation */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 block">الشرح المبسط:</span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {concept.simplifiedExplanation || concept.explanation}
                  </p>
                </div>

                {/* Scientific definition if present */}
                {concept.scientificDefinition && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">التعريف العلمي:</strong> {concept.scientificDefinition}
                  </div>
                )}

                {/* Practical Analogy */}
                {concept.practicalAnalogy && (
                  <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200">
                    💡 <strong>تشبيه عملي ملموس:</strong> {concept.practicalAnalogy}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. المصطلحات المهمة */}
      {analysisResult.terms && analysisResult.terms.length > 0 && (
        <section id="section-5" className="scroll-mt-24 space-y-4">
          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-xs">
              📌
            </span>
            <span>5. المصطلحات الهندسية المهمة</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {analysisResult.terms.map((t, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 dark:text-white text-sm">
                    {t.term}
                  </h4>
                  {t.englishTerm && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold" dir="ltr">
                      {t.englishTerm}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {t.meaning}
                </p>
                {t.practicalAnalogy && (
                  <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
                    💡 <strong>تشبيه:</strong> {t.practicalAnalogy}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. القوانين والمعادلات */}
      {analysisResult.formulas && analysisResult.formulas.length > 0 && (
        <section id="section-6" className="scroll-mt-24 space-y-4">
          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-500 shrink-0" />
            <span>6. القوانين والمعادلات وتفكيك الرموز</span>
          </h3>

          <div className="space-y-4">
            {analysisResult.formulas.map((f, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-mono text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400" dir="ltr">
                    {f.equation}
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenExplainPoint(`قانون: ${f.equation}`)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold self-start sm:self-auto cursor-pointer"
                  >
                    حل مسألة بهذا القانون 🧮
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {f.meaning}
                </p>

                {f.symbols && f.symbols.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-500 block mb-2">تفكيك رموز القانون ووحداتها وأبعادها:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {f.symbols.map((sym, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-blue-600 text-sm" dir="ltr">
                              {sym.symbol}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {sym.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>الوحدة: {sym.unit}</span>
                            {sym.dimension && <span className="font-mono font-bold" dir="ltr">[{sym.dimension}]</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. الوحدات */}
      {analysisResult.units && analysisResult.units.length > 0 && (
        <section id="section-7" className="scroll-mt-24 space-y-4">
          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Ruler className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>7. جدول الوحدات الدولية (SI Units) للدرس</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {analysisResult.units.map((u, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs"
              >
                <span className="text-[11px] text-slate-500 block">{u.quantity}</span>
                <span className="font-black text-sm text-slate-900 dark:text-white block">{u.unitName}</span>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 block" dir="ltr">
                  {u.unitSymbol}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. الأبعاد الفيزيائية */}
      {analysisResult.dimensions && analysisResult.dimensions.length > 0 && (
        <section id="section-8" className="scroll-mt-24 space-y-4">
          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Atom className="w-5 h-5 text-purple-500 shrink-0" />
            <span>8. تحليل الأبعاد الفيزيائية [M, L, T, I]</span>
          </h3>
          <div className="space-y-3">
            {analysisResult.dimensions.map((d, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/60 space-y-2 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-sm text-purple-900 dark:text-purple-200">
                    {d.quantity}
                  </span>
                  <span className="font-mono font-black text-sm text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-purple-200 dark:border-purple-800" dir="ltr">
                    {d.dimensionStr}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {d.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9. الأمثلة والمسائل */}
      <section id="section-9" className="scroll-mt-24 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-500 shrink-0" />
            <span>9. حل المسائل والتمارين خطوة بخطوة مع التعليل</span>
          </h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            analysisResult.solvedExample?.isGenerated
              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
          }`}>
            {analysisResult.solvedExample?.isGenerated ? '💡 مثال تعليمي إضافي من الذكاء الاصطناعي' : '📄 مسألة مستخرجة ومحلولة بالكامل'}
          </span>
        </div>

        {/* List of Solved Examples */}
        {(() => {
          const examplesList = (analysisResult.solvedExamples && analysisResult.solvedExamples.length > 0)
            ? analysisResult.solvedExamples
            : (analysisResult.solvedExample ? [analysisResult.solvedExample] : []);

          return (
            <div className="space-y-6">
              {examplesList.map((example, exIdx) => (
                <div key={exIdx} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
                  {/* Problem Title & Header */}
                  <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                        {examplesList.length > 1 ? `المسألة رقم (${exIdx + 1}):` : 'نص المسألة الأصلي:'}
                      </span>
                      {example.isMultipleParts && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          تتضمن عدة فقرات (أ، ب، ج...)
                        </span>
                      )}
                    </div>
                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                      {example.problem}
                    </p>
                  </div>

                  {/* Given & Required */}
                  {( (example.given && example.given.length > 0) || example.required ) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {example.given && example.given.length > 0 && (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                          <span className="text-xs font-bold text-slate-500 block">المعطيات (Given):</span>
                          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                            {example.given.map((g, idx) => (
                              <li key={idx}>{g}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {example.required && (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                          <span className="text-xs font-bold text-slate-500 block">المطلوب (Required):</span>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {example.required}
                          </p>
                          {example.formulaUsed && (
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-blue-600 font-mono" dir="ltr">
                              القانون الرئيسي: {example.formulaUsed}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Render SubParts if available */}
                  {example.subParts && example.subParts.length > 0 ? (
                    <div className="space-y-4 pt-2">
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                        حل فقرات المسألة بالتفصيل ({example.subParts.length} فقرة):
                      </span>

                      <div className="space-y-4">
                        {example.subParts.map((sub, sIdx) => (
                          <div key={sIdx} className="p-4 sm:p-5 rounded-2xl bg-indigo-50/40 dark:bg-slate-950 border border-indigo-100 dark:border-slate-800 space-y-3.5 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-indigo-100 dark:border-slate-800 pb-2">
                              <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-black text-xs">
                                {sub.partLabel || `الفقرة (${sIdx + 1})`}
                              </span>
                              {sub.isMcq && (
                                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950 px-2.5 py-0.5 rounded-full">
                                  سؤال اختيارات من متعدد
                                </span>
                              )}
                            </div>

                            {sub.question && (
                              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                {sub.question}
                              </p>
                            )}

                            {/* MCQ Options & Selected Answer with Reasoning */}
                            {(sub.isMcq || sub.selectedOption || (sub.mcqOptions && sub.mcqOptions.length > 0)) && (
                              <div className="space-y-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                {sub.mcqOptions && sub.mcqOptions.length > 0 && (
                                  <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold text-slate-500 block">الخيارات المتاحة:</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {sub.mcqOptions.map((opt, oIdx) => {
                                        const isSelected = sub.selectedOption && (opt.includes(sub.selectedOption) || sub.selectedOption.includes(opt));
                                        return (
                                          <div
                                            key={oIdx}
                                            className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                                              isSelected
                                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs'
                                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                                            }`}
                                          >
                                            <span>{opt}</span>
                                            {isSelected && (
                                              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black">
                                                ✓ الاختيار الصحيح
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {sub.selectedOption && (!sub.mcqOptions || sub.mcqOptions.length === 0) && (
                                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>الإجابة الصحيحة: <strong>{sub.selectedOption}</strong></span>
                                  </div>
                                )}

                                {sub.optionReasoning && (
                                  <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-1">
                                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 block">
                                      💡 سبب اختيار هذا الإجابة والتعليل العلمي:
                                    </span>
                                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                                      {sub.optionReasoning}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Steps for subPart */}
                            {sub.steps && sub.steps.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-[11px] font-bold text-slate-500 block">خطوات حل الفقرة:</span>
                                <div className="space-y-1.5">
                                  {sub.steps.map((st, stIdx) => (
                                    <div key={stIdx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200">
                                      <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] shrink-0 flex items-center justify-center">
                                        {stIdx + 1}
                                      </span>
                                      <span className="leading-relaxed">{st}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Final answer for subPart */}
                            {sub.finalAnswer && (
                              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                                  نتيجة الفقرة: <strong>{sub.finalAnswer}</strong>
                                </span>
                                {sub.unit && (
                                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-[11px] font-mono font-bold">
                                    الوحدة: {sub.unit}
                                  </span>
                                )}
                              </div>
                            )}

                            {(sub.finalAnalysis || sub.whyThisResult) && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                🔬 <strong>التحليل النهائي للفقرة:</strong> {sub.finalAnalysis || sub.whyThisResult}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Standard Single Problem Steps */
                    <div className="space-y-3">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">خطوات الحل التفصيلية:</span>
                      <div className="space-y-2.5">
                        {(example.steps || []).map((step, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3"
                          >
                            <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs shrink-0 flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top-level MCQ Option & Reason if applicable */}
                  {(example.isMcqQuestion || example.selectedOption) && (
                    <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-3">
                      {example.mcqOptions && example.mcqOptions.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-xs font-bold text-purple-900 dark:text-purple-200 block">خيارات السؤال:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {example.mcqOptions.map((opt, oIdx) => {
                              const isSelected = example.selectedOption && (opt.includes(example.selectedOption) || example.selectedOption.includes(opt));
                              return (
                                <div key={oIdx} className={`p-2.5 rounded-xl text-xs font-bold border ${isSelected ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200' : 'bg-white dark:bg-slate-900 border-purple-200 dark:border-purple-800 text-slate-700 dark:text-slate-300'}`}>
                                  {opt} {isSelected && '✓ [الإجابة الصحيحة]'}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {example.selectedOption && (
                        <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          ✓ الاختيار الصحيح: {example.selectedOption}
                        </div>
                      )}

                      {example.optionReasoning && (
                        <div className="text-xs text-purple-950 dark:text-purple-200 leading-relaxed pt-1 border-t border-purple-200 dark:border-purple-900">
                          💡 <strong>السبب والتعليل العلمي:</strong> {example.optionReasoning}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Final Answer */}
                  {example.finalAnswer && (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">الناتج النهائي المباشر (Final Answer):</span>
                        <span className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-100">
                          {example.finalAnswer}
                        </span>
                      </div>
                      {example.unit && (
                        <span className="px-3 py-1 rounded-xl bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-xs font-mono font-bold">
                          الوحدة: {example.unit}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Final Engineering Analysis */}
                  {(example.finalAnalysis || example.whyThisResult) && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 space-y-1.5">
                      <div>
                        🔬 <strong>التحليل النهائي والتفسير الهندسي:</strong> {example.finalAnalysis || example.whyThisResult}
                      </div>
                      {example.finalAnalysis && example.whyThisResult && example.finalAnalysis !== example.whyThisResult && (
                        <div className="text-[11px] text-blue-800 dark:text-blue-400">
                          💡 <em>دلالة النتيجة:</em> {example.whyThisResult}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Additional note */}
                  {example.note && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300">
                      ⚠️ <strong>نصيحة المهندس:</strong> {example.note}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onRequestMoreExamples}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm"
                >
                  <Calculator className="w-4 h-4" />
                  <span>توليد مسألة ومثال تطبيقي إضافي 🧮</span>
                </button>
              </div>
            </div>
          );
        })()}
      </section>

      {/* 10. الملاحظات المهمة */}
      {analysisResult.importantNotes && analysisResult.importantNotes.length > 0 && (
        <section id="section-10" className="scroll-mt-24 space-y-4">
          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center text-xs">
              ⚠️
            </span>
            <span>10. الملاحظات المهمة وتنبيهات الامتحانات</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analysisResult.importantNotes.map((note, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-2 shadow-xs"
              >
                <div className="font-bold text-xs sm:text-sm text-rose-800 dark:text-rose-300 flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{note.point || note.note}</span>
                </div>
                {note.explanation && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pr-6">
                    {note.explanation}
                  </p>
                )}
                {note.dangerLevel && (
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300">
                    مستوى الانتباه: {note.dangerLevel === 'high' ? 'عالي جداً 🔥' : 'متوسط ⚠️'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 11. كيف أتذكر الدرس؟ */}
      {analysisResult.memoryAids && analysisResult.memoryAids.length > 0 && (
        <section id="section-11" className="scroll-mt-24 space-y-4">
          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
            <span>11. كيف أتذكر الدرس؟ (روابط ذهنية ومثلثات القوانين)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analysisResult.memoryAids.map((aid, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 shadow-xs"
              >
                <span className="w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold text-xs shrink-0 flex items-center justify-center mt-0.5">
                  🧠
                </span>
                <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
                  {aid}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 12. الخلاصة */}
      {analysisResult.summaryPoints && analysisResult.summaryPoints.length > 0 && (
        <section id="section-12" className="scroll-mt-24 p-6 rounded-3xl bg-slate-900 text-white shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400 shrink-0" />
              <span>12. خلاصة الدرس السريعة (مراجعة الدقيقة الواحدة)</span>
            </h3>
            <span className="text-xs text-blue-300 font-bold">
              {analysisResult.summaryPoints.length} نقاط مكثفة
            </span>
          </div>

          <ul className="space-y-2 text-xs sm:text-sm text-slate-200 list-disc list-inside leading-relaxed">
            {analysisResult.summaryPoints.map((pt, idx) => (
              <li key={idx} className="font-medium">
                {pt}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 13. ماذا يجب أن أعرف بعد الدرس؟ */}
      {analysisResult.learningObjectives && analysisResult.learningObjectives.length > 0 && (
        <section id="section-13" className="scroll-mt-24 space-y-4">
          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>13. ماذا يجب أن أعرف بعد الدرس؟ (قائمة التحقق الهندسية)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {analysisResult.learningObjectives.map((obj, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 shadow-xs"
              >
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                  {obj}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 14. اختبار سريع (3 إلى 5 أسئلة) */}
      <section id="section-14" className="scroll-mt-24 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>14. اختبار سريع (3 إلى 5 أسئلة مع التقييم الفوري)</span>
          </h3>
          <span className="text-xs text-slate-500 font-bold">
            {analysisResult.quiz.length} أسئلة
          </span>
        </div>

        <div className="space-y-4">
          {analysisResult.quiz.map((q, idx) => {
            const selected = quizAnswers[q.id];
            const isRevealed = revealedQuiz[q.id];
            const isCorrect = String(selected).trim() === String(q.correctAnswer).trim();

            return (
              <div
                key={q.id || idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-black text-xs shrink-0 flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {q.question}
                  </h4>
                </div>

                {/* Options */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {q.options.map((opt, optIdx) => {
                      const isThisSelected = selected === opt;
                      const isThisCorrect = opt === q.correctAnswer;

                      let btnClasses = 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-blue-400 text-slate-800 dark:text-slate-200';
                      if (isRevealed) {
                        if (isThisCorrect) {
                          btnClasses = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold';
                        } else if (isThisSelected && !isCorrect) {
                          btnClasses = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 line-through';
                        }
                      } else if (isThisSelected) {
                        btnClasses = 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isRevealed}
                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                          className={`p-3 rounded-xl border text-right text-xs sm:text-sm transition-all cursor-pointer ${btnClasses}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Check Answer Button & Explanation */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {!isRevealed ? (
                    <button
                      type="button"
                      disabled={selected === undefined}
                      onClick={() => setRevealedQuiz((prev) => ({ ...prev, [q.id]: true }))}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        selected !== undefined
                          ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      تحقق من إجابتي
                    </button>
                  ) : (
                    <div className="w-full space-y-2">
                      <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        isCorrect
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      }`}>
                        {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-600" />}
                        <span>{isCorrect ? 'إجابة صحيحة وممتازة! أحسنت يا باشمهندس.' : `إجابة غير دقيقة. الإجابة الصحيحة هي: "${q.correctAnswer}"`}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pr-2">
                        💡 <strong>التفسير العلمي:</strong> {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Electrical Circuit Analysis Card if present */}
      {analysisResult.circuitAnalysis?.hasCircuit && (
        <section className="p-5 rounded-3xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/50 space-y-3">
          <h3 className="font-black text-sm sm:text-base text-cyan-900 dark:text-cyan-200 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-500 shrink-0" />
            <span>تحليل الدائرة الكهربائية المكتشفة بالصورة</span>
          </h3>
          {analysisResult.circuitAnalysis.circuitType && (
            <p className="text-xs font-bold text-cyan-700 dark:text-cyan-300">
              نوع الدائرة: {analysisResult.circuitAnalysis.circuitType}
            </p>
          )}
          {analysisResult.circuitAnalysis.components && analysisResult.circuitAnalysis.components.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {analysisResult.circuitAnalysis.components.map((c, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-xs border border-cyan-100 dark:border-cyan-900">
                  <span className="text-slate-400 block text-[10px]">{c.label}</span>
                  <span className="font-black text-slate-900 dark:text-white block">{c.type}</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 text-[11px]">{c.value}</span>
                </div>
              ))}
            </div>
          )}
          {analysisResult.circuitAnalysis.analysisSummary && (
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {analysisResult.circuitAnalysis.analysisSummary}
            </p>
          )}
          <button
            type="button"
            onClick={() => onNavigateToTool('circuits')}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>فتح هذه الدائرة في مختبر الدوائر الكهربائية</span>
          </button>
        </section>
      )}

      {/* Suggested Tools on the Platform */}
      {analysisResult.suggestedTools && analysisResult.suggestedTools.length > 0 && (
        <section className="space-y-4">
          <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-indigo-500 shrink-0" />
            <span>أدوات المنصة الموصى بها لهذا الدرس</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {analysisResult.suggestedTools.map((tool, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all space-y-3 group shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    {tool.title}
                  </h4>
                  <span className="text-xs text-slate-400">{tool.subtitle}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {tool.reason}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateToTool(tool.toolId, { lessonTitle: analysisResult.lessonTitle })}
                  className="w-full py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 hover:bg-blue-600 text-blue-700 dark:text-blue-300 hover:text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>فتح الأداة وتجربة الحسابات الآن</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4 Interactive Buttons Panel */}
      <section className="p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white shadow-xl space-y-4 border border-blue-800/60">
        <div className="text-center sm:text-right">
          <h3 className="text-lg font-black flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>أزرار التفاعل الذكي مع المدرس 🤖</span>
          </h3>
          <p className="text-xs text-blue-200 mt-1">
            اختر أي زر للتفاعل المباشر مع درسك: تبسيط الشرح أكثر، توضيح نقطة معينة، إضافة مسائل جديدة، أو اختبار فهمك.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <button
            type="button"
            onClick={onSimplifyMore}
            className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
          >
            <RefreshCw className="w-5 h-5 text-emerald-400" />
            <span>🔄 بسّط لي أكثر</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenExplainPoint()}
            className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
          >
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <span>❓ اشرح هذه النقطة</span>
          </button>

          <button
            type="button"
            onClick={onRequestMoreExamples}
            className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
          >
            <Calculator className="w-5 h-5 text-cyan-400" />
            <span>🧮 أعطني مثالًا</span>
          </button>

          <button
            type="button"
            onClick={onTestMe}
            className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
          >
            <FileCheck className="w-5 h-5 text-purple-400" />
            <span>📝 اختبرني</span>
          </button>
        </div>
      </section>

    </div>
  );
};
