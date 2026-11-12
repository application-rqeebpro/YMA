import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  PenTool, 
  FileCode, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Bookmark, 
  Copy, 
  Share2, 
  RefreshCw, 
  Calculator, 
  Layers, 
  Zap, 
  Scale, 
  Ruler, 
  Binary, 
  ChevronRight, 
  ExternalLink, 
  Printer, 
  Check, 
  X, 
  BookOpen, 
  Clock, 
  Calendar, 
  Trash2, 
  Lightbulb, 
  ArrowRight,
  ArrowLeft,
  Sliders,
  Send,
  Atom,
  Eye,
  AlertTriangle,
  FileCheck,
  Mic,
  MicOff,
  Square,
  Play,
  Volume2,
  VolumeX,
  Pause,
  Wand2,
  Plus,
  BookMarked,
  GraduationCap,
  Presentation,
  CheckSquare
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { 
  StudentProfile, 
  ExplainLessonResult, 
  ExplainSourceType, 
  ExplainLevel,
  ExplainQuizQuestion,
  SmartDoctorConfig,
  EducationalSlide,
  EducationalPresentation,
  BookSearchResult
} from '../types';
import { configureMaleArabicUtterance } from '../utils/arabicVoiceCleaner';

export interface ProcessedImageItem {
  id: string;
  file: File;
  base64: string;
  mimeType: string;
  previewUrl: string;
  name: string;
}
import { ExplainFourteenSections } from './ExplainFourteenSections';
import { ExamModal } from './ExamModal';
import { INITIAL_SUBJECTS } from '../data/initialData';

// High-detail image optimization helper for mobile phones and web
const optimizeImageForVision = (
  file: File
): Promise<{ base64: string; previewUrl: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('فشل قراءة ملف الصورة من جهازك.'));
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        return reject(new Error('ملف الصورة فارغ أو تالف.'));
      }

      const img = new Image();
      img.onerror = () => {
        resolve({ base64: rawDataUrl, previewUrl: rawDataUrl, mimeType: file.type || 'image/jpeg' });
      };
      img.onload = () => {
        try {
          const maxDim = 1920; // High resolution preserving formulas, schematics, and text
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ base64: rawDataUrl, previewUrl: rawDataUrl, mimeType: file.type || 'image/jpeg' });
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve({
            base64: compressedDataUrl,
            previewUrl: compressedDataUrl,
            mimeType: 'image/jpeg',
          });
        } catch (_) {
          resolve({ base64: rawDataUrl, previewUrl: rawDataUrl, mimeType: file.type || 'image/jpeg' });
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
};

interface ExplainLessonViewProps {
  student: StudentProfile;
  onNavigateToTool: (tabId: string, contextData?: any) => void;
  onOpenAiChat: (prompt: string) => void;
  initialLessonToOpen?: ExplainLessonResult | null;
}

