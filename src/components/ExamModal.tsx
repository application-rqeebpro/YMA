import React, { useState, useRef } from 'react';
import {
  FileText,
  Download,
  Image as ImageIcon,
  Printer,
  X,
  CheckCircle2,
  HelpCircle,
  Award,
  Layers,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  User,
  GraduationCap,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from 'lucide-react';
import { ExamPaper, ExamType, Subject, Lesson, StudentProfile } from '../types';
import { generateExamPaper } from '../utils/examGenerator';
import { exportElementToPdf, exportElementToImage } from '../utils/pdfGenerator';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
  lesson?: Lesson | null;
  customLessonTitle?: string;
  customLessonContent?: any; // from ExplainLessonView
  student?: StudentProfile | null;
}

export const ExamModal: React.FC<ExamModalProps> = ({
  isOpen,
  onClose,
  subject,
  lesson,
  customLessonTitle,
  customLessonContent,
  student,
}) => {
  const [examType, setExamType] = useState<ExamType>(lesson || customLessonTitle ? 'lesson_test' : 'final');
  const [showModelAnswer, setShowModelAnswer] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportStatus, setExportStatus] = useState<string>('');
  const [universityName, setUniversityName] = useState<string>('الجامعة الإماراتية الدولية – صنعاء');
  const [includeStudentInfo, setIncludeStudentInfo] = useState<boolean>(true);

  const examPaperRef = useRef<HTMLDivElement>(null);

  // Generate current exam paper
  const examPaper: ExamPaper = React.useMemo(() => {
    return generateExamPaper({
      subject,
      lesson,
      examType,
      university: universityName,
      customLessonTitle,
      customLessonContent,
      studentName: student?.name,
    });
  }, [subject, lesson, examType, universityName, customLessonTitle, customLessonContent, student]);

  if (!isOpen) return null;

  // Handle Export to PDF
  const handleExportPdf = async () => {
    if (!examPaperRef.current) return;
    try {
      setIsExporting(true);
      const cleanFileName = `نموذج_اختبار_${examPaper.subjectName.replace(/\s+/g, '_')}_${
        showModelAnswer ? 'الحل_النموذجي' : 'ورقة_الامتحان'
      }.pdf`;

      await exportElementToPdf(examPaperRef.current, {
        fileName: cleanFileName,
        onProgress: (step) => setExportStatus(step),
      });

      setExportStatus('تم تنزيل ملف PDF بنجاح!');
      setTimeout(() => setExportStatus(''), 4000);
    } catch (err: any) {
      alert(err?.message || 'حدث خطأ أثناء تنزيل ملف PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Export to Image (PNG)
  const handleExportImage = async () => {
    if (!examPaperRef.current) return;
    try {
      setIsExporting(true);
      const cleanFileName = `نموذج_اختبار_${examPaper.subjectName.replace(/\s+/g, '_')}_${
        showModelAnswer ? 'إجابات' : 'أسئلة'
      }.png`;

      await exportElementToImage(examPaperRef.current, {
        fileName: cleanFileName,
        onProgress: (step) => setExportStatus(step),
        scale: 2.2,
      });

      setExportStatus('تم تنزيل صورة نموذج الاختبار بنجاح!');
      setTimeout(() => setExportStatus(''), 4000);
    } catch (err: any) {
      alert(err?.message || 'تعذر تصدير نموذج الاختبار كصورة');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Direct Browser Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in print:p-0 print:bg-white print:fixed-none">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden print:max-h-none print:border-none print:shadow-none print:bg-white print:w-full">
        
        {/* ========================================================= */}
        {/* TOP CONTROLS & TOOLBAR (Hidden during print) */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          
          {/* Title & Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-orange-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  نماذج الاختبارات المتوقعة الرسمية
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  جامعي معتمد
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {subject.name} {lesson ? `• درس: ${lesson.title}` : customLessonTitle ? `• درس: ${customLessonTitle}` : '• نموذج شامل للمادة'}
              </p>
            </div>
          </div>

          {/* Exam Type Selector (If not a specific single lesson) */}
          {!lesson && !customLessonTitle && (
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-bold text-slate-300">
              <button
                onClick={() => setExamType('final')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  examType === 'final' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'hover:text-white'
                }`}
              >
                امتحان نهائي (100 د)
              </button>
              <button
                onClick={() => setExamType('midterm')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  examType === 'midterm' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'hover:text-white'
                }`}
              >
                امتحان نصفي (50 د)
              </button>
              <button
                onClick={() => setExamType('quiz')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  examType === 'quiz' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'hover:text-white'
                }`}
              >
                كويز قصير (25 د)
              </button>
            </div>
          )}

          {/* Mode Toggle (Clean Exam vs Model Answers) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModelAnswer(!showModelAnswer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                showModelAnswer
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/40 hover:bg-blue-500/30'
              }`}
            >
              {showModelAnswer ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>معروض: نموذج الإجابة وسلم الدرجات</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>معروض: ورقة الامتحان النظيفة (بدون حل)</span>
                </>
              )}
            </button>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-slate-300">
              <button
                onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                className="p-1.5 hover:text-white rounded-lg hover:bg-slate-700/50 cursor-pointer"
                title="تصغير"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[11px] font-bold">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                className="p-1.5 hover:text-white rounded-lg hover:bg-slate-700/50 cursor-pointer"
                title="تكبير"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action Buttons: PDF & Image */}
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
              title="تنزيل كملف PDF عالي الدقة للطباعة"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تنزيل PDF</span>
            </button>

            <button
              onClick={handleExportImage}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              title="تنزيل نموذج الامتحان كصورة PNG عالية الدقة للمشاركة على واتساب"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>تنزيل كصورة</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              title="طباعة مباشرة"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress status banner */}
        {exportStatus && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 animate-pulse print:hidden">
            <Sparkles className="w-4 h-4" />
            <span>{exportStatus}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* PAPER PREVIEW CONTAINER */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/60 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="transition-transform duration-200 w-full max-w-[820px] print:transform-none"
          >
            {/* The printable authentic paper */}
            <div
              ref={examPaperRef}
              data-pdf-page="true"
              className="bg-white text-slate-900 rounded-none shadow-2xl p-8 sm:p-12 border-2 border-slate-900 relative font-serif print:border-none print:shadow-none print:p-4 text-right"
              dir="rtl"
            >
              
              {/* Outer Decorative Double Border for Academic Look */}
              <div className="border border-slate-800 p-6 sm:p-8 rounded-sm space-y-6">

                {/* ========================================== */}
                {/* 1. OFFICIAL UNIVERSITY LETTERHEAD */}
                {/* ========================================== */}
                <div className="border-b-2 border-slate-900 pb-5">
                  <div className="grid grid-cols-3 items-center text-center">
                    
                    {/* Right Column: Ministry & University Header */}
                    <div className="text-right space-y-1">
                      <p className="text-[12px] font-bold text-slate-800">{examPaper.header.republic}</p>
                      <p className="text-[11px] text-slate-700">{examPaper.header.ministry}</p>
                      <p className="text-[13px] font-black text-slate-950">{examPaper.header.university}</p>
                      <p className="text-[11px] font-bold text-slate-800">{examPaper.header.faculty}</p>
                      <p className="text-[11px] text-slate-700">{examPaper.header.department}</p>
                    </div>

                    {/* Center Column: Emblem & Exam Type Title */}
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="w-16 h-16 rounded-full border-2 border-slate-900 flex items-center justify-center p-1 bg-amber-50">
                        <GraduationCap className="w-9 h-9 text-slate-900" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600">ورقة أسئلة امتحانية</span>
                      <h1 className="text-sm sm:text-base font-black text-slate-950 px-2 py-0.5 border-b-2 border-slate-900">
                        {examPaper.header.examTypeLabel}
                      </h1>
                    </div>

                    {/* Left Column: Course & Exam Metadata */}
                    <div className="text-left space-y-1 text-slate-800" dir="ltr">
                      <p className="text-[12px] font-bold">المقرر: <span className="font-black text-slate-950">{examPaper.header.courseTitle}</span></p>
                      <p className="text-[11px]">رمز المقرر: <span className="font-bold">{examPaper.header.courseCode}</span></p>
                      <p className="text-[11px]">المستوى: <span>{examPaper.header.level}</span></p>
                      <p className="text-[11px]">العام الجامعي: <span>{examPaper.header.academicYear}</span></p>
                      <p className="text-[11px] font-bold text-red-700">الزمن المخصص: <span>{examPaper.header.timeAllowed}</span></p>
                    </div>

                  </div>
                </div>

                {/* ========================================== */}
                {/* 2. STUDENT INFO & GRADING CONTROL BOX */}
                {/* ========================================== */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs border border-slate-800 p-3 bg-slate-50/80">
                  
                  {/* Student Details Fields */}
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">اسم الطالب/ـة:</span>
                      <span className="flex-1 border-b border-dotted border-slate-700 font-bold text-blue-900">
                        {student?.name || '................................................................................'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">الرقم الأكاديمي:</span>
                        <span className="flex-1 border-b border-dotted border-slate-700 font-mono text-slate-800">
                          {student?.phone || '................................'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">القاعة / رقم الجلوس:</span>
                        <span className="flex-1 border-b border-dotted border-slate-700 text-slate-800">
                          ................................
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grading Rubric Box (كنترول ورصد الدرجات) */}
                  <div className="border border-slate-400 p-2 text-center bg-white rounded-xs">
                    <p className="text-[10px] font-black text-slate-800 border-b pb-1 mb-1">
                      خاص بلجنة الكنترول ورصد الدرجات
                    </p>
                    <div className="grid grid-cols-5 text-[9px] font-bold gap-1 border-b pb-1">
                      <span>س1</span>
                      <span>س2</span>
                      <span>س3</span>
                      <span>س4</span>
                      <span className="text-red-700">المجموع</span>
                    </div>
                    <div className="grid grid-cols-5 text-[10px] font-mono gap-1 pt-1 text-slate-500">
                      <span>... / 20</span>
                      <span>... / 20</span>
                      <span>... / 40</span>
                      <span>... / 20</span>
                      <span className="font-bold text-slate-900">... / {examPaper.totalMarks}</span>
                    </div>
                  </div>

                </div>

                {/* ========================================== */}
                {/* 3. INSTRUCTIONS BOX */}
                {/* ========================================== */}
                <div className="border border-dashed border-amber-600/70 bg-amber-50/50 p-3 rounded text-[11px] text-slate-800 space-y-1">
                  <p className="font-black text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    تعليمات هامة للطلاب:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700 pr-2">
                    {examPaper.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                </div>

                {/* Notice banner if viewing Model Answer */}
                {showModelAnswer && (
                  <div className="border-2 border-emerald-600 bg-emerald-50 p-2.5 rounded text-center text-xs font-black text-emerald-900 flex items-center justify-center gap-2">
                    <Award className="w-4 h-4 text-emerald-700" />
                    <span>⚠️ هذا المستند معروض في وضع [النموذج الرسمي للإجابة النموذجية وسلم توزيع الدرجات]</span>
                  </div>
                )}

                {/* ========================================== */}
                {/* 4. THE EXAM PARTS & QUESTIONS */}
                {/* ========================================== */}
                <div className="space-y-8 pt-2">
                  {examPaper.parts.map((part, pIdx) => (
                    <div key={part.id} className="space-y-4">
                      
                      {/* Section Heading Banner */}
                      <div className="border-b-2 border-slate-900 pb-1.5 flex items-center justify-between">
                        <div>
                          <h2 className="text-sm sm:text-base font-black text-slate-950">
                            {part.partNumber}: {part.title}
                          </h2>
                          <p className="text-[11px] text-slate-600 font-sans">{part.instructions}</p>
                        </div>
                        <span className="px-2.5 py-1 text-xs font-black bg-slate-100 text-slate-900 border border-slate-300 rounded">
                          ({part.totalMarks} درجة)
                        </span>
                      </div>

                      {/* Question Items in this Part */}
                      <div className="space-y-4 pr-1">
                        {part.questions.map((q) => (
                          <div key={q.id} className="space-y-2 text-xs leading-relaxed">
                            
                            {/* Question Header & Prompt */}
                            <div className="flex items-start justify-between gap-3">
                              <p className="font-bold text-slate-900 flex-1">
                                <span className="font-black ml-1">({q.number})</span> {q.text}
                              </p>
                              <span className="text-[10px] font-black text-slate-500 whitespace-nowrap">
                                [{q.marks} درجات]
                              </span>
                            </div>

                            {q.englishText && (
                              <p className="text-[11px] text-slate-500 font-sans italic pr-4" dir="ltr">
                                {q.englishText}
                              </p>
                            )}

                            {/* TYPE 1: Multiple Choice Options */}
                            {q.type === 'mcq' && q.options && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-4 pt-1">
                                {q.options.map((opt, oIdx) => {
                                  const optionLetter = String.fromCharCode(65 + oIdx);
                                  const isCorrect = q.correctOptionIndex === oIdx;

                                  return (
                                    <div
                                      key={oIdx}
                                      className={`p-2 rounded border text-xs flex items-center gap-2 transition-all ${
                                        showModelAnswer && isCorrect
                                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                                          : 'border-slate-300 bg-slate-50/50 text-slate-800'
                                      }`}
                                    >
                                      <span
                                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                          showModelAnswer && isCorrect
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-200 text-slate-700'
                                        }`}
                                      >
                                        {optionLetter}
                                      </span>
                                      <span>{opt}</span>
                                      {showModelAnswer && isCorrect && (
                                        <Check className="w-3.5 h-3.5 text-emerald-600 mr-auto shrink-0" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* TYPE 2: True / False Answer Prompt Lines (when not showing model answer) */}
                            {q.type === 'true_false' && !showModelAnswer && (
                              <div className="pr-4 space-y-1.5 text-[11px] text-slate-600">
                                <div className="flex items-center gap-4">
                                  <span>الإجابة: [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]</span>
                                  <span>التعليل العلمي: ..........................................................................................................................</span>
                                </div>
                              </div>
                            )}

                            {/* TYPE 3: Problems Work Space Placeholder (when not showing model answer) */}
                            {(q.type === 'problem' || q.type === 'diagram_derivation') && !showModelAnswer && (
                              <div className="my-2 border border-dashed border-slate-300 rounded p-4 text-[10px] text-slate-400 bg-slate-50/30 min-h-[90px] flex items-center justify-center">
                                <span>[مساحة مخصصة لكتابة القوانين، التعويض الحسابي، ورسم المخططات]</span>
                              </div>
                            )}

                            {/* MODEL ANSWER BOX (Visible only in Model Answer mode) */}
                            {showModelAnswer && (
                              <div className="mr-3 mt-1.5 p-3 rounded-lg border-r-4 border-emerald-600 bg-emerald-50/70 space-y-1.5 text-[11px]">
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-emerald-950 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    الحل النموذجي المعتمد:
                                  </span>
                                  {q.formulaUsed && (
                                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                                      القانون: {q.formulaUsed}
                                    </span>
                                  )}
                                </div>

                                <p className="font-bold text-slate-900 whitespace-pre-line leading-relaxed">
                                  {q.modelAnswer}
                                </p>

                                {q.steps && q.steps.length > 0 && (
                                  <div className="mt-2 space-y-1 border-t border-emerald-200/60 pt-1.5">
                                    <span className="font-bold text-slate-800 text-[10px]">خطوات الحل بالتفصيل:</span>
                                    {q.steps.map((step, sIdx) => (
                                      <p key={sIdx} className="text-slate-800 text-[10.5px] pr-2">
                                        • {step}
                                      </p>
                                    ))}
                                  </div>
                                )}

                                {q.explanation && (
                                  <p className="text-[10px] text-slate-600 italic border-t border-emerald-200/60 pt-1">
                                    💡 سلم التصحيح والتعليل: {q.explanation}
                                  </p>
                                )}
                              </div>
                            )}

                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>

                {/* ========================================== */}
                {/* 5. OFFICIAL EXAM FOOTER */}
                {/* ========================================== */}
                <div className="border-t-2 border-slate-900 pt-6 mt-8 space-y-5 text-center text-xs">
                  
                  <p className="font-black text-slate-950 text-sm tracking-wide">
                    « انـتـهـت الأسـئـلـة – مـع تـمـنـيـاتـنـا لـكـم بـالـتـوفـيـق والـنـجـاح الـدائـم »
                  </p>

                  <div className="grid grid-cols-3 gap-4 pt-2 text-[11px] font-bold text-slate-800">
                    <div className="space-y-4">
                      <p>أستاذ المقرر:</p>
                      <p className="text-slate-500 font-normal">........................................</p>
                    </div>
                    <div className="space-y-4">
                      <p>رئيس القسم:</p>
                      <p className="text-slate-500 font-normal">........................................</p>
                    </div>
                    <div className="space-y-4">
                      <p>عميد الكلية:</p>
                      <p className="text-slate-500 font-normal">........................................</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200 pt-2">
                    <span>أكاديمية الميكاترونكس اليمنية - بنك النماذج والامتحانات الرسمية</span>
                    <span>صفحة (1) من (1)</span>
                    <span>تاريخ الإصدار: {examPaper.header.examDate}</span>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* BOTTOM FOOTER INFO (Hidden during print) */}
        {/* ========================================================= */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>جاهز للتصدير كملف PDF عالي الجودة للطباعة الورقية أو كصورة فورية لمشاركتها على واتساب وتيليجرام.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModelAnswer(!showModelAnswer)}
              className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
            >
              {showModelAnswer ? 'تبديل إلى ورقة الامتحان للحل' : 'عرض الحل النموذجي وسلم الدرجات'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
