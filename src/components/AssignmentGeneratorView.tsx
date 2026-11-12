import React, { useState, useEffect, useRef } from 'react';
import {
  StudentProfile,
  AssignmentType,
  EngineeringAssignment,
  AssignmentSection,
  AssignmentDetailLevel,
  AssignmentLanguage,
} from '../types';
import { ASSIGNMENT_TYPES_INFO } from '../data/assignmentConstants';
import { AssignmentSectionEditor } from './AssignmentSectionEditor';
import { AssignmentDocumentView } from './AssignmentDocumentView';
import { exportElementToPdf } from '../utils/pdfGenerator';
import {
  GraduationCap,
  Sparkles,
  FileText,
  Download,
  Eye,
  Edit3,
  Plus,
  RefreshCw,
  FolderOpen,
  Save,
  Trash2,
  HelpCircle,
  Cpu,
  BookOpen,
  ArrowRight,
  Printer,
  FileDown,
  Layers,
  ChevronDown,
  AlertCircle,
  Settings,
  Share2,
  CheckCircle2,
} from 'lucide-react';

interface AssignmentGeneratorViewProps {
  student: StudentProfile;
  onNavigateToTab?: (tab: string) => void;
}

const STORAGE_KEY = 'mechatronics_saved_assignments_v1';