export const ExplainLessonView: React.FC<ExplainLessonViewProps> = ({
  student,
  onNavigateToTool,
  onOpenAiChat,
  initialLessonToOpen = null,
}) => {
  // Input states
  const [sourceType, setSourceType] = useState<ExplainSourceType>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [processedImageData, setProcessedImageData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [processedImagesList, setProcessedImagesList] = useState<ProcessedImageItem[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [explanationLevel, setExplanationLevel] = useState<ExplainLevel>('simple');
  const [dragActive, setDragActive] = useState(false);

  // Analysis & Progress states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStage, setProgressStage] = useState(0);
  const [analysisPercent, setAnalysisPercent] = useState(12);
  const [analysisElapsedSeconds, setAnalysisElapsedSeconds] = useState(0);
  const [reassuranceTipIndex, setReassuranceTipIndex] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const progressTimerRef = useRef<any>(null);
  const percentTimerRef = useRef<any>(null);
  const elapsedTimerRef = useRef<any>(null);
  const tipTimerRef = useRef<any>(null);
  const [analysisResult, setAnalysisResult] = useState<ExplainLessonResult | null>(initialLessonToOpen);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // History states
  const [savedLessons, setSavedLessons] = useState<ExplainLessonResult[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  // Interactive modes
  const [showStudySheet, setShowStudySheet] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showExplainPartModal, setShowExplainPartModal] = useState(false);
  const [customPartText, setCustomPartText] = useState('');
  const [partAction, setPartAction] = useState<'explain' | 'simplify' | 'example' | 'solve' | 'verify'>('explain');
  const [isPartLoading, setIsPartLoading] = useState(false);
  const [partResultText, setPartResultText] = useState<string | null>(null);

  // Quiz interactive state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string | number | boolean>>({});
  const [revealedQuiz, setRevealedQuiz] = useState<Record<string, boolean>>({});

  // Active view tab inside analysis
  const [activeTab, setActiveTab] = useState<'explanation' | 'formulas' | 'example' | 'quiz' | 'tools'>('explanation');
  const [copySuccess, setCopySuccess] = useState(false);

  // PDF page mode & selection
  const [pdfMode, setPdfMode] = useState<'all' | 'page'>('all');
  const [pdfPageNumber, setPdfPageNumber] = useState('');

  // Presentation View Mode: 'stream' (Ordered 1-14 single flow) vs 'tabs'
  const [viewMode, setViewMode] = useState<'stream' | 'tabs'>('stream');

  // Serway Reference RAG integration
  const [useSerwayReference, setUseSerwayReference] = useState<boolean>(true);

  // Smart Doctor (الدكتور الذكي) Configuration
  const [showDoctorModal, setShowDoctorModal] = useState<boolean>(false);
  const [doctorConfig, setDoctorConfig] = useState<SmartDoctorConfig>({
    enabled: false,
    doctorName: '',
    university: student.university || 'الجامعة الإماراتية الدولية – صنعاء',
    studyLevel: student.studyLevel || 'السنة الأولى',
    subject: 'الفيزياء العامة والهندسية (Physics for Mechatronics)',
    lessonTitle: '',
    referenceSource: 'serway',
    explanationStyle: 'simplified_beginner',
    durationMinutes: 15,
    isAiDisclaimerAcknowledged: true,
  });

  // Educational Presentation (سلايدات الفيديو التفاعلية)
  const [showPresentationModal, setShowPresentationModal] = useState<boolean>(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isSpeakingSlide, setIsSpeakingSlide] = useState<boolean>(false);

  // Listen for custom topic events from References Library
  useEffect(() => {
    const handleExternalTopic = (e: any) => {
      if (e.detail?.topic) {
        setSourceType('text');
        setTextInput(e.detail.topic);
        setUseSerwayReference(true);
        if (doctorConfig) {
          setDoctorConfig((prev) => ({ ...prev, lessonTitle: e.detail.topic }));
        }
      }
    };
    window.addEventListener('mct_explain_topic', handleExternalTopic);
    return () => window.removeEventListener('mct_explain_topic', handleExternalTopic);
  }, []);

  // Web Speech API synthesis helper for slides
  const speakSlideText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('المتصفح الحالي لا يدعم ميزة تحويل النص إلى كلام (Web Speech API).');
      return;
    }
    if (isSpeakingSlide) {
      window.speechSynthesis.cancel();
      setIsSpeakingSlide(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = configureMaleArabicUtterance(text, 1.0);
    utterance.onend = () => setIsSpeakingSlide(false);
    utterance.onerror = () => setIsSpeakingSlide(false);
    setIsSpeakingSlide(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingSlide(false);
  };

  // Audio Recording & Speech-to-Text states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionSuccess, setTranscriptionSuccess] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const startRecording = async () => {
    setErrorMsg(null);
    setTranscribedText('');
    setTranscriptionSuccess(false);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg('متصفحك الحالي لا يدعم تسجيل الصوت المباشر من الميكروفون. يمكنك رفع ملف صوتي بدلاً من ذلك.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        stream.getTracks().forEach((track) => track.stop());

        // Automatically transcribe audio speech to text
        handleTranscribeAudioBlob(blob, mimeType);
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Mic error:', err);
      setErrorMsg('تعذر الوصول إلى الميكروفون. يرجى السماح للمتصفح بالوصول للميكروفون والمحاولة ثانية.');
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribeAudioBlob = async (blobOrFile: Blob | File, mimeType?: string) => {
    setIsTranscribing(true);
    setErrorMsg(null);
    setTranscriptionSuccess(false);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          if (res && res.includes(',')) {
            resolve(res.split(',')[1]);
          } else {
            resolve(res || '');
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blobOrFile);
      });

      const rawType = mimeType || blobOrFile.type || 'audio/webm';
      const cleanMime = rawType.split(';')[0].trim() || 'audio/webm';

      const res = await fetch('/api/transcribe-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: base64Data,
          mimeType: cleanMime,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'حدث خطأ أثناء تحويل الصوت إلى نص.');
      }

      const data = await res.json();
      if (data.text) {
        setTranscribedText(data.text);
        setTextInput(data.text);
        setTranscriptionSuccess(true);
      } else {
        throw new Error('لم يتلقَ النظام أية نصوص من المقطع الصوتي.');
      }
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMsg(err.message || 'فشل تحويل الصوت إلى نص. يرجى إعادة التسجيل والتحدث بوضوح.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const resultsTopRef = useRef<HTMLDivElement>(null);

  // Progress message sequence
  const PROGRESS_STAGES = [
    'جاري قراءة المحتوى وفحص البيانات...',
    'جاري استخراج المفاهيم الهندسية والمصطلحات...',
    'جاري تحليل القوانين والأبعاد الفيزيائية والوحدات...',
    'جاري تبسيط الشرح لطالب سنة أولى ميكاترونكس...',
    'جاري إعداد الأمثلة المحلولة والاختبار التجريبي...',
    'تم تجهيز شرح الدرس بنجاح!',
  ];

  const REASSURANCE_TIPS = [
    '⚡ جاري استخراج المعادلات والرموز الفيزيائية بدقة هندسية عبر ذكاء Gemini...',
    '🧠 النموذج يحلل العلاقات الرياضية والدوائر لتقديم شرح مبسط ومفصل خطوة بخطوة...',
    '📐 يتم إعداد مسائل محلولة رقمياً متوافقة تماماً مع تخصص هندسة الميكاترونكس...',
    '⏱️ فحص ملفات الـ PDF والملازم يستغرق بضع ثوانٍ إضافية لضمان دقة القوانين...',
    '💡 لا تقلق! النظام متصل ويعالج البيانات مباشرة وبنشاط ولم يتوقف التطبيق...',
    '🎯 يتم بناء ورقة المذاكرة الشاملة والاختبار التجريبي للدرس حالياً...',
  ];

  const formatElapsedSeconds = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getAnalysisPipelineSteps = () => {
    if (sourceType === 'pdf') {
      return [
        { title: 'قراءة وفهرسة الـ PDF', subtitle: 'استخراج الصفحات والنصوص الهندسية' },
        { title: 'تحليل القوانين والمعادلات', subtitle: 'فحص الرموز والوحدات الفيزيائية' },
        { title: 'معالجة Gemini الذكية', subtitle: 'تفكيك المفاهيم وشرح الدرس بالتفصيل' },
        { title: 'بناء الأقسام الـ 14 والتمارين', subtitle: 'تجهيز الأمثلة المحلولة والاختبار' },
      ];
    }
    if (processedImagesList.length > 1) {
      return [
        { title: `قراءة ${processedImagesList.length} صور`, subtitle: 'تهيئة وفحص جودة الصور' },
        { title: 'ربط المحتوى الهندسي', subtitle: 'تجميع القوانين والمسائل المتفرقة' },
        { title: 'تحليل Gemini الشامل', subtitle: 'صياغة الشرح الأكاديمي المتسلسل' },
        { title: 'صياغة المخرجات والتمارين', subtitle: 'إعداد الأقسام الـ 14 وورقة المذاكرة' },
      ];
    }
    if (sourceType === 'image') {
      return [
        { title: 'فحص الصورة والمستند', subtitle: 'التعرف البصري عالي الدقة (Vision)' },
        { title: 'استخراج القوانين والدوائر', subtitle: 'رصد المكونات والمعادلات المكتوبة' },
        { title: 'التحليل الهندسي عبر Gemini', subtitle: 'تفكيك الشرح خطوة بخطوة' },
        { title: 'تجهيز الأقسام الـ 14 والاختبار', subtitle: 'صياغة المخرجات النهائية' },
      ];
    }
    if (sourceType === 'audio') {
      return [
        { title: 'تحويل الصوت إلى نص', subtitle: 'تفريغ دقيق للمصطلحات العلمية' },
        { title: 'استخراج المعطيات الهندسية', subtitle: 'رصد القوانين والمفاهيم المطروحة' },
        { title: 'معالجة Gemini الشاملة', subtitle: 'توليد الشرح الأكاديمي المنظم' },
        { title: 'إعداد المسائل والاختبار', subtitle: 'بناء الأقسام الـ 14 التفاعلية' },
      ];
    }
    return [
      { title: 'قراءة وفحص السؤال', subtitle: 'تحليل المتغيرات والمطلوب' },
      { title: 'تحديد القوانين ذات الصلة', subtitle: 'استدعاء النظريات الهندسية' },
      { title: 'المعالجة عبر Gemini', subtitle: 'شرح مبسط لطالب الميكاترونكس' },
      { title: 'إعداد الأمثلة والاختبار', subtitle: 'تجهيز الشرح النهائي الشامل' },
    ];
  };

  const handleCancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (percentTimerRef.current) clearInterval(percentTimerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    if (tipTimerRef.current) clearInterval(tipTimerRef.current);
    setIsAnalyzing(false);
    setErrorMsg('تم إلغاء تحليل ومعالجة الملف بناءً على طلبك.');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (percentTimerRef.current) clearInterval(percentTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (tipTimerRef.current) clearInterval(tipTimerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // Load student saved lessons from localStorage & API on mount
  useEffect(() => {
    loadSavedLessons();
  }, [student.id]);

  const loadSavedLessons = async () => {
    try {
      const localKey = `mct_explained_lessons_${student.id}`;
      const localData = localStorage.getItem(localKey);
      let localList: ExplainLessonResult[] = localData ? JSON.parse(localData) : [];

      // Fetch from server
      try {
        const res = await fetch(`/api/student-lessons/${student.id}`);
        if (res.ok) {
          const serverData = await res.json();
          if (serverData.lessons && serverData.lessons.length > 0) {
            // merge without duplicates
            const map = new Map<string, ExplainLessonResult>();
            localList.forEach((l) => map.set(l.id, l));
            serverData.lessons.forEach((l: ExplainLessonResult) => map.set(l.id, l));
            localList = Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
        }
      } catch (err) {
        // use local
      }

      setSavedLessons(localList);
      localStorage.setItem(localKey, JSON.stringify(localList));
    } catch (e) {
      console.warn('Failed to load saved lessons', e);
    }
  };

  const saveLessonToHistory = async (lesson: ExplainLessonResult) => {
    try {
      const localKey = `mct_explained_lessons_${student.id}`;
      const existing = savedLessons.filter((l) => l.id !== lesson.id);
      const updated = [lesson, ...existing];
      setSavedLessons(updated);
      localStorage.setItem(localKey, JSON.stringify(updated));

      setIsSavedFeedback(true);
      setTimeout(() => setIsSavedFeedback(false), 2500);

      // Persist to server
      fetch('/api/student-lessons/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson, studentId: student.id }),
      }).catch(() => {});
    } catch (e) {
      console.error('Error saving lesson:', e);
    }
  };

  const deleteLessonFromHistory = async (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const localKey = `mct_explained_lessons_${student.id}`;
      const updated = savedLessons.filter((l) => l.id !== lessonId);
      setSavedLessons(updated);
      localStorage.setItem(localKey, JSON.stringify(updated));

      fetch(`/api/student-lessons/${lessonId}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch (e) {
      console.error('Error deleting lesson', e);
    }
  };

  // Handle File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      const isAllImages = fileList.every(
        (f) => f.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp|gif|heic|heif)$/i.test(f.name)
      );

      if (fileList.length > 1 || processedImagesList.length > 0 || (sourceType === 'image' && isAllImages)) {
        processMultipleFiles(fileList);
      } else {
        processSelectedFile(fileList[0]);
      }
    }
  };

  const processMultipleFiles = async (files: File[]) => {
    setErrorMsg(null);
    setIsProcessingImage(true);
    setSourceType('image');

    const newItems: ProcessedImageItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImg = file.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp|gif|heic|heif)$/i.test(file.name);
      if (!isImg) continue;

      try {
        const optimized = await optimizeImageForVision(file);
        newItems.push({
          id: 'img-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7) + '-' + i,
          file,
          base64: optimized.base64,
          mimeType: optimized.mimeType,
          previewUrl: optimized.previewUrl,
          name: file.name,
        });
      } catch (err) {
        console.warn('Canvas optimization error:', err);
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onload = () => {
            const res = reader.result as string;
            newItems.push({
              id: 'img-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7) + '-' + i,
              file,
              base64: res,
              mimeType: file.type || 'image/jpeg',
              previewUrl: res,
              name: file.name,
            });
            resolve(null);
          };
          reader.readAsDataURL(file);
        });
      }
    }

    if (newItems.length > 0) {
      setProcessedImagesList((prev) => {
        const combined = [...prev, ...newItems];
        setSelectedFile(combined[0].file);
        setFilePreview(combined[0].previewUrl);
        setProcessedImageData({ base64: combined[0].base64, mimeType: combined[0].mimeType });
        return combined;
      });
    }
    setIsProcessingImage(false);
  };

  const removeImageFromList = (id: string) => {
    setProcessedImagesList((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      if (updated.length > 0) {
        setSelectedFile(updated[0].file);
        setFilePreview(updated[0].previewUrl);
        setProcessedImageData({ base64: updated[0].base64, mimeType: updated[0].mimeType });
      } else {
        setSelectedFile(null);
        setFilePreview(null);
        setProcessedImageData(null);
      }
      return updated;
    });
  };

  const clearAllImages = () => {
    setProcessedImagesList([]);
    setSelectedFile(null);
    setFilePreview(null);
    setProcessedImageData(null);
  };

  const processSelectedFile = async (file: File) => {
    setErrorMsg(null);

    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type.includes('pdf') || sourceType === 'pdf';
    const isAudio = sourceType === 'audio' || file.type.startsWith('audio/') || /\.(mp3|wav|m4a|ogg|webm|aac|flac)$/i.test(file.name);

    if (isAudio) {
      setSourceType('audio');
      setSelectedFile(file);
      setFilePreview('audio-file');
      setProcessedImageData(null);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      handleTranscribeAudioBlob(file, file.type || 'audio/mp3');
      return;
    }

    // Validate file type
    if (isPdf) {
      setSourceType('pdf');
      setSelectedFile(file);
      setFilePreview('pdf-document');
      setProcessedImageData(null);
      return;
    }

    if (sourceType === 'image') {
      const isImg = file.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp|gif|heic|heif)$/i.test(file.name);
      if (!isImg) {
        setErrorMsg('نوع الملف غير مدعوم. يرجى رفع صورة بصيغة (JPG, PNG, WEBP, GIF).');
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg('حجم الصورة كبير جداً (أكثر من 25 ميغابايت). يرجى اختيار صورة أصغر أو التقاط صورة عادية.');
        return;
      }
    }

    setSelectedFile(file);

    // Generate preview & optimize if image
    if (file.type.startsWith('image/') || sourceType === 'image') {
      setIsProcessingImage(true);
      try {
        const optimized = await optimizeImageForVision(file);
        setFilePreview(optimized.previewUrl);
        setProcessedImageData({ base64: optimized.base64, mimeType: optimized.mimeType });
      } catch (err: any) {
        console.warn('Canvas image optimization failed, falling back to direct FileReader:', err);
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          setFilePreview(res);
          setProcessedImageData({ base64: res, mimeType: file.type || 'image/jpeg' });
        };
        reader.readAsDataURL(file);
      } finally {
        setIsProcessingImage(false);
      }
    } else if (file.type.startsWith('video/')) {
      setFilePreview('video-file');
      setProcessedImageData(null);
    } else {
      setFilePreview('generic-file');
      setProcessedImageData(null);
    }
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      processSelectedFile(droppedFile);
    }
  };

  // Start Lesson Analysis
  const handleAnalyzeLesson = async (customAction?: string, customLevel?: ExplainLevel) => {
    if (isAnalyzing) return;

    // Validate inputs
    if (sourceType === 'audio' && !audioBlob && !selectedFile && !textInput.trim()) {
      setErrorMsg('يرجى تسجيل مقطع صوتي بالميكروفون أو اختيار ملف صوتي لشرحه.');
      return;
    }
    if (sourceType === 'image' && !selectedFile && !processedImageData && processedImagesList.length === 0 && !textInput.trim()) {
      setErrorMsg('يرجى اختيار أو التقاط صورة واحدة أو أكثر للدرس أو المسألة أولاً.');
      return;
    }
    if (sourceType === 'text' && !textInput.trim()) {
      setErrorMsg('يرجى كتابة أو لصق نص الدرس أو السؤال أولاً.');
      return;
    }
    if (sourceType !== 'text' && !selectedFile && !processedImageData && processedImagesList.length === 0 && !audioBlob && !textInput.trim()) {
      setErrorMsg('يرجى رفع ملف أو تسجيل صوتي أو كتابة النص المطلوب شرحه.');
      return;
    }

    setIsAnalyzing(true);
    setProgressStage(0);
    setAnalysisPercent(12);
    setAnalysisElapsedSeconds(0);
    setReassuranceTipIndex(0);
    setErrorMsg(null);

    // Clear previous timers if any
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (percentTimerRef.current) clearInterval(percentTimerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    if (tipTimerRef.current) clearInterval(tipTimerRef.current);

    const stages = sourceType === 'audio' ? [
      'جاري استماع الميكروفون وتحويل الصوت إلى نص...',
      'جاري استخراج المصطلحات والقوانين والرموز الهندسية...',
      'جاري تحليل الدرس والمسائل المذكورة صوتياً...',
      'جاري إعداد الشرح الهندسي لطلاب الميكاترونكس...',
      'تم تحويل الصوت وشرح الدرس بنجاح! 🚀',
    ] : sourceType === 'pdf' ? [
      'جاري قراءة واستخراج نصوص ومعادلات ملف الـ PDF...',
      'جاري فهرسة صفحات ومفاهيم الدرس الهندسي...',
      'جاري استخراج القوانين والمسائل المحلولة والأمثلة...',
      'جاري إعداد الشرح الشامل لطلاب الميكاترونكس وفق الأقسام الـ 14...',
      'تم تحليل ملف الـ PDF وشرح الدرس بنجاح! 🚀',
    ] : processedImagesList.length > 1 ? [
      `جاري قراءة وتعالج ${processedImagesList.length} صور مرفوعة للدرس...`,
      'جاري التفكيك والتحليل التسلسلي صورة صورة (1 إلى ' + processedImagesList.length + ')...',
      'جاري استخراج كافة القوانين والمعادلات والمسائل من كل الصور...',
      'جاري تجميع الشرح الهندسي الشامل لكل أجزاء الدرس...',
      `تم تفكيك وشرح الـ ${processedImagesList.length} صور بنجاح! 🚀`,
    ] : sourceType === 'image' ? [
      'جاري قراءة الصورة والتعرف على العناصر الهندسية...',
      'جاري فحص النصوص والمعادلات والدوائر الكهربائية...',
      'جاري تحليل الدرس والمسائل خطوة بخطوة...',
      'جاري إعداد الشرح الهندسي لطلاب الميكاترونكس...',
      'تم تجهيز شرح الصورة بنجاح! 🚀',
    ] : PROGRESS_STAGES;

    // Progress ticker
    progressTimerRef.current = setInterval(() => {
      setProgressStage((prev) => {
        if (prev < stages.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 1800);

    // Elapsed seconds ticker
    elapsedTimerRef.current = setInterval(() => {
      setAnalysisElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Dynamic percent progression towards 94%
    percentTimerRef.current = setInterval(() => {
      setAnalysisPercent((prev) => {
        if (prev < 35) return prev + 4.5;
        if (prev < 65) return prev + 2.5;
        if (prev < 82) return prev + 1.2;
        if (prev < 93) return prev + 0.5;
        return prev;
      });
    }, 500);

    // Reassurance tips cycle
    tipTimerRef.current = setInterval(() => {
      setReassuranceTipIndex((prev) => (prev + 1) % REASSURANCE_TIPS.length);
    }, 3200);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutDuration = (sourceType === 'pdf' || processedImagesList.length > 2) ? 150000 : 90000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

    try {
      let fileData: string | undefined;
      let mimeType: string | undefined;
      let currentPromptText = textInput;

      if (sourceType === 'audio' && !currentPromptText.trim() && (audioBlob || selectedFile)) {
        try {
          const audioTarget = audioBlob || selectedFile!;
          const audioB64 = await readFileAsBase64(audioTarget as File);
          const cleanB64 = audioB64.includes(',') ? audioB64.split(',')[1] : audioB64;
          const cleanAudioMime = (audioTarget.type || 'audio/webm').split(';')[0].trim() || 'audio/webm';
          const transRes = await fetch('/api/transcribe-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioData: cleanB64,
              mimeType: cleanAudioMime,
            }),
          });
          if (transRes.ok) {
            const transData = await transRes.json();
            if (transData.text) {
              currentPromptText = transData.text;
              setTranscribedText(transData.text);
              setTextInput(transData.text);
            }
          }
        } catch (tErr) {
          console.warn('Auto transcription fallback error:', tErr);
        }
      }

      let filesDataPayload: Array<{ base64: string; mimeType: string; fileName?: string }> | undefined;

      if (processedImagesList.length > 0) {
        filesDataPayload = processedImagesList.map((img) => ({
          base64: img.base64,
          mimeType: img.mimeType,
          fileName: img.name,
        }));
        fileData = processedImagesList[0].base64;
        mimeType = processedImagesList[0].mimeType;
      } else if (selectedFile && (selectedFile.name.toLowerCase().endsWith('.pdf') || selectedFile.type.includes('pdf') || sourceType === 'pdf')) {
        mimeType = 'application/pdf';
        fileData = await readFileAsBase64(selectedFile);
      } else if (sourceType === 'image' && processedImageData) {
        fileData = processedImageData.base64;
        mimeType = processedImageData.mimeType;
      } else if (audioBlob) {
        mimeType = audioBlob.type || 'audio/webm';
        fileData = await readFileAsBase64(audioBlob as File);
      } else if (selectedFile) {
        mimeType = selectedFile.type || 'image/jpeg';
        fileData = await readFileAsBase64(selectedFile);
      }

      const payload = {
        mode: sourceType,
        prompt: currentPromptText,
        fileData,
        filesData: filesDataPayload,
        mimeType,
        fileName: processedImagesList.length > 1
          ? `مجموعة صور للدرس (${processedImagesList.length} صور)`
          : selectedFile?.name || (sourceType === 'audio' ? 'تسجيل صوتي' : currentPromptText ? 'مقتطف نصي' : 'درس جامعي'),
        explanationLevel: customLevel || explanationLevel,
        actionType: customAction || 'full_explain',
        specificPart: customPartText || undefined,
        pdfPageChoice: pdfMode === 'page' && pdfPageNumber ? { mode: 'pages', selectedPages: pdfPageNumber } : { mode: 'full' },
        studentUniversity: student.university,
        studentMajor: student.major,
        studentId: student.id,
        useSerwayReference,
        doctorConfig: (doctorConfig.doctorName || doctorConfig.enabled) ? { ...doctorConfig, enabled: true } : undefined,
      };

      const response = await fetch('/api/explain-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (percentTimerRef.current) clearInterval(percentTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (tipTimerRef.current) clearInterval(tipTimerRef.current);
      setProgressStage(stages.length - 1);
      setAnalysisPercent(100);

      if (!response.ok) {
        let serverError = 'حدث خطأ في الخادم أثناء تحليل الدرس.';
        try {
          const errJson = await response.json();
          if (errJson.error) serverError = errJson.error;
        } catch (_) {}
        if (response.status === 413) {
          serverError = 'حجم الصورة المرفوعة كبير جداً، يرجى اختيار صورة أصغر أو التقاطها مجدداً.';
        } else if (response.status === 503) {
          serverError = 'خوادم الذكاء الاصطناعي تواجه ضغطاً مؤقتاً، يرجى الضغط على زر "إعادة المحاولة" بعد قليل.';
        }
        throw new Error(serverError);
      }

      const data = await response.json();
      if (!data.result) {
        throw new Error('لم نتلقَ استجابة صالحة من النموذج. يرجى التأكد من وضوح الصورة والمحاولة ثانية.');
      }

      const result: ExplainLessonResult = {
        ...data.result,
        filePreviewUrl: filePreview?.startsWith('data:image') ? filePreview : undefined,
      };

      setAnalysisResult(result);
      saveLessonToHistory(result);

      // Reset quiz
      setQuizAnswers({});
      setRevealedQuiz({});

      // Brief pause to display 100% complete state smoothly
      await new Promise((r) => setTimeout(r, 400));
      setIsAnalyzing(false);

      // Scroll to results smoothly
      setTimeout(() => {
        resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (percentTimerRef.current) clearInterval(percentTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (tipTimerRef.current) clearInterval(tipTimerRef.current);
      console.error('Error analyzing lesson:', err);

      let userMsg = sourceType === 'pdf'
        ? 'تعذر تحليل ملف الـ PDF حالياً. يرجى التأكد من صلاحية الملف والمحاولة ثانية.'
        : 'تعذر تحليل الدرس حالياً. يرجى التأكد من الصورة والمحاولة ثانية.';
      if (err.name === 'AbortError') {
        userMsg = sourceType === 'pdf'
          ? 'استغرق تحليل ملف الـ PDF وقتاً أطول من المتوقع (انتهت المهلة). يرجى الضغط على "إعادة المحاولة" أو اختيار صفحات معينة من الملف لسرعة التحليل.'
          : 'استغرق تحليل المحتوى وقتاً أطول من المتوقع (انتهت المهلة). يرجى الضغط على "إعادة المحاولة" أو رفع صورة أوضح.';
      } else if (!navigator.onLine) {
        userMsg = 'انقطع الاتصال بالإنترنت. يرجى التأكد من اتصالك ثم الضغط على "إعادة المحاولة".';
      } else if (err.message) {
        userMsg = err.message;
      }
      setErrorMsg(userMsg);
      setIsAnalyzing(false);
    } finally {
      abortControllerRef.current = null;
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Button "لم أفهم" (Simplify more)
  const handleDidNotUnderstand = async () => {
    if (!analysisResult) return;
    setExplanationLevel('simple');
    await handleAnalyzeLesson('did_not_understand', 'simple');
  };

  // Button 1: "بسّط لي أكثر" (Simplify even more with everyday analogies)
  const handleSimplifyMore = async () => {
    if (!analysisResult) return;
    setExplanationLevel('simple');
    await handleAnalyzeLesson('simplify', 'simple');
  };

  // Button 2: "اشرح هذه النقطة" (Open deep-dive modal on any specific point)
  const handleOpenExplainPoint = (pointText?: string) => {
    if (pointText) setCustomPartText(pointText);
    setPartAction('explain');
    setPartResultText(null);
    setShowExplainPartModal(true);
  };

  // Button 3: "أعطني مثالًا" (Generate an additional practical solved problem)
  const handleRequestMoreExamples = async () => {
    if (!analysisResult) return;
    setIsAnalyzing(true);
    try {
      const payload = {
        mode: 'text',
        prompt: `المطلوب: توليد مثال تطبيقي ومسألة جديدة تماماً ومحلولة بالتفصيل لطالب سنة أولى ميكاترونكس حول درس: "${analysisResult.lessonTitle}".
المطلوب: نص المسألة، المعطيات، المطلوب، القانون، خطوات الحل بالتفصيل، والناتج النهائي بالوحدة الدولية وتفسير النتيجة.`,
        lessonTitle: analysisResult.lessonTitle,
        explanationLevel: 'simple',
        actionType: 'example',
        studentUniversity: student.university,
        studentMajor: student.major,
        studentId: student.id,
      };
      const res = await fetch('/api/explain-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const resData = data.result || data.explanation;
        if (resData?.solvedExample) {
          setAnalysisResult((prev) => prev ? ({
            ...prev,
            solvedExample: {
              ...resData.solvedExample,
              isGenerated: true,
            },
          }) : null);
          setTimeout(() => {
            document.getElementById('section-9')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 200);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Button 4: "اختبرني" (Scroll directly to Section 14: Quick Quiz)
  const handleTestMe = () => {
    document.getElementById('section-14')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Handle Level switch
  const handleSwitchLevel = (lvl: ExplainLevel) => {
    setExplanationLevel(lvl);
    handleAnalyzeLesson('full_explain', lvl);
  };

  // Handle specific part explanation
  const handleExplainSpecificPart = async () => {
    if (!customPartText.trim()) return;
    setIsPartLoading(true);
    setPartResultText(null);

    try {
      const actionLabels = {
        explain: 'اشرح هذا المفهوم بدقة هندسية وأسلوب مبسط مع التشبيه العملي وذكر القوانين وتطبيقاتها في الميكاترونكس',
        simplify: 'بسّط هذا المفهوم إلى أقصى درجة ممكنة مع مثال ملموس من الروبوتات والسيارات بدون الإخلال بالدقة العلمية',
        example: 'أعطني مثالاً حسابياً وتطبيقياً خطوة بخطوة: المعطيات، المطلوب، القانون، التعويض الحسابي الدقيق، الناتج بالوحدة وتفسيره',
        solve: 'حل هذه المسألة بأعلى درجات الدقة الرياضية والهندسية خطوة بخطوة: 1) استخراج المعطيات بدقة، 2) تحويل الوحدات إلى النظام الدولي SI، 3) كتابة القانون الحاكم، 4) التعويض الرياضي التفصيلي بدون اختصار وتدقيق الحسابات، 5) الناتج النهائي بالوحدة الدقيقة، 6) التفسير الفيزيائي/الهندسي للنتيجة',
        verify: 'تحقق من صحة هذا القانون وأبعاده الفيزيائية ووحداته الدولية مع تجانس الأبعاد [M, L, T, I]',
      };

      const promptMsg = `أنت أستاذ أكاديمي لهندسة الميكاترونكس. الطالب يسأل عن:
"${customPartText}"
المطلوب إنجازه بدقة متناهية: ${actionLabels[partAction]}
قدم الشرح باللغة العربية الواضحة والرموز الإنجليزية مع الدقة الحسابية التامة والخطوات المنظمة.`;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptMsg,
          currentLessonTitle: analysisResult?.lessonTitle || 'درس ميكاترونكس',
          currentSubjectName: analysisResult?.subjectName || 'السنة الأولى',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPartResultText(data.reply || 'تم تجهيز الشرح بنجاح.');
      } else {
        setPartResultText('تعذر الحصول على شرح في الوقت الحالي.');
      }
    } catch (e) {
      setPartResultText('حدث خطأ أثناء الشرح.');
    } finally {
      setIsPartLoading(false);
    }
  };

  // Copy summary to clipboard
  const handleCopySummary = () => {
    if (!analysisResult) return;
    const text = `📚 ${analysisResult.lessonTitle} (${analysisResult.subjectName})
💡 الفكرة ببساطة:
${analysisResult.simpleIdea}

🎯 أهم المفاهيم:
${analysisResult.coreTakeaways.map((p, i) => `${i + 1}. ${p}`).join('\n')}

📐 القوانين:
${analysisResult.formulas.map((f) => `• ${f.equation}: ${f.meaning}`).join('\n')}

🧠 الخلاصة:
${analysisResult.summaryPoints.join('\n')}

منصة أكاديمية الميكاترونكس اليمنية 🎓`;

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-blue-800/40">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 top-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-bold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>مدرسك الجامعي الذكي والخاص</span>
            </div>

        {/* Serway Reference Toggle & Smart Doctor Options */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-sky-50/70 dark:from-slate-800/90 dark:via-indigo-950/40 dark:to-slate-850 border border-blue-200/80 dark:border-blue-900/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useSerwayReference}
                onChange={(e) => setUseSerwayReference(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded-md text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <div>
                <span className="font-black text-sm text-slate-900 dark:text-white flex flex-wrap items-center gap-1.5">
                  <span>☑️ استخدم مرجع Serway عند توفره</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold">
                    Physics for Scientists and Engineers
                  </span>
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  عند تفعيل الخيار، يبحث النظام داخل الكتاب المرفوع ويسترجع مقاطع دقيقة لدعم الشرح بالقوانين والصفحات المعتمدة.
                </p>
              </div>
            </label>

            <button
              type="button"
              onClick={() => setShowDoctorModal(true)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0 self-end sm:self-auto"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>🎓 الدكتور الذكي</span>
              {doctorConfig.doctorName ? (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-extrabold truncate max-w-[100px]">
                  {doctorConfig.doctorName}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">تخصيص الأسلوب</span>
              )}
            </button>
          </div>

          {/* Quick Doctor Style summary pill if configured */}
          {doctorConfig.doctorName && (
            <div className="pt-2 border-t border-blue-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-bold">
                <span>👨‍🏫 المحاضر المختار:</span>
                <span className="text-blue-600 dark:text-blue-400 font-black">{doctorConfig.doctorName}</span>
                <span className="text-slate-400 text-[11px]">({doctorConfig.university})</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold">
                أسلوب: {
                  doctorConfig.explanationStyle === 'university_detailed' ? 'شرح جامعي مفصل' :
                  doctorConfig.explanationStyle === 'formulas_derivation' ? 'شرح القوانين' :
                  doctorConfig.explanationStyle === 'step_by_step_problems' ? 'حل المسائل خطوة بخطوة' :
                  doctorConfig.explanationStyle === 'diagrams_visual' ? 'شرح بالرسومات' :
                  doctorConfig.explanationStyle === 'practical_applications' ? 'أمثلة تطبيقية' :
                  doctorConfig.explanationStyle === 'exam_review' ? 'مراجعة للاختبار' :
                  doctorConfig.explanationStyle === 'practice_questions' ? 'أسئلة تدريبية' : 'مبسط للمبتدئين'
                }
              </span>
            </div>
          )}
        </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>اشرح لي درس اليوم</span>
              <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                سنة أولى ميكاترونكس
              </span>
            </h1>
            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
              🎓 <strong>ماذا درست اليوم في الجامعة؟</strong> ارفع السبورة أو صورتك من الدفتر أو ملزمتك أو اكتب السؤال وسأشرحه لك بطريقة سهلة ومختصرة خالية من التعقيد.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2.5 shrink-0">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm w-full sm:w-auto justify-center"
            >
              <Bookmark className="w-4 h-4 text-amber-300" />
              <span>سجل دروسي ({savedLessons.length})</span>
            </button>

            {analysisResult && (
              <button
                onClick={() => setShowStudySheet(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md w-full sm:w-auto justify-center"
              >
                <FileCheck className="w-4 h-4" />
                <span>ورقة مذاكرة ليلة الامتحان</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Upload and Input Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Source Type Switcher */}
        <div className="space-y-3">
          <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            اختر طريقة إرسال محتوى الدرس:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
            
            <button
              type="button"
              onClick={() => {
                setSourceType('image');
                setSelectedFile(null);
                setFilePreview(null);
              }}
              className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                sourceType === 'image'
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm block">📷 صورة</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">سبورة، دفتر، مسألة، دائرة</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSourceType('pdf');
                setSelectedFile(null);
                setFilePreview(null);
              }}
              className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                sourceType === 'pdf'
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm block">📄 ملف PDF</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">ملزمة، سلايدات، فصل</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSourceType('audio');
                setSelectedFile(null);
                setFilePreview(null);
              }}
              className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                sourceType === 'audio'
                  ? 'border-rose-600 bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm block">🎙️ تسجيل صوتي</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">تحويل الصوت لنص + شرح</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSourceType('text');
                setSelectedFile(null);
                setFilePreview(null);
              }}
              className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                sourceType === 'text'
                  ? 'border-cyan-600 bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-900/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm block">📝 كتابة النص</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">سؤال، قانون، لصق شرح</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSourceType('video');
                setSelectedFile(null);
                setFilePreview(null);
              }}
              className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                sourceType === 'video'
                  ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm block">🎥 فيديو المحاضرة</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">مقطع للمحاضرة أو شرح</span>
              </div>
            </button>

          </div>
        </div>

        {/* Dynamic Voice Recording & Audio Studio Card */}
        {sourceType === 'audio' ? (
          <div className="bg-rose-50/40 dark:bg-rose-950/20 rounded-3xl p-6 border border-rose-200 dark:border-rose-900/50 space-y-5 text-center">
            
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-xs font-bold">
                <Mic className="w-3.5 h-3.5 animate-pulse" />
                استوديو تحويل الصوت إلى نص والشرح الذكي (Speech-to-Text)
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                تحدث بالميكروفون أو ارفع مقطعاً صوتياً لشرح الدرس
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                سيقوم الذكاء الاصطناعي بتحويل كلامك إلى نص مفرّغ بدقة، ثم توليد الشرح الهندسي الشامل تلقائياً.
              </p>
            </div>

            {/* Mic Recording Controls */}
            <div className="flex flex-col items-center justify-center gap-4 py-3">
              {isRecording ? (
                <div className="space-y-3">
                  <div className="relative inline-flex items-center justify-center">
                    <span className="absolute w-20 h-20 rounded-full bg-rose-500/30 animate-ping"></span>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="relative w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 hover:scale-105 transition-transform cursor-pointer"
                    >
                      <Square className="w-7 h-7 fill-current" />
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                    <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse"></span>
                    جاري التسجيل الان: {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">اضغط الزر لإيقاف التسجيل وتفريغ الصوت إلى نص</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={startRecording}
                    className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 hover:scale-105 transition-all mx-auto cursor-pointer"
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                  <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    اضغط الميكروفون لبدء التسجيل الصوتي المباشر
                  </div>
                </div>
              )}

              {/* Or upload audio file */}
              {!isRecording && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    أو اختر ملفاً صوتياً من جهازك (MP3, WAV, M4A, OGG)
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac"
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Audio Preview Player */}
            {audioUrl && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md mx-auto space-y-2 text-right">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-rose-600" />
                    {selectedFile ? selectedFile.name : 'المقطع الصوتي المسجل'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTranscribeAudioBlob(audioBlob || selectedFile!)}
                    disabled={isTranscribing}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTranscribing ? 'animate-spin' : ''}`} />
                    إعادة تحويل الصوت
                  </button>
                </div>
                <audio src={audioUrl} controls className="w-full h-10 rounded-lg" />
              </div>
            )}

            {/* Loading Transcription */}
            {isTranscribing && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center gap-3 text-amber-800 dark:text-amber-300 text-xs font-bold animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                جاري تحويل المقطع الصوتي إلى نص مكتوب عبر الذكاء الاصطناعي...
              </div>
            )}

            {/* Transcribed Text Output & Editor */}
            {(transcribedText || textInput) && (
              <div className="space-y-2 text-right pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-rose-600" />
                    النص المفرّغ من المقطع الصوتي (يمكنك تعديله قبل الشرح):
                  </label>
                  {transcriptionSuccess && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      تم التحويل بنجاح
                    </span>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="سيظهر النص المفرغ من تسجيلك الصوتي هنا تلقائياً..."
                  className="w-full p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none leading-relaxed"
                />
              </div>
            )}

          </div>
        ) : sourceType !== 'text' ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-6 sm:p-10 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              accept={
                sourceType === 'image'
                  ? 'image/*'
                  : sourceType === 'pdf'
                  ? 'application/pdf'
                  : sourceType === 'video'
                  ? 'video/*'
                  : '*/*'
              }
              className="hidden"
            />
            {sourceType === 'image' && (
              <input
                ref={cameraInputRef}
                type="file"
                multiple
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            )}

            {processedImagesList.length > 0 ? (
              <div className="space-y-4 text-right dir-rtl">
                {/* Header bar for multi-image */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md border border-slate-700/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-lg">
                      {processedImagesList.length}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white flex items-center gap-2">
                        <span>📸 تم اختيار ({processedImagesList.length}) صور لشرح المستند</span>
                        {processedImagesList.length >= 10 && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black">
                            +10 صور متقدم
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        سيتم تحليل وتفكيك الشرح صورة صورة بالتسلسل.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة صور أخرى</span>
                    </button>
                    {sourceType === 'image' && (
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Camera className="w-4 h-4" />
                        <span>تصوير صورة</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={clearAllImages}
                      className="px-3 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      مسح الكل 🗑️
                    </button>
                  </div>
                </div>

                {/* Grid gallery of selected images */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto p-1">
                  {processedImagesList.map((imgItem, idx) => (
                    <div 
                      key={imgItem.id} 
                      className="group relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-950 p-1 hover:border-amber-500 transition-all shadow-sm"
                    >
                      <img 
                        src={imgItem.previewUrl} 
                        alt={imgItem.name} 
                        className="w-full h-28 object-cover rounded-xl"
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-amber-300 font-black text-[11px] border border-amber-500/30">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeImageFromList(imgItem.id)}
                        className="absolute top-2 left-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold opacity-90 hover:opacity-100 hover:scale-110 transition-all cursor-pointer shadow-md"
                        title="حذف هذه الصورة"
                      >
                        ✕
                      </button>
                      <div className="p-1.5 text-[10px] text-slate-300 truncate text-center font-medium dir-ltr">
                        {imgItem.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedFile ? (
              <div className="space-y-4">
                <div className="inline-flex p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    الحجم: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB {isProcessingImage && ' • جاري تحسين دقة الصورة...'}
                  </p>
                </div>

                {filePreview && filePreview.startsWith('data:image') && (
                  <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md bg-slate-900/5 dark:bg-slate-950 p-2">
                    <img
                      src={filePreview}
                      alt="معاينة الصورة"
                      className="w-full max-h-72 object-contain mx-auto rounded-xl"
                    />
                    <div className="mt-2 text-[11px] text-slate-500 text-center font-medium">
                      جاهزة للتحليل - تظهر كامل محتويات الصورة والمعادلات
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>تغيير الصورة</span>
                  </button>
                  {sourceType === 'image' && (
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>📸 تصوير بالكاميرا</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                      setProcessedImageData(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>

                {/* PDF Page Selection Options */}
                {sourceType === 'pdf' && (
                  <div className="mt-3 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-3 text-right">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-200 block">
                      📄 خيارات شرح ملف الـ PDF:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <label className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        pdfMode === 'all'
                          ? 'bg-white dark:bg-slate-900 border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        <input
                          type="radio"
                          name="pdfMode"
                          checked={pdfMode === 'all'}
                          onChange={() => setPdfMode('all')}
                          className="text-blue-600"
                        />
                        <span>🔘 شرح الملف كاملًا</span>
                      </label>

                      <label className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        pdfMode === 'page'
                          ? 'bg-white dark:bg-slate-900 border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        <input
                          type="radio"
                          name="pdfMode"
                          checked={pdfMode === 'page'}
                          onChange={() => setPdfMode('page')}
                          className="text-blue-600"
                        />
                        <span>🔘 اختر صفحة/قسمًا محددًا</span>
                      </label>
                    </div>

                    {pdfMode === 'page' && (
                      <div className="pt-1 flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          رقم الصفحة أو المقطع:
                        </label>
                        <input
                          type="text"
                          value={pdfPageNumber}
                          onChange={(e) => setPdfPageNumber(e.target.value)}
                          placeholder="مثال: صفحة 4 أو صفحات 3-5"
                          className="w-full sm:w-64 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200 text-base">
                    اسحب الملف وأفلته هنا، أو اضغط للاختيار من جهازك
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {sourceType === 'image'
                      ? 'ندعم: صور السبورة، الدفتر، الكتاب، الملازم، والدوائر الكهربائية (JPG, PNG, WEBP)'
                      : sourceType === 'pdf'
                      ? 'ندعم: الملازم وسلايدات المحاضرات وفصول الكتب (PDF)'
                      : 'ندعم: مقاطع الفيديو ومحاضرات الزوم أو القاعات (MP4, MOV)'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>تحديد ملف من الجهاز</span>
                  </button>

                  {sourceType === 'image' && (
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>التقاط صورة بالهاتف مباشرة</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Text Input area (Always available or when text mode is active) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {sourceType === 'text' ? 'اكتب أو الصق نص الدرس أو المسألة:' : 'ملاحظات أو سؤال إضافي على الملف المرفوع (اختياري):'}
          </label>
          <div className="relative">
            <textarea
              rows={sourceType === 'text' ? 5 : 2}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={
                sourceType === 'text'
                  ? 'مثال: اشرح لي قانون نيوتن الثاني وكيف نطبقه لحساب تسارع ذراع الروبوت، مع مثال رقمي ووحدات القياس...'
                  : 'مثال: ركز على شرح المسألة الأخيرة في الصفحة، أو اشرح كيفية توصيل المقاومات في الصورة...'
              }
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* Explanation Level Selection */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">مستوى الشرح المفضل:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'simple' as ExplainLevel, label: '🟢 مبسط جداً', desc: 'من الصفر مع تشبيهات' },
              { id: 'medium' as ExplainLevel, label: '🔵 متوسط', desc: 'مستوى جامعي' },
              { id: 'advanced' as ExplainLevel, label: '🟣 متقدم', desc: 'تطبيقات هندسية' },
              { id: 'short' as ExplainLevel, label: '🟡 اختصر أكثر', desc: 'ملخص سريع' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setExplanationLevel(lvl.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  explanationLevel === lvl.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title={lvl.desc}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert if any with Retry Action */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <h4 className="font-bold">تنبيه أثناء التحليل:</h4>
                <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleAnalyzeLesson()}
              disabled={isAnalyzing}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-sm self-end sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        )}

        {/* Active Analysis & Progress Card ("تحليل الملف...") */}
        {isAnalyzing && (
          <div className="relative overflow-hidden rounded-3xl border-2 border-blue-500/50 bg-gradient-to-b from-blue-50/90 via-indigo-50/40 to-white dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 p-5 sm:p-7 shadow-xl shadow-blue-500/10 space-y-5 animate-in fade-in duration-300">
            {/* Top scanning ambient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-600 animate-pulse" />

            {/* Header: Title, Active Beacon & Timers */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100 dark:border-blue-900/60">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>تحليل الملف قيد المعالجة...</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      Gemini متصل
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    النظام يعالج المحتوى الهندسي مباشرة ولم يتوقف
                  </p>
                </div>
              </div>

              {/* Status Badges & Timer */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>المستغرق: {formatElapsedSeconds(analysisElapsedSeconds)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCancelAnalysis}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
                  title="إلغاء المعالجة"
                >
                  إلغاء ✕
                </button>
              </div>
            </div>

            {/* File In-Progress Context Banner */}
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-blue-100 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold truncate max-w-md">
                <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  {sourceType === 'pdf' ? <FileText className="w-4 h-4" /> : sourceType === 'image' ? <ImageIcon className="w-4 h-4" /> : sourceType === 'audio' ? <Mic className="w-4 h-4" /> : <PenTool className="w-4 h-4" />}
                </span>
                <span className="truncate">
                  {processedImagesList.length > 1
                    ? `مجموعة صور (${processedImagesList.length} صور مرفوعة للدرس)`
                    : selectedFile?.name || (sourceType === 'audio' ? 'تسجيل صوتي للمحاضرة' : sourceType === 'text' ? 'نص الدرس المكتوب' : 'ملف الدرس الجامعي')}
                </span>
                {selectedFile && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                    ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                {sourceType === 'pdf' && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-800">
                    {pdfMode === 'page' && pdfPageNumber ? `صفحة: ${pdfPageNumber}` : 'كامل الملف'}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                  {explanationLevel === 'simple' ? 'مبسط جداً' : explanationLevel === 'medium' ? 'متوسط' : explanationLevel === 'advanced' ? 'متقدم' : 'ملخص سريع'}
                </span>
              </div>
            </div>

            {/* High-Tech Animated Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-blue-900 dark:text-blue-200 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  <span>
                    المرحلة {Math.min(4, Math.max(1, Math.floor((analysisPercent / 100) * 4) + 1))} من 4:
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">
                    {sourceType === 'pdf'
                      ? ['قراءة ملف الـ PDF واستخراج النصوص...', 'فهرسة الصفحات والرموز والمعادلات...', 'التحليل المعمق عبر ذكاء Gemini...', 'صياغة الأقسام الـ 14 والأمثلة المحلولة...'][Math.min(3, Math.floor((analysisPercent / 100) * 4))]
                      : processedImagesList.length > 1
                      ? [`قراءة ${processedImagesList.length} صور للدرس...`, 'ربط المسائل والقوانين التسلسلية...', 'تحليل ذكاء Gemini للمحتوى الكامل...', 'تجهيز الشرح والأمثلة والاختبار...'][Math.min(3, Math.floor((analysisPercent / 100) * 4))]
                      : sourceType === 'image'
                      ? ['فحص عناصر الصورة والتعرف البصري...', 'استخراج القوانين والمعادلات والدوائر...', 'تفكيك خطوات الحل والشرح الهندسي...', 'تجهيز الشرح والأمثلة المحلولة...'][Math.min(3, Math.floor((analysisPercent / 100) * 4))]
                      : ['قراءة المحتوى وفحص البيانات...', 'استخراج المفاهيم والقوانين الهندسية...', 'التحليل الذكي وصياغة الشرح...', 'إعداد الأمثلة المحلولة والاختبار التجريبي...'][Math.min(3, Math.floor((analysisPercent / 100) * 4))]}
                  </span>
                </span>
                <span className="text-sm font-black font-mono text-blue-700 dark:text-cyan-400 bg-blue-100/80 dark:bg-blue-900/60 px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                  {Math.round(analysisPercent)}%
                </span>
              </div>

              {/* Progress track */}
              <div className="relative w-full h-4 rounded-full bg-slate-200 dark:bg-slate-800 p-0.5 overflow-hidden shadow-inner border border-slate-300/60 dark:border-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 transition-all duration-500 ease-out relative overflow-hidden shadow-sm shadow-blue-500/50"
                  style={{ width: `${Math.min(100, Math.max(8, analysisPercent))}%` }}
                >
                  {/* Scanning Shimmer Light Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-progress-shimmer w-full h-full" />
                </div>
              </div>
            </div>

            {/* 4-Step Pipeline Visual Tracker */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {getAnalysisPipelineSteps().map((step, idx) => {
                const stepThreshold = (idx + 1) * 25;
                const isStepCompleted = analysisPercent >= stepThreshold;
                const isStepActive = analysisPercent < stepThreshold && (idx === 0 || analysisPercent >= idx * 25);

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-right transition-all ${
                      isStepCompleted
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : isStepActive
                        ? 'bg-blue-50/90 dark:bg-blue-950/60 border-blue-400 dark:border-blue-700 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500/20'
                        : 'bg-white/40 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-black uppercase">خطوة {idx + 1}</span>
                      {isStepCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : isStepActive ? (
                        <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin shrink-0" />
                      ) : (
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs font-black truncate">{step.title}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{step.subtitle}</p>
                  </div>
                );
              })}
            </div>

            {/* Rotating Reassurance Tip Box (Anti-Freeze Signal) */}
            <div className="p-3 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5 transition-all">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
              <div className="flex-1 font-medium leading-relaxed">
                <span>{REASSURANCE_TIPS[reassuranceTipIndex]}</span>
              </div>
            </div>
          </div>
        )}

        {/* Analyze Action Button */}
        <button
          type="button"
          onClick={() => handleAnalyzeLesson()}
          disabled={isAnalyzing}
          className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg ${
            isAnalyzing
              ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-90'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-blue-600/20 hover:scale-[1.005]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>
                تحليل ومعالجة الملف... ({Math.round(analysisPercent)}%)
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>
                {sourceType === 'image'
                  ? 'اشرح لي الدرس من الصورة 📸'
                  : sourceType === 'pdf'
                  ? 'اشرح لي ملف الـ PDF الآن 📄'
                  : sourceType === 'audio'
                  ? 'اشرح لي التسجيل الصوتي 🎙️'
                  : 'اشرح لي الدرس الآن 🚀'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* 3. Analysis Results View */}
      {analysisResult && (
        <div ref={resultsTopRef} className="space-y-6 scroll-mt-20">
          
          {/* Result Card Header */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
                    📚 {analysisResult.subjectName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">
                    مستوى الشرح: {analysisResult.explanationLevel === 'simple' ? '🟢 مبسط' : analysisResult.explanationLevel === 'medium' ? '🔵 متوسط' : analysisResult.explanationLevel === 'advanced' ? '🟣 متقدم' : '🟡 مختصر'}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(analysisResult.createdAt).toLocaleDateString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  📖 {analysisResult.lessonTitle}
                </h2>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => saveLessonToHistory(analysisResult)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSavedFeedback
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{isSavedFeedback ? 'تم الحفظ بنجاح!' : '⭐ حفظ الدرس'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copySuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copySuccess ? 'تم النسخ' : '📋 نسخ الملخص'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowStudySheet(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>📄 ورقة مذاكرة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowExamModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  title="استخراج نموذج اختبار رسمي متوقع لهذا الدرس كصورة أو ملف PDF"
                >
                  <FileText className="w-4 h-4" />
                  <span>📑 نموذج اختبار متوقع (PDF / صورة)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentSlideIndex(0);
                    setShowPresentationModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  title="عرض سلايدات فيديو تعليمية تفاعلية مع قراءة صوتية كبديل متقدم وموثوق لإنتاج الفيديو"
                >
                  <Video className="w-4 h-4 text-amber-300" />
                  <span>🎬 أنشئ شرح الفيديو (سلايدات تفاعلية)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDidNotUnderstand}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 border border-rose-200 dark:border-rose-900 transition-all cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>❓ لم أفهم</span>
                </button>
              </div>
            </div>

            {/* Smart Doctor Banner if configured */}
            {analysisResult.smartDoctorConfig?.doctorName && (
              <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-indigo-900 dark:text-indigo-200">
                      🎓 نمط الشرح: د. {analysisResult.smartDoctorConfig.doctorName} ({analysisResult.smartDoctorConfig.university || student.university})
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      ⚠️ الشرح تعليمي مولد بالذكاء الاصطناعي وفق المعايير الأكاديمية وليس تسجيلاً رسمياً صادراً عن الدكتور المذكور.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-black self-start sm:self-auto shrink-0">
                  {analysisResult.smartDoctorConfig.explanationStyle === 'university_detailed' ? 'جامعي مفصل' : analysisResult.smartDoctorConfig.explanationStyle === 'step_by_step_problems' ? 'مسائل خطوة بخطوة' : analysisResult.smartDoctorConfig.explanationStyle === 'formulas_derivation' ? 'قوانين ومعادلات' : 'مبسط'}
                </span>
              </div>
            )}

            {/* Serway Reference Retrieval & Citation Banner */}
            {(analysisResult.serwayCitations && analysisResult.serwayCitations.length > 0) ? (
              <div className="p-4 rounded-2xl bg-blue-50/90 dark:bg-slate-800/90 border-2 border-blue-300 dark:border-blue-700 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 text-blue-900 dark:text-blue-200">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm">
                        📘 استرجاع موثق من مرجع: Physics for Scientists and Engineers — Serway
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        تم فحص الكتاب واستخراج مقاطع مطابقة بدقة لدعم الشرح بالقوانين والصفحات المعتمدة
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-black self-start sm:self-auto">
                    {analysisResult.serwayCitations.length} مقتطفات مسترجعة
                  </span>
                </div>

                {/* Excerpt Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {analysisResult.serwayCitations.map((c, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/60 text-xs space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        <span className="truncate max-w-[70%]">📖 {c.chapterTitle || 'فصل فيزيائي'}</span>
                        {c.pageNumber ? (
                          <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 font-mono text-blue-700 dark:text-blue-300">
                            ص {c.pageNumber}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">قسم موثق</span>
                        )}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed line-clamp-3 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        "{c.snippet}"
                      </p>
                    </div>
                  ))}
                </div>

                {/* Source distinctions guide */}
                <div className="pt-2 border-t border-blue-200/60 dark:border-slate-700 flex flex-wrap items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-800 dark:text-slate-200">التمييز بين المصادر:</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> مخرجات ملف الطالب
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> مرجع Serway الموثق
                  </span>
                  <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-purple-500" /> أمثلة الذكاء الاصطناعي الإضافية
                  </span>
                </div>
              </div>
            ) : analysisResult.usedSerwayReference ? (
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs flex items-center justify-between gap-3 text-blue-900 dark:text-blue-200">
                <span className="font-bold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  تم مطابقة محتوى الدرس مع موضوعات مرجع Serway القياسية لهندسة الميكاترونكس
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 font-bold">
                  Physics for Scientists & Engineers
                </span>
              </div>
            ) : null}

            {/* Quick Connected Simulators for Mechatronics */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2.5">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>محاكيات وأدوات مرتبطة بمحتوى هذا الدرس:</span>
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateToTool('formulas')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                >
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                  <span>📐 فاحص القوانين والحركة</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToTool('circuits')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>⚡ مختبر الدوائر</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToTool('units')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                >
                  <Ruler className="w-3.5 h-3.5 text-emerald-600" />
                  <span>📏 محول الوحدات SI</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToTool('arduino')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-cyan-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                >
                  <Binary className="w-3.5 h-3.5 text-cyan-600" />
                  <span>🤖 محاكي Arduino</span>
                </button>
              </div>
            </div>

            {/* Warning if image was blurry */}
            {(analysisResult.isImageBlurry || analysisResult.clarificationNotice) && (
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base">⚠️ تنبيه أمانة علمية: تفاصيل الصورة غير واضحة</h4>
                    <p className="mt-1 leading-relaxed">
                      {analysisResult.clarificationNotice ||
                        'الكتابة أو الأرقام أو المخطط في الصورة غير واضحة بما يكفي لقراءة القوانين والمعادلات بدقة تامة. يرجى التقاط صورة أوضح بإضاءة جيدة وزاوية مستقيمة.'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    <span>📸 التقاط صورة أوضح بالكاميرا</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>اختيار صورة أوضح من الجهاز</span>
                  </button>
                </div>
              </div>
            )}

            {/* Warning if image was non-educational */}
            {analysisResult.isNotEducational && (
              <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border-2 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 text-xs sm:text-sm space-y-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base">ℹ️ الصورة لا تحتوي على درس أو محتوى تعليمي واضح</h4>
                    <p className="mt-1 leading-relaxed">
                      {analysisResult.notEducationalNotice ||
                        'لم يتم العثور في هذه الصورة على درس أو مسألة أو مخطط هندسي لمواد الميكاترونكس. يرجى رفع صورة لدفتر، سبورة، كتاب، ملزمة، أو دائرة كهربائية.'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <Upload className="w-4 h-4" />
                    <span>رفع صورة درس هندسي</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>تصوير الدفتر أو الملزمة</span>
                  </button>
                </div>
              </div>
            )}

            {/* Smart Notice Message (e.g. offline curriculum fallback during high server demand) */}
            {analysisResult.noticeMessage && (
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">إشعار النظام الذكي:</h4>
                    <p className="mt-0.5">{analysisResult.noticeMessage}</p>
                  </div>
                </div>
                {analysisResult.isAiGenerated === false && (
                  <button
                    type="button"
                    onClick={() => handleAnalyzeLesson()}
                    disabled={isAnalyzing}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shrink-0 cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    <span>إعادة المحاولة عبر الذكاء</span>
                  </button>
                )}
              </div>
            )}

            {/* Quick Level Switchers */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                🔄 تبديل مستوى الشرح بضغطة زر:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSwitchLevel('simple')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    analysisResult.explanationLevel === 'simple' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  🟢 شرح مبسط
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchLevel('medium')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    analysisResult.explanationLevel === 'medium' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  🔵 شرح متوسط
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchLevel('advanced')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    analysisResult.explanationLevel === 'advanced' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  🟣 شرح متقدم
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchLevel('short')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    analysisResult.explanationLevel === 'short' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  🟡 اختصر أكثر
                </button>
              </div>
            </div>

            {/* View Mode & Quick Navigation Index */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50/50 dark:bg-slate-950 border border-blue-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">نمط التدريس:</span>
                <div className="inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewMode('stream')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'stream'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-blue-600'
                    }`}
                  >
                    📋 التدريس الشامل (الـ 14 خطوة)
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('tabs')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'tabs'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-blue-600'
                    }`}
                  >
                    📑 تبويبات الأقسام
                  </button>
                </div>
              </div>

              {/* Quick Jump Index for the 14 sections */}
              {viewMode === 'stream' && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-[11px] font-bold">
                  {[
                    { id: 'section-1', label: '1. العنوان' },
                    { id: 'section-2', label: '2. ببساطة' },
                    { id: 'section-3', label: '3. الأفكار' },
                    { id: 'section-4', label: '4. المفاهيم' },
                    { id: 'section-5', label: '5. المصطلحات' },
                    { id: 'section-6', label: '6. القوانين' },
                    { id: 'section-7', label: '7. الوحدات' },
                    { id: 'section-8', label: '8. الأبعاد' },
                    { id: 'section-9', label: '9. المسألة' },
                    { id: 'section-10', label: '10. الملاحظات' },
                    { id: 'section-11', label: '11. التذكر' },
                    { id: 'section-12', label: '12. الخلاصة' },
                    { id: 'section-13', label: '13. الجدارات' },
                    { id: 'section-14', label: '14. الاختبار' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-600 dark:text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Stream Mode: Render 14 Ordered Sections */}
            {viewMode === 'stream' ? (
              <ExplainFourteenSections
                analysisResult={analysisResult}
                quizAnswers={quizAnswers}
                setQuizAnswers={setQuizAnswers}
                revealedQuiz={revealedQuiz}
                setRevealedQuiz={setRevealedQuiz}
                onOpenExplainPoint={handleOpenExplainPoint}
                onNavigateToTool={onNavigateToTool}
                onSimplifyMore={handleSimplifyMore}
                onRequestMoreExamples={handleRequestMoreExamples}
                onTestMe={handleTestMe}
              />
            ) : (
              <>
                {/* Navigation Tabs for Sections */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 gap-2">
                  {[
                    { id: 'explanation', label: '💡 الشرح والمفاهيم' },
                    { id: 'formulas', label: `📐 القوانين والوحدات (${analysisResult.formulas.length})` },
                    { id: 'example', label: '🧮 مثال محلول' },
                    { id: 'quiz', label: `📝 اختبر نفسك (${analysisResult.quiz.length})` },
                    { id: 'tools', label: `🛠️ أدوات مقترحة (${analysisResult.suggestedTools.length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

            {/* SECTION 1: Explanation & Core Concepts */}
            {activeTab === 'explanation' && (
              <div className="space-y-6">
                
                {/* 💡 الفكرة ببساطة */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-base sm:text-lg text-blue-900 dark:text-blue-200 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      <span>الفكرة ببساطة</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomPartText(analysisResult.simpleIdea);
                        setShowExplainPartModal(true);
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                    >
                      اشرح بتشبيه آخر
                    </button>
                  </div>
                  <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {analysisResult.simpleIdea}
                  </p>
                </div>

                {/* 🎯 ماذا يجب أن أفهم؟ */}
                {analysisResult.coreTakeaways && analysisResult.coreTakeaways.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center text-xs">
                        🎯
                      </span>
                      <span>ماذا يجب أن أفهم من هذا الدرس؟</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysisResult.coreTakeaways.map((point, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3"
                        >
                          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-black text-xs shrink-0 flex items-center justify-center mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {point}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 📌 المصطلحات المهمة */}
                {analysisResult.terms && analysisResult.terms.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-xs">
                        📌
                      </span>
                      <span>المصطلحات الهندسية المهمة</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {analysisResult.terms.map((t, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-black text-slate-900 dark:text-white text-sm">
                              {t.term}
                            </h4>
                            {t.englishTerm && (
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300" dir="ltr">
                                {t.englishTerm}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
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
                  </div>
                )}

                {/* ⚠️ الأخطاء الشائعة */}
                {analysisResult.commonMistakes && analysisResult.commonMistakes.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center text-xs">
                        ⚠️
                      </span>
                      <span>أخطاء شائعة يقع فيها طلاب السنة الأولى (فخاخ الامتحانات)</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysisResult.commonMistakes.map((m, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-2"
                        >
                          <div className="font-bold text-xs sm:text-sm text-rose-800 dark:text-rose-300 flex items-center gap-2">
                            <X className="w-4 h-4 text-rose-500 shrink-0" />
                            <span>الخطأ: {m.mistake}</span>
                          </div>
                          <div className="font-bold text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>التصحيح: {m.correction}</span>
                          </div>
                          {m.why && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 pr-6">
                              السبب: {m.why}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 🧠 الخلاصة */}
                {analysisResult.summaryPoints && analysisResult.summaryPoints.length > 0 && (
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>🧠 خلاصة الدرس السريعة:</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
                      {analysisResult.summaryPoints.map((pt, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Electrical Circuit Analysis Card if present */}
                {analysisResult.circuitAnalysis?.hasCircuit && (
                  <div className="p-5 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/50 space-y-3">
                    <h3 className="font-extrabold text-sm sm:text-base text-cyan-900 dark:text-cyan-200 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-cyan-500" />
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
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: Formulas, Units & Dimensions */}
            {activeTab === 'formulas' && (
              <div className="space-y-6">
                
                {/* 📐 القوانين */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Scale className="w-5 h-5 text-amber-500" />
                    <span>القوانين المستخرجة وتفكيك الرموز</span>
                  </h3>

                  {analysisResult.formulas.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="font-mono text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400" dir="ltr">
                          {f.equation}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomPartText(f.equation);
                            setShowExplainPartModal(true);
                          }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold self-start sm:self-auto"
                        >
                          تحقق أو حل مسألة بهذا القانون
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {f.meaning}
                      </p>

                      {/* Symbols breakdown */}
                      {f.symbols && f.symbols.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                          <span className="text-xs font-bold text-slate-500 block mb-2">تفكيك رموز القانون:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {f.symbols.map((sym, sIdx) => (
                              <div
                                key={sIdx}
                                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
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
                                  {sym.dimension && <span className="font-mono" dir="ltr">[{sym.dimension}]</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 📏 الوحدات الدولية SI */}
                {analysisResult.units && analysisResult.units.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Ruler className="w-5 h-5 text-emerald-500" />
                      <span>جدول الوحدات الدولية (SI Units) للدرس</span>
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
                  </div>
                )}

                {/* 🔬 الأبعاد الفيزيائية Dimensional Analysis */}
                {analysisResult.dimensions && analysisResult.dimensions.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Atom className="w-5 h-5 text-purple-500" />
                      <span>تحليل الأبعاد الفيزيائية [M, L, T, I]</span>
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.dimensions.map((d, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/60 space-y-2"
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
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: Solved Example */}
            {activeTab === 'example' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-indigo-500" />
                    <span>مسألة ومثال محلول خطوة بخطوة</span>
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    analysisResult.solvedExample?.isGenerated
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {analysisResult.solvedExample?.isGenerated ? '💡 مثال تعليمي إضافي' : '📄 من ملف الطالب مباشرة'}
                  </span>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-5">
                  
                  {/* Problem statement */}
                  <div className="space-y-2">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-wider block">نص المسألة:</span>
                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                      {analysisResult.solvedExample?.problem}
                    </p>
                  </div>

                  {/* Given data & Required */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-slate-500 block">المعطيات (Given):</span>
                      <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                        {(analysisResult.solvedExample?.given || []).map((g, idx) => (
                          <li key={idx}>{g}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-slate-500 block">المطلوب (Required):</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {analysisResult.solvedExample?.required}
                      </p>
                      {analysisResult.solvedExample?.formulaUsed && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-blue-600 font-mono" dir="ltr">
                          Formula: {analysisResult.solvedExample.formulaUsed}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-3">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">خطوات الحل التفصيلية:</span>
                    <div className="space-y-2.5">
                      {(analysisResult.solvedExample?.steps || []).map((step, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3"
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

                  {/* Final Answer */}
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">الناتج النهائي (Final Answer):</span>
                      <span className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-100">
                        {analysisResult.solvedExample?.finalAnswer}
                      </span>
                    </div>
                  </div>

                  {/* Engineering Note */}
                  {analysisResult.solvedExample?.note && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300">
                      💡 <strong>نصيحة مهندس:</strong> {analysisResult.solvedExample.note}
                    </div>
                  )}
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomPartText('أعطني مثالاً حسابياً جديداً ومختلفاً بمستويات مختلفة عن نفس الدرس');
                      setPartAction('example');
                      setShowExplainPartModal(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>توليد مثال وحل مسألة إضافية</span>
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 4: Interactive Quiz */}
            {activeTab === 'quiz' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-500" />
                    <span>اختبر نفسك في مفاهيم درس اليوم</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    {analysisResult.quiz.length} أسئلة قصيرة وسريعة
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
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-black text-xs shrink-0 flex items-center justify-center mt-0.5">
                              {idx + 1}
                            </span>
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                              {q.question}
                            </h4>
                          </div>
                        </div>

                        {/* Options */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                            {q.options.map((opt, optIdx) => {
                              const isThisSelected = selected === opt;
                              const isThisCorrect = opt === q.correctAnswer;

                              let btnClasses = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 text-slate-800 dark:text-slate-200';
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
                                💡 <strong>التفسير:</strong> {q.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 5: Suggested Tools on the Platform */}
            {activeTab === 'tools' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-indigo-500" />
                  <span>أدوات المنصة الموصى بها لهذا الدرس</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {analysisResult.suggestedTools.map((tool, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all space-y-3 group"
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
              </div>
            )}
              </>
            )}

          </div>

          {/* Persistent Interactive 4 Action Buttons Bar (Always accessible) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-600/30 text-blue-400">🤖</span>
              <div>
                <span className="font-black text-sm block">المدرس الذكي جاهز لمساعدتك في أي لحظة:</span>
                <span className="text-xs text-slate-400 block">اضغط على أي زر أدناه للتفاعل الفوري مع محتوى هذا الدرس</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={handleSimplifyMore}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>بسّط لي أكثر</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenExplainPoint()}
                className="px-3.5 py-2.5 rounded-xl bg-amber-600/90 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>اشرح هذه النقطة</span>
              </button>

              <button
                type="button"
                onClick={handleRequestMoreExamples}
                className="px-3.5 py-2.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>أعطني مثالاً</span>
              </button>

              <button
                type="button"
                onClick={handleTestMe}
                className="px-3.5 py-2.5 rounded-xl bg-purple-600/90 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>اختبرني</span>
              </button>
            </div>
          </div>

          {/* Section: Select Specific Part to Explain */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-right">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                <span>هل تحتاج للتركيز على قانون أو جزء محدد فقط؟</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                حدد أي فقرة أو مسألة واطلب: اشرح، بسّط، أعطني مثالاً، أو تحقق من القانون.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCustomPartText('');
                setShowExplainPartModal(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shrink-0 transition-all cursor-pointer"
            >
              شرح جزء محدد من الدرس
            </button>
          </div>
        </div>
      )}

      {/* 4. MODAL: Study Sheet / Cheat Sheet (ورقة مذاكرة ليلة الامتحان) */}
      {showStudySheet && analysisResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                    ورقة مذاكرة ليلة الاختبار 📄
                  </h3>
                  <p className="text-xs text-slate-500">
                    ملخص مكثف ومنظم للمراجعة السريعة قبل امتحانات الفصل
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStudySheet(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 print:p-0">
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
                <ReactMarkdown>
                  {analysisResult.studySheetMarkdown || `
# ورقة مذاكرة سريعة: ${analysisResult.lessonTitle}
**المادة:** ${analysisResult.subjectName} | **المستوى:** السنة الأولى هندسة ميكاترونكس

---
### 💡 الفكرة الأساسية:
${analysisResult.simpleIdea}

### 🎯 أهم المفاهيم:
${analysisResult.coreTakeaways.map((p, i) => `- **${i + 1}.** ${p}`).join('\n')}

### 📐 جدول القوانين ووحدات القياس:
| القانون | المعنى | الوحدات الدولية |
| :--- | :--- | :--- |
${analysisResult.formulas.map((f) => `| \`${f.equation}\` | ${f.meaning} | SI Units |`).join('\n')}

### ⚠️ فخاخ شائعة تجنبها:
${analysisResult.commonMistakes.map((m) => `- ❌ **الخطأ:** ${m.mistake}\n  - ✅ **التصحيح:** ${m.correction}`).join('\n')}

### 🧠 ملخص ليلة الامتحان:
${analysisResult.summaryPoints.map((s) => `- ${s}`).join('\n')}
                  `}
                </ReactMarkdown>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة أو حفظ PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(analysisResult.studySheetMarkdown || '');
                  alert('تم نسخ ورقة المذاكرة إلى الحافظة!');
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>نسخ النص كاملاً</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: Explain Specific Part */}
      {showExplainPartModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                شرح جزء أو قانون محدد 🎯
              </h3>
              <button
                type="button"
                onClick={() => setShowExplainPartModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                الصق النص أو القانون أو المسألة التي تريد التركيز عليها:
              </label>
              <textarea
                rows={3}
                value={customPartText}
                onChange={(e) => setCustomPartText(e.target.value)}
                placeholder="اكتب هنا القانون أو الفقرة..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Quick Chips from Current Lesson */}
            {analysisResult && (analysisResult.formulas?.length > 0 || analysisResult.conceptExplanations?.length > 0) && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 block">اختر نقطة أو قانوناً من الدرس بضغطة زر:</span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  {analysisResult.formulas?.map((f, i) => (
                    <button
                      key={`f-${i}`}
                      type="button"
                      onClick={() => setCustomPartText(`قانون: ${f.equation} (${f.meaning})`)}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:border-blue-500 cursor-pointer transition-colors"
                    >
                      {f.equation}
                    </button>
                  ))}
                  {analysisResult.conceptExplanations?.map((c, i) => (
                    <button
                      key={`c-${i}`}
                      type="button"
                      onClick={() => setCustomPartText(`مفهوم: ${c.concept}`)}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 hover:border-blue-500 cursor-pointer transition-colors"
                    >
                      {c.concept}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                ماذا تريد من المعلم الذكي أن يفعل؟
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'explain', label: 'اشرح' },
                  { id: 'simplify', label: 'بسّط أكثر' },
                  { id: 'example', label: 'أعطني مثالاً' },
                  { id: 'solve', label: 'حل المسألة' },
                  { id: 'verify', label: 'تحقق من القانون' },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setPartAction(act.id as any)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      partAction === act.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            {partResultText && (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed max-h-48 overflow-y-auto">
                <ReactMarkdown>{partResultText}</ReactMarkdown>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowExplainPartModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={handleExplainSpecificPart}
                disabled={isPartLoading || !customPartText.trim()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {isPartLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>ابدأ الشرح</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: Student Explained Lessons History (سجل دروسي التي شرحتها) */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  سجل دروسي التي شرحتها ({savedLessons.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              {savedLessons.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Bookmark className="w-10 h-10 mx-auto stroke-1" />
                  <p className="text-sm font-bold">لم تقم بحفظ أي درس بعد.</p>
                  <p className="text-xs">أي درس تقوم بتحليله سيظهر هنا تلقائياً لتتمكن من الرجوع إليه في أي وقت.</p>
                </div>
              ) : (
                savedLessons.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => {
                      setAnalysisResult(l);
                      setShowHistoryModal(false);
                      resultsTopRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          {l.subjectName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(l.createdAt).toLocaleDateString('ar-YE')}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {l.lessonTitle}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {l.simpleIdea}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => deleteLessonFromHistory(l.id, e)}
                        className="p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500 cursor-pointer"
                        title="حذف من السجل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Exam Paper Modal for Download as PDF / Image */}
      {showExamModal && analysisResult && (
        <ExamModal
          isOpen={showExamModal}
          onClose={() => setShowExamModal(false)}
          subject={
            INITIAL_SUBJECTS.find((s) => 
              s.name.includes(analysisResult.subjectName) || 
              analysisResult.subjectName.includes(s.name) ||
              s.englishName.toLowerCase().includes(analysisResult.subjectName.toLowerCase())
            ) || INITIAL_SUBJECTS[0]
          }
          customLessonTitle={analysisResult.lessonTitle}
          customLessonContent={analysisResult}
          student={{
            name: student.name,
            university: student.university,
            phone: student.phone,
          } as any}
        />
      )}

      {/* 7. MODAL: Smart Doctor Configuration (إعدادات الدكتور الذكي) */}
      {showDoctorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/40">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    🎓 خدمة «الدكتور الذكي»
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    تخصيص أسلوب المحاضرة الجامعية وفق دكاترة ومناهج الميكاترونكس
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDoctorModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-right dir-rtl">
              {/* Disclaimer Notice Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="block font-bold mb-0.5">تنبيه أمانة علمية:</strong>
                  اسم الدكتور هو حقل لتحديد الأسلوب الأكاديمي المطلوب، والشرح تعليمي مولد بالذكاء الاصطناعي وفق المناهج الهندسية وليس تسجيلاً رسمياً أو صوتياً صادراً عن ذلك الدكتور.
                </div>
              </div>

              {/* Doctor Name Field & Quick Suggestions */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  اسم الدكتور أو المحاضر:
                </label>
                <input
                  type="text"
                  value={doctorConfig.doctorName}
                  onChange={(e) => setDoctorConfig({ ...doctorConfig, doctorName: e.target.value })}
                  placeholder="مثال: د. عبدالسلام الحكيمي أو د. محمد الخولاني..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 font-bold">اقتراحات سريعة:</span>
                  {[
                    'د. عبدالله الشامي',
                    'د. محمد الخولاني',
                    'د. عبدالسلام الحكيمي',
                    'د. سامي القدسي',
                    'د. طارق الحبيشي',
                  ].map((doc) => (
                    <button
                      key={doc}
                      type="button"
                      onClick={() => setDoctorConfig({ ...doctorConfig, doctorName: doc })}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold hover:bg-indigo-100 transition-colors"
                    >
                      {doc}
                    </button>
                  ))}
                  {doctorConfig.doctorName && (
                    <button
                      type="button"
                      onClick={() => setDoctorConfig({ ...doctorConfig, doctorName: '' })}
                      className="px-2 py-1 rounded-lg text-rose-500 text-[11px] hover:bg-rose-50"
                    >
                      مسح
                    </button>
                  )}
                </div>
              </div>

              {/* University & Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    الجامعة:
                  </label>
                  <input
                    type="text"
                    value={doctorConfig.university}
                    onChange={(e) => setDoctorConfig({ ...doctorConfig, university: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    المستوى الدراسي:
                  </label>
                  <select
                    value={doctorConfig.studyLevel}
                    onChange={(e) => setDoctorConfig({ ...doctorConfig, studyLevel: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none"
                  >
                    <option value="السنة الأولى">السنة الأولى (Freshman)</option>
                    <option value="السنة الثانية">السنة الثانية (Sophomore)</option>
                    <option value="السنة الثالثة">السنة الثالثة (Junior)</option>
                    <option value="السنة الرابعة">السنة الرابعة (Senior)</option>
                    <option value="السنة الخامسة">السنة الخامسة (Graduation)</option>
                  </select>
                </div>
              </div>

              {/* Reference Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  المرجع المطلوب:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDoctorConfig({ ...doctorConfig, referenceSource: 'serway' })}
                    className={`p-3 rounded-xl border-2 text-right transition-all text-xs font-bold cursor-pointer ${
                      doctorConfig.referenceSource === 'serway'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    📘 مرجع Serway للفيزياء
                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Physics for Scientists & Engineers</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoctorConfig({ ...doctorConfig, referenceSource: 'student_file' })}
                    className={`p-3 rounded-xl border-2 text-right transition-all text-xs font-bold cursor-pointer ${
                      doctorConfig.referenceSource === 'student_file'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    📄 ملف يرفعه الطالب
                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">ملزمة أو سلايدات المادة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoctorConfig({ ...doctorConfig, referenceSource: 'other' })}
                    className={`p-3 rounded-xl border-2 text-right transition-all text-xs font-bold cursor-pointer ${
                      doctorConfig.referenceSource === 'other'
                        ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🌐 مصادر تعليمية أخرى
                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">المعرفة الهندسية الشاملة</span>
                  </button>
                </div>
              </div>

              {/* Explanation Style Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  خيارات أسلوب الشرح:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'simplified_beginner' as const, label: '🟢 شرح مبسط للمبتدئين' },
                    { id: 'university_detailed' as const, label: '🔵 شرح جامعي مفصل' },
                    { id: 'formulas_derivation' as const, label: '📐 شرح القوانين' },
                    { id: 'step_by_step_problems' as const, label: '🧮 حل المسائل خطوة بخطوة' },
                    { id: 'diagrams_visual' as const, label: '🖼️ شرح بالرسومات' },
                    { id: 'practical_applications' as const, label: '🔬 أمثلة تطبيقية' },
                    { id: 'exam_review' as const, label: '📑 مراجعة للاختبار' },
                    { id: 'practice_questions' as const, label: '📝 أسئلة تدريبية' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setDoctorConfig({ ...doctorConfig, explanationStyle: s.id })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                        doctorConfig.explanationStyle === s.id
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration choice */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  مدة الشرح المطلوبة:
                </label>
                <div className="flex gap-2">
                  {[
                    { val: 5 as const, label: '⚡ 5 دقائق (مكثف سريع)' },
                    { val: 15 as const, label: '⏱️ 15 دقيقة (شامل ومعتدل)' },
                    { val: 30 as const, label: '📖 30 دقيقة (محاضرة كاملة)' },
                  ].map((dur) => (
                    <button
                      key={dur.val}
                      type="button"
                      onClick={() => setDoctorConfig({ ...doctorConfig, durationMinutes: dur.val })}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        doctorConfig.durationMinutes === dur.val
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                سيتم تفعيل هذه الإعدادات تلقائياً عند طلب الشرح
              </span>
              <button
                type="button"
                onClick={() => setShowDoctorModal(false)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all cursor-pointer shadow-md"
              >
                حفظ الإعدادات وتأكيد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL: Educational Video Presentation Slideshow (سلايدات الفيديو التفاعلية) */}
      {showPresentationModal && analysisResult && (() => {
        const presentation = analysisResult.educationalPresentation || {
          id: 'pres-' + analysisResult.id,
          lessonTitle: analysisResult.lessonTitle,
          totalDurationSeconds: 300,
          isGeneratedAlternative: true,
          disclaimer: 'عرض سلايدات تعليمية تفاعلية مولدة بالذكاء الاصطناعي',
          slides: [
            {
              slideNumber: 1,
              title: `مقدمة الدرس: ${analysisResult.lessonTitle}`,
              type: 'concept' as const,
              bullets: [analysisResult.simpleIdea, 'المجال: هندسة الميكاترونكس والفيزياء العامة'],
              audioNarrationScript: `مرحباً بكم في شرح درس ${analysisResult.lessonTitle}. الفكرة الأساسية ببساطة هي: ${analysisResult.simpleIdea}.`,
            },
            {
              slideNumber: 2,
              title: 'أهم المفاهيم الهندسية',
              type: 'concept' as const,
              bullets: (analysisResult.coreTakeaways || []).slice(0, 4),
              audioNarrationScript: 'نتناول الآن المفاهيم الهندسية الأساسية التي يقوم عليها هذا الدرس، ونربطها بتطبيقات الأتمتة والروبوتات.',
            },
            {
              slideNumber: 3,
              title: 'القوانين والمعادلات والوحدات',
              type: 'formula' as const,
              bullets: (analysisResult.formulas || []).slice(0, 3).map((f) => `${f.equation}: ${f.meaning}`),
              latexFormula: analysisResult.formulas?.[0]?.equation,
              audioNarrationScript: `أهم قانون في هذا الدرس هو: ${analysisResult.formulas?.[0]?.equation || 'العلاقة الفيزيائية الموضحة'}.`,
            },
            {
              slideNumber: 4,
              title: 'مسألة تطبيقية محلولة',
              type: 'example' as const,
              bullets: [
                analysisResult.solvedExample?.problem || 'مسألة تطبيقية على المفهوم',
                `النتيجة النهائية: ${analysisResult.solvedExample?.finalAnswer || 'حساب القيمة'}`
              ],
              audioNarrationScript: 'دعونا ننتقل لحل المسألة التطبيقية خطوة بخطوة للوصول إلى النتيجة الصحيحة مع مراعاة وحدات القياس.',
            },
            {
              slideNumber: 5,
              title: 'الخلاصة والأخطاء الشائعة',
              type: 'summary' as const,
              bullets: [
                ...(analysisResult.summaryPoints || []).slice(0, 2),
                ...(analysisResult.commonMistakes || []).slice(0, 2).map((m) => `خطأ شائع: ${m.mistake}`)
              ],
              audioNarrationScript: `في الختام، تذكروا دائماً مراجعة الوحدات والمعادلات بدقة. بالتوفيق في دراستكم!`,
            }
          ]
        };

        const slides = presentation.slides || [];
        const activeSlide = slides[currentSlideIndex] || slides[0];

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-slate-900 text-white rounded-3xl max-w-4xl w-full flex flex-col shadow-2xl border border-slate-700 overflow-hidden my-auto">
              
              {/* Header Bar */}
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
                    <Presentation className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                      <span>🎬 عرض سلايدات الفيديو والشرح الصوتي</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-300 font-mono">
                        {currentSlideIndex + 1} / {slides.length}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 truncate max-w-md">
                      {presentation.lessonTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      setShowPresentationModal(false);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Slide Canvas */}
              <div className="p-6 sm:p-10 min-h-[380px] sm:min-h-[440px] flex flex-col justify-between bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 text-right dir-rtl">
                <div className="space-y-6">
                  {/* Slide Title */}
                  <div className="space-y-2 border-b border-slate-800/80 pb-4">
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                      شريحة تعليمية رقم {activeSlide?.slideNumber || currentSlideIndex + 1}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {activeSlide?.title}
                    </h2>
                  </div>

                  {/* Key Formula Box if available */}
                  {activeSlide?.latexFormula && (
                    <div className="p-4 rounded-2xl bg-indigo-950/70 border-2 border-indigo-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-amber-400" />
                        القانون الأساسي:
                      </span>
                      <span className="font-mono text-base sm:text-lg font-black text-amber-300 tracking-wide dir-ltr">
                        {activeSlide.latexFormula}
                      </span>
                    </div>
                  )}

                  {/* Bullet Points */}
                  <div className="space-y-2.5">
                    {activeSlide?.bullets?.map((pt, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm text-slate-200 leading-relaxed">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Narration Script Audio Player */}
                <div className="mt-8 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => speakSlideText(activeSlide?.audioNarrationScript || activeSlide?.title || '')}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white transition-all cursor-pointer shadow-md ${
                        isSpeakingSlide
                          ? 'bg-rose-600 hover:bg-rose-700 animate-pulse'
                          : 'bg-indigo-600 hover:bg-indigo-500'
                      }`}
                      title={isSpeakingSlide ? 'إيقاف الصوت' : 'تشغيل الصوت وقراءة الشريحة'}
                    >
                      {isSpeakingSlide ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <div>
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                        {isSpeakingSlide ? 'جاري القراءة الصوتية للشريحة...' : 'نص التعليق الصوتي (Voiceover):'}
                      </span>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                        {activeSlide?.audioNarrationScript || 'شرح صوتي تفاعلي للشريحة'}
                      </p>
                    </div>
                  </div>

                  {isSpeakingSlide && (
                    <button
                      type="button"
                      onClick={stopSpeaking}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold transition-all"
                    >
                      إيقاف ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="p-4 sm:p-5 bg-slate-950 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={currentSlideIndex === 0}
                  onClick={() => {
                    stopSpeaking();
                    setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    currentSlideIndex === 0
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer'
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>الشريحة السابقة</span>
                </button>

                {/* Dots indicator */}
                <div className="flex items-center gap-1.5">
                  {slides.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => {
                        stopSpeaking();
                        setCurrentSlideIndex(dotIdx);
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentSlideIndex === dotIdx
                          ? 'w-6 bg-indigo-500'
                          : 'w-2 bg-slate-700 hover:bg-slate-500'
                      }`}
                      title={`انتقل للشريحة ${dotIdx + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentSlideIndex >= slides.length - 1}
                  onClick={() => {
                    stopSpeaking();
                    setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    currentSlideIndex >= slides.length - 1
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md'
                  }`}
                >
                  <span>الشريحة التالية</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