export const AssignmentGeneratorView: React.FC<AssignmentGeneratorViewProps> = ({
  student,
  onNavigateToTab,
}) => {
  // Step State: 'create' -> 'editor' -> 'preview'
  const [activeStep, setActiveStep] = useState<'create' | 'editor' | 'preview'>('create');

  // Form Configuration State
  const [selectedType, setSelectedType] = useState<AssignmentType>('lab_report');
  const [subject, setSubject] = useState('دوائر كهربائية 1');
  const [assignmentTitle, setAssignmentTitle] = useState('تحقيق قانون أوم ومجزئ الجهد عملياً');
  const [studentName, setStudentName] = useState(student.name || 'مهندس ميكاترونكس');
  const [studentId, setStudentId] = useState('');
  const [professorName, setProfessorName] = useState('دكتور المادة المحترم');
  const [university, setUniversity] = useState(student.university || 'الجامعة الإماراتية الدولية – صنعاء');
  const [college, setCollege] = useState('كلية الهندسة وتكنولوجيا المعلومات');
  const [major, setMajor] = useState(student.major || 'هندسة الميكاترونكس');
  const [studyLevel, setStudyLevel] = useState<string>(student.studyLevel || 'السنة الأولى');
  const [submissionDate, setSubmissionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pageCountTarget, setPageCountTarget] = useState(3);
  const [language, setLanguage] = useState<AssignmentLanguage>('ar');
  const [detailLevel, setDetailLevel] = useState<AssignmentDetailLevel>('academic');
  const [customRequirements, setCustomRequirements] = useState('');

  // Active Assignment Data
  const [currentAssignment, setCurrentAssignment] = useState<EngineeringAssignment | null>(null);
  const [savedAssignments, setSavedAssignments] = useState<EngineeringAssignment[]>([]);

  // Generation & Export UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportProgressText, setExportProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showSavedModal, setShowSavedModal] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Load Saved Assignments on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedAssignments(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load saved assignments:', e);
    }
  }, []);

  const saveAssignmentsToStorage = (list: EngineeringAssignment[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      setSavedAssignments(list);
    } catch (e) {
      console.warn('Failed to save assignment:', e);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Quick prompt presets when user clicks an assignment type
  const handleTypeSelect = (type: AssignmentType) => {
    setSelectedType(type);
    const info = ASSIGNMENT_TYPES_INFO[type];
    if (info) {
      if (type === 'lab_report') {
        setAssignmentTitle('تقرير تجربة: تحقيق قانون أوم ومجزئ الجهد');
        setSubject('دوائر كهربائية 1');
      } else if (type === 'arduino') {
        setAssignmentTitle('نظام تحكم ذكي لقياس المسافات وتنبيه العوائق باستخدام Arduino');
        setSubject('متحكمات دقيقة وميكاترونكس');
      } else if (type === 'plc') {
        setAssignmentTitle('برمجة خط فرز وتعبئة صناعي بمخطط السلم المنطقي (Ladder Logic)');
        setSubject('التحكم الآلي والـ PLC');
      } else if (type === 'problem_solving') {
        setAssignmentTitle('حل مسائل العزوم والاتزان الميكانيكي وتطبيقاتها في الميكاترونكس');
        setSubject('ميكانيكا هندسية (استاتيكا)');
      } else if (type === 'research') {
        setAssignmentTitle('تطبيقات الذكاء الاصطناعي والحساسات الذكية في الأذرع الروبوتية');
        setSubject('مقدمة في الميكاترونكس');
      }
    }
  };

  // Handle Full AI Assignment Generation
  const handleGenerateAssignment = async () => {
    if (!assignmentTitle.trim()) {
      setErrorMessage('يرجى كتابة عنوان التكليف الهندسي.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const payload = {
        type: selectedType,
        subject,
        title: assignmentTitle,
        studentName,
        studentId,
        professorName,
        university,
        college,
        major,
        studyLevel,
        pageCountTarget,
        submissionDate,
        language,
        detailLevel,
        customRequirements,
      };

      const res = await fetch('/api/assignments/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.assignment) {
        const assignment: EngineeringAssignment = data.assignment;
        setCurrentAssignment(assignment);

        // Auto-save to local history
        const updatedList = [assignment, ...savedAssignments.filter((a) => a.id !== assignment.id)];
        saveAssignmentsToStorage(updatedList);

        setActiveStep('editor');
        showToast('✨ تم إنشاء التكليف بنجاح! يمكنك الآن تعديل وإضافة وحذف أي قسم.');
      } else {
        setErrorMessage(data.error || 'تعذر إنشاء التكليف. يرجى المحاولة مرة أخرى.');
      }
    } catch (err: any) {
      setErrorMessage('تعذر الاتصال بالخادم. يرجى التحقق من الشبكة ثم إعادة المحاولة.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save current assignment changes
  const handleSaveCurrentAssignment = () => {
    if (!currentAssignment) return;
    const updated: EngineeringAssignment = {
      ...currentAssignment,
      updatedAt: new Date().toISOString(),
    };
    setCurrentAssignment(updated);
    const updatedList = [updated, ...savedAssignments.filter((a) => a.id !== updated.id)];
    saveAssignmentsToStorage(updatedList);
    showToast('💾 تم حفظ التكليف بنجاح في جهازك.');
  };

  // Section Management in Editor
  const handleUpdateSection = (index: number, updated: AssignmentSection) => {
    if (!currentAssignment) return;
    const newSections = [...currentAssignment.sections];
    newSections[index] = updated;
    setCurrentAssignment({ ...currentAssignment, sections: newSections });
  };

  const handleDeleteSection = (index: number) => {
    if (!currentAssignment) return;
    if (confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      const newSections = currentAssignment.sections.filter((_, i) => i !== index);
      setCurrentAssignment({ ...currentAssignment, sections: newSections });
    }
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (!currentAssignment) return;
    const newSections = [...currentAssignment.sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;
    setCurrentAssignment({ ...currentAssignment, sections: newSections });
  };

  const handleAddSection = () => {
    if (!currentAssignment) return;
    const newSec: AssignmentSection = {
      id: `sec-${Date.now()}`,
      title: `قسم إضافي جديد (${currentAssignment.sections.length + 1})`,
      type: 'text',
      content: 'اكتب محتوى هذا القسم الهندسي هنا...',
    };
    setCurrentAssignment({
      ...currentAssignment,
      sections: [...currentAssignment.sections, newSec],
    });
  };

  // Export to PDF
  const handleExportPdf = async () => {
    const el = document.getElementById('assignment-document-render');
    if (!el) {
      showToast('⚠️ يرجى التبديل لوضع المعاينة قبل تصدير PDF.');
      setActiveStep('preview');
      return;
    }

    setIsExportingPdf(true);
    setExportProgressText('جاري إعداد التكليف بصيغة PDF عالية الجودة...');

    try {
      const cleanTitle = (currentAssignment?.title || 'تكليف_هندسي')
        .replace(/[^a-zA-Z0-9\u0600-\u06FF\s_-]/g, '')
        .trim();
      await exportElementToPdf(el, {
        fileName: `${cleanTitle || 'تقرير_ميكاترونكس'}.pdf`,
        onProgress: (msg) => setExportProgressText(msg),
      });
      showToast('🎉 تم تصدير التكليف إلى ملف PDF بنجاح!');
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تصدير PDF');
    } finally {
      setIsExportingPdf(false);
      setExportProgressText('');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in" dir="rtl">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-sm font-bold animate-bounce-short">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>خدمة طلاب الميكاترونكس والهندسة الأكاديمية</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>🎓 منشئ التكليفات الهندسية</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              أنشئ واجباتك، أبحاثك، تقارير المختبرات، ومشاريع الآردوينو والـ PLC بدقة هندسية، مع إمكانية تعديل كل قسم يدوياً وتصدير ملف PDF جاهز للطباعة والتسليم.
            </p>
          </div>

          {/* Quick Action Top Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowSavedModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border border-white/10 backdrop-blur-xs"
            >
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <span>تكليفاتي السابقة ({savedAssignments.length})</span>
            </button>

            {currentAssignment && (
              <button
                onClick={() => {
                  if (activeStep === 'preview') setActiveStep('editor');
                  else setActiveStep('preview');
                }}
                className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                {activeStep === 'preview' ? (
                  <>
                    <Edit3 className="w-4 h-4" />
                    <span>العودة للتعديل</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>معاينة المستند</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Multi-Step Navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveStep('create')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeStep === 'create'
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-blue-800 text-white text-[11px] flex items-center justify-center font-bold">
              1
            </span>
            <span>بيانات ونوع التكليف</span>
          </button>

          <span className="text-white/30">←</span>

          <button
            onClick={() => currentAssignment && setActiveStep('editor')}
            disabled={!currentAssignment}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
              activeStep === 'editor'
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-blue-800 text-white text-[11px] flex items-center justify-center font-bold">
              2
            </span>
            <span>محرر الأقسام والمحتوى</span>
          </button>

          <span className="text-white/30">←</span>

          <button
            onClick={() => currentAssignment && setActiveStep('preview')}
            disabled={!currentAssignment}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
              activeStep === 'preview'
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-blue-800 text-white text-[11px] flex items-center justify-center font-bold">
              3
            </span>
            <span>المعاينة وتصدير PDF</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* STEP 1: CREATE / CONFIGURE ASSIGNMENT                     */}
      {/* ======================================================== */}
      {activeStep === 'create' && (
        <div className="space-y-6">
          {/* 1. Choose Assignment Type Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>1. اختر نوع التكليف الهندسي:</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                لكل نوع هيكلية مخصصة وأقسام هندسية دقيقة (مخططات، أكواد، جداول قياسات، نسب خطأ، أو استنتاجات).
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {(Object.keys(ASSIGNMENT_TYPES_INFO) as AssignmentType[]).map((typeKey) => {
                const info = ASSIGNMENT_TYPES_INFO[typeKey];
                const isSelected = selectedType === typeKey;
                return (
                  <button
                    key={typeKey}
                    type="button"
                    onClick={() => handleTypeSelect(typeKey)}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between space-y-2 cursor-pointer relative group ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-2xl">{info.icon}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {info.label}
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {info.defaultSections.length} أقسام مقترحة
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Assignment & Student Information Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>2. بيانات التكليف وغلاف الطباعة:</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                هذه البيانات ستظهر في صفحة الغلاف الأكاديمي الرسمية للمستند.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {/* Assignment Title */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  عنوان التكليف / المشروع <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  placeholder="مثال: تحقيق قانون أوم ومجزئ الجهد عملياً"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  المادة الدراسية <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="مثال: دوائر كهربائية 1"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Student Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  اسم الطالب المهندس <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="الاسم الرباعي للطالب"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Student ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  الرقم الأكاديمي (اختياري)
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="مثال: 20241045"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Professor Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  إشراف الدكتور / الأستاذ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={professorName}
                  onChange={(e) => setProfessorName(e.target.value)}
                  placeholder="مثال: د. أحمد الشامي"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* University */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  الجامعة
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="اسم الجامعة"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Major & Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  التخصص والمستوى الدراسي
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="التخصص"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs"
                  />
                  <input
                    type="text"
                    value={studyLevel}
                    onChange={(e) => setStudyLevel(e.target.value)}
                    placeholder="المستوى"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs"
                  />
                </div>
              </div>

              {/* Submission Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  تاريخ التسليم
                </label>
                <input
                  type="date"
                  value={submissionDate}
                  onChange={(e) => setSubmissionDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Target Page Count */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  عدد الصفحات المستهدف
                </label>
                <select
                  value={pageCountTarget}
                  onChange={(e) => setPageCountTarget(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm cursor-pointer"
                >
                  <option value={1}>صفحة واحدة (مكثف)</option>
                  <option value={2}>صفحتان (2 صفحات)</option>
                  <option value={3}>3 صفحات (تقرير قياسي)</option>
                  <option value={4}>4 صفحات</option>
                  <option value={5}>5 صفحات (مفصل وشامل)</option>
                  <option value={8}>8 صفحات (مشروع / بحث كامل)</option>
                </select>
              </div>

              {/* Language */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  لغة كتابة التكليف
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguage('ar')}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-xs cursor-pointer transition-all ${
                      language === 'ar'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🇾🇪 العربية (مع مصطلحات إنجليزية)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-xs cursor-pointer transition-all ${
                      language === 'en'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🌐 English (Academic)
                  </button>
                </div>
              </div>

              {/* Detail Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  مستوى الصياغة والعمق
                </label>
                <select
                  value={detailLevel}
                  onChange={(e: any) => setDetailLevel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm cursor-pointer"
                >
                  <option value="short">موجز وسريع</option>
                  <option value="medium">متوسط ومتوازن</option>
                  <option value="advanced">متقدم مع حسابات تفصيلية</option>
                  <option value="academic">أكاديمي جامعي رصين (الأفضل)</option>
                </select>
              </div>
            </div>

            {/* Custom Instructions / Specific Problem Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>تعليمات أو متطلبات إضافية من الدكتور (اختياري):</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  يمكنك لصق نص السؤال، قيم معطيات محددة، أو أرقام تجربة معينة
                </span>
              </label>
              <textarea
                rows={3}
                value={customRequirements}
                onChange={(e) => setCustomRequirements(e.target.value)}
                placeholder="مثال: يرجى التركيز على طريقة كيرشوف، وتضمين كود الآردوينو مع تعليقات على كل سطر، مع جدول قراءات المقاومات 100 أوم و 330 أوم..."
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit / Generate Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateAssignment}
                disabled={isGenerating}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg shadow-blue-500/25 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>جاري صياغة وبناء التكليف الهندسي بالذكاء الاصطناعي...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>إنشاء التكليف الهندسي الآن</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 2: RICH SECTION-BY-SECTION EDITOR                   */}
      {/* ======================================================== */}
      {activeStep === 'editor' && currentAssignment && (
        <div className="space-y-6">
          {/* Top Bar: Title & Quick Controls */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-xs">
                  {currentAssignment.typeLabel}
                </span>
                <span className="text-xs text-slate-500">
                  {currentAssignment.sections.length} أقسام
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                {currentAssignment.title}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSaveCurrentAssignment}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4 text-blue-600" />
                <span>حفظ التعديلات</span>
              </button>

              <button
                type="button"
                onClick={handleAddSection}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قسم جديد</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep('preview')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
              >
                <Eye className="w-4 h-4" />
                <span>معاينة وتصدير PDF</span>
              </button>
            </div>
          </div>

          {/* List of Section Editors */}
          <div className="space-y-4">
            {currentAssignment.sections.map((section, idx) => (
              <AssignmentSectionEditor
                key={section.id || idx}
                section={section}
                index={idx}
                totalSections={currentAssignment.sections.length}
                subject={currentAssignment.subject}
                major={currentAssignment.cover.major}
                onUpdate={(updated) => handleUpdateSection(idx, updated)}
                onDelete={() => handleDeleteSection(idx)}
                onMoveUp={() => handleMoveSection(idx, 'up')}
                onMoveDown={() => handleMoveSection(idx, 'down')}
              />
            ))}
          </div>

          {/* Bottom Add Section Button */}
          <div className="text-center py-4">
            <button
              type="button"
              onClick={handleAddSection}
              className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-blue-300 dark:border-blue-800 hover:border-blue-500 text-blue-700 dark:text-blue-300 font-bold text-sm inline-flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قسم أو تجربة إضافية للتكليف</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 3: HIGH-FIDELITY PRINT & PDF PREVIEW                */}
      {/* ======================================================== */}
      {activeStep === 'preview' && currentAssignment && (
        <div className="space-y-6">
          {/* Action Toolbar for Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs sticky top-4 z-40">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>معاينة المستند المطبوع A4</span>
              </h2>
              <p className="text-xs text-slate-500">
                مخطط جاهز وفق المعايير الأكاديمية. يمكنك التصدير إلى PDF الآن أو الطباعة المباشرة.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveStep('editor')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>العودة للمحرر</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
              >
                {isExportingPdf ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{exportProgressText || 'جاري تجهيز PDF...'}</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>تصدير PDF جاهز للطباعة</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Actual Document Render Container */}
          <div ref={previewContainerRef} className="py-2 overflow-x-auto">
            <AssignmentDocumentView
              cover={currentAssignment.cover}
              sections={currentAssignment.sections}
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SAVED ASSIGNMENTS MODAL                                  */}
      {/* ======================================================== */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg">
                  التكليفات المحفوظة على جهازك ({savedAssignments.length})
                </h3>
              </div>
              <button
                onClick={() => setShowSavedModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {savedAssignments.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                    لم تقم بحفظ أي تكليفات حتى الآن.
                  </p>
                  <p className="text-xs text-slate-400">
                    عندما تنشئ تكليفاً جديداً، سيتم حفظه تلقائياً هنا للرجوع إليه في أي وقت دون الحاجة لتسجيل دخول.
                  </p>
                </div>
              ) : (
                savedAssignments.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between gap-4 hover:border-blue-500 transition-all"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                          {item.typeLabel}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(item.updatedAt || item.createdAt).toLocaleDateString('ar-YE')}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">
                        المادة: {item.subject} • {item.sections.length} أقسام
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setCurrentAssignment(item);
                          setActiveStep('editor');
                          setShowSavedModal(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                      >
                        فتح
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا التكليف؟')) {
                            const updated = savedAssignments.filter((a) => a.id !== item.id);
                            saveAssignmentsToStorage(updated);
                            if (currentAssignment?.id === item.id) {
                              setCurrentAssignment(null);
                            }
                          }
                        }}
                        className="p-1.5 rounded-xl hover:bg-rose-100 text-rose-500 cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
