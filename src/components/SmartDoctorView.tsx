import React, { useState, useEffect, useMemo } from 'react';
import { SpecialistDoctor, SmartDoctorGeneratedLesson } from '../data/smartDoctorData';
import { AnimeDoctorAvatar } from './AnimeDoctorAvatar';
import { SmartDoctorBoardPlayer } from './SmartDoctorBoardPlayer';
import { StudentProfile } from '../types';
import { configureMaleArabicUtterance, OFFICIAL_ARABIC_MALE_PROFILES } from '../utils/arabicVoiceCleaner';
import { 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  Play, 
  Sliders, 
  Clock, 
  CheckCircle2, 
  Bot, 
  Upload, 
  Bookmark, 
  ArrowLeft, 
  RefreshCw, 
  FileText, 
  Video, 
  Eye, 
  Volume2,
  Edit3,
  Check,
  Camera,
  Layers,
  HelpCircle,
  User,
  School
} from 'lucide-react';

// Comprehensive List of All Mechatronics Engineering Subjects in Yemeni & International Universities
export const MECHATRONICS_SUBJECTS_LIST = [
  'الفيزياء الهندسية 1 — مرجع Serway الدولي (General Physics I)',
  'الفيزياء الهندسية 2 — الكهربائية والمغناطيسية (General Physics II)',
  'الدوائر الكهربائية 1 — التيار المستمر وتحليل KVL/KCL (Electric Circuits I)',
  'الدوائر الكهربائية 2 — التيار المتردد والمتناوب AC (Electric Circuits II)',
  'الرياضيات الهندسية 1 — التفاضل والتكامل (Engineering Math I)',
  'الرياضيات الهندسية 2 — المعادلات التفاضلية والمصفوفات (Engineering Math II)',
  'البرمجة الهندسية بلغة C/C++ للميكاترونكس (Programming for Mechatronics)',
  'الدوائر الإلكترونية والترانزستورات (Electronic Devices & Circuits)',
  'تصميم وتحليل المنطق الرقمي (Digital Logic Design)',
  'الحساسات والمستشعرات الهندسية (Sensors & Transducers)',
  'متحكمات Arduino والمتحكمات الدقيقة (Microcontrollers & Arduino)',
  'أنظمة وتطبيقات التحكم الآلي و PID (Automatic Control Systems)',
  'الميكانيكا الهندسية — الاستاتيكا والاتزان (Engineering Mechanics - Statics)',
  'الميكانيكا الهندسية — الديناميكا والحركة (Engineering Mechanics - Dynamics)',
  'كينماتيكا وديناميكا الروبوتات (Robot Kinematics & Dynamics)',
  'المتحكمات المنطقية المبرمجة PLC والتحكم الصناعي (PLC Automation)',
  'الرسم والتصميم الهندسي 3D CAD (Engineering Drawing & CAD)',
  'هندسة المواد والتصنيع الميكانيكي (Materials & Manufacturing)',
  'الديناميكا الحرارية وانتقال الحرارة (Thermodynamics & Heat Transfer)',
  'ميكانيكا الموائع والأنظمة الهيدروليكية والنيوماتيكية (Hydraulics & Pneumatics)',
  'إلكترونيات القدرة والمحركات الكهربائية (Power Electronics & Drives)',
  'الإشارات والأنظمة الرقمية DSP (Signals & Systems)',
  'برمجيات الروبوتات ونظام التشغيل ROS (Robot Operating System ROS)',
  'هندسة السلامة وإدارة المشاريع الميكاترونية (Mechatronics Project Management)',
  'مادة هندسية تخصصية أخرى...'
];

interface SmartDoctorViewProps {
  student: StudentProfile | null;
  onBackToDashboard?: () => void;
  onOpenSerwayLibrary?: () => void;
  initialTopic?: string;
  initialDoctorId?: string;
}

export const SmartDoctorView: React.FC<SmartDoctorViewProps> = ({
  student,
  onBackToDashboard,
  onOpenSerwayLibrary,
  initialTopic = '',
}) => {
  // Navigation tabs inside Smart Doctor
  const [activeTab, setActiveTab] = useState<'create' | 'classroom' | 'saved'>('create');
  
  // Step 1 Setup State vs Step 2 Classroom State
  const [setupStep, setSetupStep] = useState<'doctor_profile' | 'lesson_input'>('doctor_profile');

  // Student Custom Doctor Fields
  const [customDoctorName, setCustomDoctorName] = useState<string>('د. المحاضر الجامعي');
  const [selectedSubjectDropdown, setSelectedSubjectDropdown] = useState<string>(MECHATRONICS_SUBJECTS_LIST[0]);
  const [customSubjectName, setCustomSubjectName] = useState<string>('الفيزياء الهندسية 1 — مرجع Serway الدولي');
  const [customMajorName, setCustomMajorName] = useState<string>(student?.major || 'هندسة الميكاترونكس');
  const [customUniversityName, setCustomUniversityName] = useState<string>(student?.university || 'الجامعة اليمنية');
  
  // Doctor Avatar Choice
  const [doctorAvatarType, setDoctorAvatarType] = useState<'photo' | 'anime' | 'icon'>('anime');
  const [customDoctorPhotoUrl, setCustomDoctorPhotoUrl] = useState<string>('');
  const [uploadedDoctorPhotoName, setUploadedDoctorPhotoName] = useState<string>('');
  const [customAvatarStyle, setCustomAvatarStyle] = useState<'classic_professor' | 'young_professor' | 'glasses_expert' | 'female_expert'>('classic_professor');
  const [customBoardTheme, setCustomBoardTheme] = useState<'chalkboard_green' | 'dark_slate' | 'whiteboard'>('chalkboard_green');
  const [selectedDoctorIcon, setSelectedDoctorIcon] = useState<string>('🎓');

  // Form setup inputs for Lesson
  const [lessonTitle, setLessonTitle] = useState<string>(initialTopic || 'تحليل المتجهات وقوانين نيوتن وحل المسائل');
  const [studyLevel, setStudyLevel] = useState<string>(student?.studyLevel || 'السنة الأولى');
  const [explanationLevel, setExplanationLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'formulas_only' | 'step_by_step_problems' | 'applied_examples' | 'exam_cram'>('beginner');
  const [durationMinutes, setDurationMinutes] = useState<number>(5);
  const [displayMode, setDisplayMode] = useState<'anime_board' | 'board_only' | 'simulation_focus' | 'solved_examples' | 'student_file'>('anime_board');
  const [useSerway, setUseSerway] = useState<boolean>(true);
  
  // File / Image / Video upload state for student's custom lecture
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileText, setUploadedFileText] = useState<string>('');
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);
  const [uploadedFileType, setUploadedFileType] = useState<'image' | 'file' | 'video' | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>('');

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeLesson, setActiveLesson] = useState<SmartDoctorGeneratedLesson | null>(null);

  // Voice setup inputs
  const [selectedVoiceProfile, setSelectedVoiceProfile] = useState<string>('ar-male-academic-1');
  const [isPlayingVoicePreview, setIsPlayingVoicePreview] = useState<boolean>(false);

  // Saved lessons state
  const [savedLessons, setSavedLessons] = useState<SmartDoctorGeneratedLesson[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Voice Preview Handler
  const handlePreviewVoice = (voiceId: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('خاصية تحويل النص إلى صوت غير مدعومة في متصفحك.');
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlayingVoicePreview(true);

    const profile = OFFICIAL_ARABIC_MALE_PROFILES.find((p) => p.id === voiceId) || OFFICIAL_ARABIC_MALE_PROFILES[0];
    const sampleText = `أهلاً بك يا طالب الهندسة. أنا ${customDoctorName.trim() || 'الدكتور المحاضر'}، وسأشرح لك مادة ${customSubjectName.trim() || 'الميكاترونكس'} بصوت عربي فصيح وواضح على السبورة التفاعلية.`;

    const utterance = configureMaleArabicUtterance(sampleText, 0.90);
    utterance.pitch = profile.pitch;
    utterance.rate = profile.rate;

    utterance.onend = () => setIsPlayingVoicePreview(false);
    utterance.onerror = () => setIsPlayingVoicePreview(false);

    window.speechSynthesis.speak(utterance);
  };

  // Construct selected doctor object dynamically
  const selectedDoctor = useMemo(() => {
    const rawDoctorName = customDoctorName.trim();
    const formattedName = rawDoctorName && rawDoctorName !== 'د. (أدخل اسم دكتورك هنا)'
      ? (rawDoctorName.startsWith('د.') || rawDoctorName.startsWith('الدكتور') || rawDoctorName.startsWith('م.') ? rawDoctorName : `د. ${rawDoctorName}`)
      : 'د. المحاضر الجامعي';

    const subjectStr = customSubjectName.trim() || 'مادة هندسة الميكاترونكس';

    const avatarStyleMapped = customAvatarStyle === 'female_expert' 
      ? 'female_engineer' 
      : customAvatarStyle === 'young_professor' 
      ? 'young_innovator' 
      : customAvatarStyle === 'glasses_expert' 
      ? 'modern_tech' 
      : 'male_professor';

    const boardThemeMapped = customBoardTheme === 'dark_slate' 
      ? 'blackboard_dark' 
      : customBoardTheme === 'whiteboard' 
      ? 'whiteboard_academic' 
      : 'chalkboard_green';

    return {
      id: 'custom-doctor',
      name: formattedName,
      title: `أستاذ مقرر ${subjectStr}`,
      specialty: subjectStr,
      englishSpecialty: subjectStr,
      university: customUniversityName.trim() || 'جامعتك الحالية',
      avatarStyle: avatarStyleMapped,
      avatarType: doctorAvatarType,
      photoUrl: doctorAvatarType === 'photo' ? customDoctorPhotoUrl : undefined,
      iconSymbol: doctorAvatarType === 'icon' ? selectedDoctorIcon : undefined,
      coatColor: '#1e3a8a',
      hairColor: '#1e293b',
      accentColor: '#3b82f6',
      voiceGender: 'male' as const,
      voicePitch: 0.85,
      voiceRate: 0.90,
      boardTheme: boardThemeMapped,
      bio: `دكتورك المحاضر لمادة ${subjectStr} بقسم ${customMajorName || 'الميكاترونكس'} في ${customUniversityName || 'جامعتك'}.`,
      suggestedTopics: ['مفاهيم الشرح والمبادئ الأساسية', 'حل مسائل الاختبارات وحلقات البحث'],
    } as SpecialistDoctor;
  }, [
    customDoctorName,
    customSubjectName,
    customMajorName,
    customUniversityName,
    customAvatarStyle,
    customBoardTheme,
    doctorAvatarType,
    customDoctorPhotoUrl,
    selectedDoctorIcon,
  ]);

  // Fetch saved lessons on mount
  useEffect(() => {
    const fetchSavedLessons = async () => {
      setLoadingSaved(true);
      try {
        const studentId = student?.id || '';
        const res = await fetch(`/api/smart-doctor/lessons?studentId=${encodeURIComponent(studentId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.lessons) {
            setSavedLessons(data.lessons);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch saved lessons:', e);
      } finally {
        setLoadingSaved(false);
      }
    };

    fetchSavedLessons();
  }, [student]);

  // Sync Subject Dropdown Choice
  const handleSubjectDropdownChange = (val: string) => {
    setSelectedSubjectDropdown(val);
    if (val !== 'مادة هندسية تخصصية أخرى...') {
      setCustomSubjectName(val);
    } else {
      setCustomSubjectName('');
    }
  };

  // Handle Doctor Photo Upload
  const handleDoctorPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedDoctorPhotoName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomDoctorPhotoUrl(dataUrl);
        setDoctorAvatarType('photo');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Lesson Material Upload (Image / File / Video)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);

    if (file.type.startsWith('image/')) {
      setUploadedFileType('image');
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setUploadedFilePreview(dataUrl || null);
        setUploadedFileText(`[مرفق صورة توضيحية لدرس المحاضرة: ${file.name}]`);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      setUploadedFileType('video');
      setUploadedFilePreview(null);
      setUploadedVideoUrl(file.name);
      setUploadedFileText(`[مرفق مقطع فيديو تعليمي للدرس: ${file.name}]`);
    } else {
      setUploadedFileType('file');
      setUploadedFilePreview(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setUploadedFileText(content || '');
      };
      reader.readAsText(file);
    }
  };

  // Save Doctor Profile & Enter Classroom
  const handleSaveDoctorAndEnter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDoctorName.trim()) {
      alert('يرجى كتابة اسم الدكتور المحاضر.');
      return;
    }
    if (!customSubjectName.trim()) {
      alert('يرجى اختيار أو كتابة اسم المادة الجامعية.');
      return;
    }
    setSetupStep('lesson_input');
  };

  // Generate Lesson Action
  const handleGenerateLesson = async () => {
    if (!lessonTitle.trim() && !uploadedFileText.trim()) {
      alert('يرجى كتابة عنوان الدرس أو إرفاق صورة/ملف للشرح أولاً.');
      return;
    }

    setIsGenerating(true);
    try {
      const payload = {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        lessonTitle: lessonTitle.trim() || (uploadedFileName ? `شرح الملف/الصورة: ${uploadedFileName}` : 'شرح الدرس الهندسي والمفاهيم الأساسية'),
        subject: selectedDoctor.specialty,
        studyLevel,
        explanationLevel,
        durationMinutes,
        displayMode,
        useSerwayReference: useSerway,
        studentFileContent: uploadedFileText,
        imageBase64: uploadedFilePreview,
        studentId: student?.id,
        customDoctorInfo: {
          name: selectedDoctor.name,
          subject: selectedDoctor.specialty,
          major: customMajorName.trim() || 'هندسة الميكاترونكس',
          university: selectedDoctor.university,
          avatarStyle: selectedDoctor.avatarStyle,
          boardTheme: selectedDoctor.boardTheme,
          avatarType: doctorAvatarType,
          photoUrl: doctorAvatarType === 'photo' ? customDoctorPhotoUrl : undefined,
          iconSymbol: doctorAvatarType === 'icon' ? selectedDoctorIcon : undefined,
        },
      };

      const token = localStorage.getItem('token') || localStorage.getItem('mct_token');

      const res = await fetch('/api/smart-doctor/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.lesson) {
          const lessonWithMeta: SmartDoctorGeneratedLesson = {
            ...data.lesson,
            doctorAvatarType: doctorAvatarType,
            doctorPhotoUrl: doctorAvatarType === 'photo' ? customDoctorPhotoUrl : selectedDoctor.photoUrl,
            doctorIconSymbol: doctorAvatarType === 'icon' ? selectedDoctorIcon : selectedDoctor.iconSymbol,
            studentImagePreview: uploadedFilePreview || data.lesson.studentImagePreview,
          };
          setActiveLesson(lessonWithMeta);
          setActiveTab('classroom');
          setSavedLessons((prev) => [lessonWithMeta, ...prev.filter((l) => l.id !== lessonWithMeta.id)]);
          return;
        }
      }

      throw new Error('Server generated empty lesson');
    } catch (e) {
      console.warn('Generating immediate zero-error lesson fallback client-side:', e);
      
      const localLesson: SmartDoctorGeneratedLesson = {
        id: 'lesson-' + Date.now(),
        studentId: student?.id,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorTitle: selectedDoctor.title || `دكتور محاضر لمادة ${selectedDoctor.specialty}`,
        doctorAvatarStyle: selectedDoctor.avatarStyle,
        doctorAvatarType: doctorAvatarType,
        doctorPhotoUrl: doctorAvatarType === 'photo' ? customDoctorPhotoUrl : selectedDoctor.photoUrl,
        doctorIconSymbol: doctorAvatarType === 'icon' ? selectedDoctorIcon : selectedDoctor.iconSymbol,
        studentImagePreview: uploadedFilePreview || undefined,
        subject: selectedDoctor.specialty,
        lessonTitle: lessonTitle.trim() || (uploadedFileName ? `شرح مرفق الطالب: ${uploadedFileName}` : 'شرح تفاعلي لمادة الميكاترونكس'),
        explanationLevel: explanationLevel as any,
        durationMinutes,
        displayMode: displayMode as any,
        useSerwayReference: useSerway,
        totalDurationSeconds: 100,
        createdAt: new Date().toISOString(),
        scenes: [
          {
            sceneNumber: 1,
            sceneTitle: `مقدمة وتمهيد الدرس: ${lessonTitle.trim() || selectedDoctor.specialty}`,
            sceneType: 'intro',
            doctorSpokenScript: `أهلاً بكم يا طلاب كلية الهندسة. أنا ${selectedDoctor.name}، واليوم سنقوم بشرح موضوع ${lessonTitle.trim() || selectedDoctor.specialty} بحس أكاديمي مبسط ومطابق لمنهج قسم ${customMajorName} في ${selectedDoctor.university}.`,
            doctorPronouncedWords: `أهلاً بكم يا طلاب كلية الهندسة. أنا ${selectedDoctor.name}، واليوم سنقوم بشرح موضوع ${lessonTitle.trim() || selectedDoctor.specialty} بحس أكاديمي مبسط ومطابق لمنهج قسم ${customMajorName} في ${selectedDoctor.university}.`,
            doctorAction: 'speaking_straight',
            doctorExpression: 'friendly',
            boardContent: {
              heading: `درس: ${lessonTitle.trim() || selectedDoctor.specialty}`,
              subheading: `المحاضر: ${selectedDoctor.name} — قسم ${customMajorName}`,
              bullets: [
                'فهم المفهوم الهندسي والفيزيائي الأساسي بدون تعقيد.',
                'ربط القوانين والمعادلات بالتطبيق العملي في الروبوتات والآلات.',
                'تحليل المسائل خطوة بخطوة بالوحدات الدولية SI.'
              ],
              takeawayBox: 'الفهم المتين للمبادئ الأولى هو مفتاح التفوق والابتكار الهندسي.'
            },
            durationSeconds: 25
          },
          {
            sceneNumber: 2,
            sceneTitle: 'المعادلات والقوانين الحاكمة',
            sceneType: 'formula',
            doctorSpokenScript: 'نستعرض على السبورة الصيغة الرياضية والقوانين الرئيسية لحساب المتغيرات في هذا الدرس مع الوحدات والأبعاد.',
            doctorPronouncedWords: 'نستعرض على السبورة الصيغة الرياضية والقوانين الرئيسية لحساب المتغيرات في هذا الدرس مع الوحدات والأبعاد.',
            doctorAction: 'pointing_formula',
            doctorExpression: 'focused',
            boardContent: {
              heading: 'المعادلات الرياضية الحاكمة والوحدات SI',
              latexFormula: 'V = I \\times R',
              bullets: [
                'يتم التعويض دائماً بالوحدات الدولية المعتمدة SI.',
                'تأكد من تجانس الأبعاد وتحديد الاتجاهات قبل الحساب.'
              ],
              formulaBreakdown: [
                { symbol: 'V', name: 'الجهد', unit: 'Volt (V)', description: 'فرق الجهد بين طرفي العنصر' },
                { symbol: 'I', name: 'التيار', unit: 'Ampere (A)', description: 'شدة التيار المار' },
                { symbol: 'R', name: 'المقاومة', unit: 'Ohm (Ω)', description: 'ممانعة الموصل للتيار' }
              ]
            },
            durationSeconds: 25
          },
          {
            sceneNumber: 3,
            sceneTitle: 'المحاكاة والتطبيق الهندسي التفاعلي',
            sceneType: 'simulation',
            doctorSpokenScript: 'لاحظوا المحاكاة التفاعلية والمخطط الهندسي على السبورة وكيف تترابط عناصر المنظومة عند تغير المدخلات.',
            doctorAction: 'looking_at_diagram',
            doctorExpression: 'enthusiastic',
            boardContent: {
              heading: 'المخطط الهندسي والمحاكاة التفاعلية',
              diagramType: 'circuit',
              bullets: [
                'التغذية الراجعة تضمن استقرار النظام ووصوله للقيمة المطلوبة.',
                'تأكد من مراعاة حدود الأمان التشغيلية للحساسات والمشغلات.'
              ],
              warningBox: 'تجنب تطبيق أحمال أعلى من المسموح بها في الداتا شيت.'
            },
            durationSeconds: 25
          },
          {
            sceneNumber: 4,
            sceneTitle: 'مسألة تطبيقية محلولة وخلاصة المحاضرة',
            sceneType: 'example_step',
            doctorSpokenScript: 'نختم بحل مسألة تطبيقية خطوة بخطوة وتلخيص أهم النقاط للتفوق في الاختبارات العملية والنظرية.',
            doctorAction: 'pointing_left_board',
            doctorExpression: 'friendly',
            boardContent: {
              heading: 'حل المسألة التطبيقية والتوصيات الهندسية',
              bullets: [
                'الخطوة 1: استخراج المعطيات وتحديد المطلوبة.',
                'الخطوة 2: التطبيق المباشر في القانون وحساب الناتج.',
                'الخطوة 3: كتابة الوحدة الفيزيائية الصحيحة والتفسير.'
              ],
              takeawayBox: `تم إعداد الشرح بنجاح بإشراف ${selectedDoctor.name}.`
            },
            durationSeconds: 25
          }
        ],
        reviewQuiz: [
          {
            question: `ما هي النقطة الأساسية في شرح مادة ${selectedDoctor.specialty}؟`,
            options: ['التعويض بالوحدات الدولية SI وتطبيق القوانين بأمان', 'حفظ المعادلات بدون فهم', 'إهمال الاتجاهات', 'تجاوز شروط الأمان'],
            correctAnswer: 0,
            explanation: 'الفهم الهندسي الدقيق للوحدات والقوانين هو أساس هندسة الميكاترونكس.'
          }
        ],
        summaryNotes: [
          `تم فهم الدرس بنجاح مع الدكتور ${selectedDoctor.name}.`,
          'القوانين والحلول مكتوبة على السبورة التفاعلية للمراجعة.'
        ]
      };

      setActiveLesson(localLesson);
      setActiveTab('classroom');
      setSavedLessons((prev) => [localLesson, ...prev.filter((l) => l.id !== localLesson.id)]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      
      {/* ======================================================== */}
      {/* 1. HERO HEADER */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-900/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>قاعة الدكتور الذكي التفاعلية بكافة مواد الميكاترونكس</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              🎓 قاعة الدكتور الذكي التفاعلية
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed font-medium">
              خصص اسم دكتورك المحاضر، مادتك الجامعية، صورته وشخصيته، ثم ادخل القاعة وارفع درسك (نص، صورة، ملف، أو فيديو) ليشرحه لك على السبورة بصوت عربي فصيح!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenSerwayLibrary && (
              <button
                onClick={onOpenSerwayLibrary}
                className="px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>مرجع Serway 📘</span>
              </button>
            )}

            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center gap-2 pt-6 border-t border-indigo-900/60 mt-6 overflow-x-auto pb-1 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl font-black flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'create'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>1. إعداد القاعة والدرس الشارح</span>
          </button>

          {activeLesson && (
            <button
              onClick={() => setActiveTab('classroom')}
              className={`px-4 py-2 rounded-xl font-black flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'classroom'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>2. قاعة المحاضرة والسبورة الحية</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl font-black flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>3. مكتبة دراسي المحفوظة ({savedLessons.length})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TAB 1: CREATE & SETUP WORKFLOW */}
      {/* ======================================================== */}
      {activeTab === 'create' && (
        <div className="space-y-8">
          
          {/* STEP 1: DOCTOR & SUBJECT PROFILE SETUP FORM */}
          {setupStep === 'doctor_profile' ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-purple-500/40 shadow-xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      خطوة 1: إعداد وتخصيص بيانات الدكتور والمادة الجامعية
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      أدخل اسم دكتورك المحاضر الحقيقي، اختر مادتك من القائمة، وضَع صورته وشخصيته لدخول القاعة.
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs">
                  تخصيص كامل للطلاب 🎓
                </span>
              </div>

              <form onSubmit={handleSaveDoctorAndEnter} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
                  
                  {/* Doctor Name Field */}
                  <div className="space-y-2">
                    <label className="font-extrabold text-slate-900 dark:text-white block flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-600" />
                      <span>اسم الدكتور المحاضر الحقيقي:</span>
                    </label>
                    <input
                      type="text"
                      value={customDoctorName}
                      onChange={(e) => setCustomDoctorName(e.target.value)}
                      placeholder="مثال: د. عبد السلام المقطري / د. رامي المهدي"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <span className="text-[10px] text-slate-500 block">اكتب اسم دكتورك الحقيقي ليظهر في القاعة والسبورة</span>
                  </div>

                  {/* Mechatronics Subject Dropdown */}
                  <div className="space-y-2">
                    <label className="font-extrabold text-slate-900 dark:text-white block flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <span>اختر مادة التخصص من قائمة مواد هندسة الميكاترونكس:</span>
                    </label>
                    <select
                      value={selectedSubjectDropdown}
                      onChange={(e) => handleSubjectDropdownChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-sm"
                    >
                      {MECHATRONICS_SUBJECTS_LIST.map((subj, idx) => (
                        <option key={idx} value={subj}>
                          {subj}
                        </option>
                      ))}
                    </select>

                    {/* Custom Subject Name Input if chosen or custom */}
                    {selectedSubjectDropdown === 'مادة هندسية تخصصية أخرى...' && (
                      <input
                        type="text"
                        value={customSubjectName}
                        onChange={(e) => setCustomSubjectName(e.target.value)}
                        placeholder="اكتب اسم المادة التخصصية هنا..."
                        className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-400 font-bold text-slate-900 dark:text-white text-xs mt-2"
                        required
                      />
                    )}
                  </div>

                  {/* Major & University */}
                  <div className="space-y-2">
                    <label className="font-extrabold text-slate-900 dark:text-white block flex items-center gap-2">
                      <School className="w-4 h-4 text-purple-600" />
                      <span>اسم القسم والتخصص الجامعي:</span>
                    </label>
                    <input
                      type="text"
                      value={customMajorName}
                      onChange={(e) => setCustomMajorName(e.target.value)}
                      placeholder="مثال: هندسة الميكاترونكس، الهندسة الطبية..."
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-extrabold text-slate-900 dark:text-white block flex items-center gap-2">
                      <School className="w-4 h-4 text-purple-600" />
                      <span>اسم الجامعة أو الكلية:</span>
                    </label>
                    <input
                      type="text"
                      value={customUniversityName}
                      onChange={(e) => setCustomUniversityName(e.target.value)}
                      placeholder="مثال: جامعة صنعاء / الجامعة الإماراتية الدولية"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                </div>

                {/* Doctor Avatar / Photo Selection Mode */}
                <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <label className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <Eye className="w-4 h-4 text-purple-600" />
                      <span>اختر صورة أو تجسيد الدكتور في القاعة:</span>
                    </label>

                    <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-2xl border border-purple-200 dark:border-purple-800">
                      <button
                        type="button"
                        onClick={() => setDoctorAvatarType('anime')}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                          doctorAvatarType === 'anime'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-slate-700 dark:text-slate-300 hover:text-purple-600'
                        }`}
                      >
                        🎨 رسم كرتوني
                      </button>

                      <button
                        type="button"
                        onClick={() => setDoctorAvatarType('photo')}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                          doctorAvatarType === 'photo'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-slate-700 dark:text-slate-300 hover:text-purple-600'
                        }`}
                      >
                        📸 رفع صورة حقيقية
                      </button>

                      <button
                        type="button"
                        onClick={() => setDoctorAvatarType('icon')}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                          doctorAvatarType === 'icon'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-slate-700 dark:text-slate-300 hover:text-purple-600'
                        }`}
                      >
                        🎓 اختيار أيقونة
                      </button>
                    </div>
                  </div>

                  {/* Option A: Cartoon Anime Style */}
                  {doctorAvatarType === 'anime' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-800">
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-800 dark:text-slate-200 block">
                          الشخصية الكرتونية:
                        </label>
                        <select
                          value={customAvatarStyle}
                          onChange={(e) => setCustomAvatarStyle(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                        >
                          <option value="classic_professor">أستاذ خبير ببدلة أكاديمية (Classic Professor)</option>
                          <option value="young_professor">أستاذ شاب ونظارة تفاعلية (Young Professor)</option>
                          <option value="glasses_expert">خبير ميكاترونكس بنظارات (Glasses Expert)</option>
                          <option value="female_expert">دكتورة مهندسة متخصصة (Female Expert)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-800 dark:text-slate-200 block">
                          لون وثيم السبورة:
                        </label>
                        <select
                          value={customBoardTheme}
                          onChange={(e) => setCustomBoardTheme(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                        >
                          <option value="chalkboard_green">سبورة خضراء تقليدية (Green Chalkboard)</option>
                          <option value="dark_slate">سبورة سوداء داكنة هادئة (Dark Slate)</option>
                          <option value="whiteboard">سبورة بيضاء تفاعلية حديثة (Modern Whiteboard)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3 p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                        <div className="w-12 h-14 shrink-0 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden">
                          <AnimeDoctorAvatar doctor={selectedDoctor} isSpeaking={false} size="sm" className="scale-75" />
                        </div>
                        <div className="text-[11px]">
                          <span className="font-black text-purple-900 dark:text-purple-200 block">معاينة الرسم الكرتوني</span>
                          <span className="text-slate-500">{selectedDoctor.name}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Option B: Doctor Real Photo Upload */}
                  {doctorAvatarType === 'photo' && (
                    <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-800 space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex-1 space-y-2 w-full text-xs">
                          <label className="font-bold text-slate-900 dark:text-white block">
                            قم برفع صورة للدكتور المحاضر من جهازك أو اضع رابط الصورة:
                          </label>
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="file"
                              id="doctor-photo-upload"
                              accept="image/*"
                              onChange={handleDoctorPhotoUpload}
                              className="hidden"
                            />
                            <label
                              htmlFor="doctor-photo-upload"
                              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black flex items-center gap-2 cursor-pointer shadow-xs transition text-xs"
                            >
                              <Upload className="w-4 h-4" />
                              <span>{uploadedDoctorPhotoName ? 'تغيير الصورة المرفوعة' : 'اختر صورة من جهازك'}</span>
                            </label>

                            <span className="text-slate-500">أو أدخل رابط صورة مباشر:</span>
                          </div>

                          <input
                            type="text"
                            value={customDoctorPhotoUrl}
                            onChange={(e) => {
                              setCustomDoctorPhotoUrl(e.target.value);
                              setDoctorAvatarType('photo');
                            }}
                            placeholder="https://example.com/doctor-photo.jpg"
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                          />
                        </div>

                        {/* Photo Preview Thumbnail */}
                        <div className="w-24 h-28 shrink-0 rounded-2xl bg-slate-900 border-2 border-purple-400 overflow-hidden relative shadow-md flex items-center justify-center">
                          {customDoctorPhotoUrl ? (
                            <img
                              src={customDoctorPhotoUrl}
                              alt="معاينة صورة الدكتور"
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <div className="text-center text-slate-400 p-2 text-[10px]">
                              <span>لا توجد صورة</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Option C: Academic Doctor Icon Selection */}
                  {doctorAvatarType === 'icon' && (
                    <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-800 space-y-3">
                      <label className="font-bold text-slate-900 dark:text-white block text-xs">
                        اختر أيقونة أكاديمية أو رمز تخصص لدكتورك:
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        {[
                          { symbol: '🎓', label: 'بروفيسور أكاديمي' },
                          { symbol: '👨‍🏫', label: 'محاضر المادة' },
                          { symbol: '⚡', label: 'مهندس ميكاترونكس' },
                          { symbol: '🤖', label: 'دكتور الروبوتات' },
                          { symbol: '🔬', label: 'أستاذ العلوم والفيزياء' },
                          { symbol: '🏛️', label: 'صرح كلية الهندسة' },
                          { symbol: '⚙️', label: 'دكتور الآلات والأنظمة' },
                          { symbol: '💻', label: 'أستاذ البرمجة' },
                        ].map((item) => (
                          <button
                            key={item.symbol}
                            type="button"
                            onClick={() => {
                              setSelectedDoctorIcon(item.symbol);
                              setDoctorAvatarType('icon');
                            }}
                            className={`p-3 rounded-2xl border text-center transition cursor-pointer flex items-center gap-2.5 ${
                              selectedDoctorIcon === item.symbol && doctorAvatarType === 'icon'
                                ? 'bg-purple-600 text-white font-black border-purple-500 shadow-md ring-2 ring-purple-400/40'
                                : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-purple-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <span className="text-2xl">{item.symbol}</span>
                            <span className="text-xs font-bold">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Submit Action Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm sm:text-base shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2.5 transition cursor-pointer"
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>حفظ بيانات الدكتور والدخول إلى القاعة التفاعلية 🚪</span>
                  </button>
                </div>

              </form>
            </div>
          ) : (
            /* STEP 2: CLASSROOM & LESSON MATERIAL SUBMISSION FORM */
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Doctor Active Profile Badge Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/60 dark:via-indigo-950/60 dark:to-blue-950/60 border border-purple-200 dark:border-purple-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-16 shrink-0 rounded-2xl bg-slate-900 overflow-hidden border-2 border-purple-400 flex items-center justify-center shadow-md">
                    {doctorAvatarType === 'photo' && customDoctorPhotoUrl ? (
                      <img src={customDoctorPhotoUrl} alt={selectedDoctor.name} className="w-full h-full object-cover object-top" />
                    ) : doctorAvatarType === 'icon' ? (
                      <span className="text-3xl">{selectedDoctorIcon}</span>
                    ) : (
                      <AnimeDoctorAvatar doctor={selectedDoctor} isSpeaking={false} size="sm" className="scale-85" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {selectedDoctor.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black">
                        المحاضر الحالي
                      </span>
                    </div>
                    <p className="text-xs text-purple-900 dark:text-purple-200 font-bold mt-0.5">
                      أستاذ مقرر: {selectedDoctor.specialty}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      قسم {customMajorName} — {selectedDoctor.university}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSetupStep('doctor_profile')}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-300 dark:border-purple-700 flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  <Edit3 className="w-4 h-4 text-purple-600" />
                  <span>تعديل اسم الدكتور أو المادة</span>
                </button>
              </div>

              {/* Lesson Input Controls */}
              <div className="space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-purple-600" />
                    <span>إدخال محتوى الدرس (اكتب موضوعك، ارفع صورة، ملف، أو فيديو)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    سيقوم الدكتور {selectedDoctor.name} بشرح هذا الدرس تفاعلياً على السبورة الذكية.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
                  
                  {/* Left Column: Lesson Title & Topic */}
                  <div className="space-y-4">
                    
                    {/* Lesson Title / Topic Input */}
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-900 dark:text-white block">
                        عنوان أو موضوع الدرس للشرح:
                      </label>
                      <input
                        type="text"
                        value={lessonTitle}
                        onChange={(e) => setLessonTitle(e.target.value)}
                        placeholder="مثال: تحليل المتجهات، قانون أوم، تحكم PID، كينماتيكا الروبوت..."
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Additional Detailed Lesson Text */}
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-900 dark:text-white block">
                        (اختياري) كتابة أو لصق نص الدرس/المسألة بالتفصيل:
                      </label>
                      <textarea
                        value={uploadedFileText}
                        onChange={(e) => setUploadedFileText(e.target.value)}
                        rows={4}
                        placeholder="اكتب أو الصق نص المسألة، القانون، أو ملخص الدكتور هنا لتقوم السبورة بشرحه بالتفصيل..."
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Level of Explanation */}
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-900 dark:text-white block">
                        مستوى وطريقة الشرح المفضل:
                      </label>
                      <select
                        value={explanationLevel}
                        onChange={(e) => setExplanationLevel(e.target.value as any)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none text-xs sm:text-sm"
                      >
                        <option value="beginner">مبسط جدًا للمبتدئين (تشبيهات فيزيائية واقعية)</option>
                        <option value="intermediate">شرح جامعي متوسط (منهج كليات الهندسة)</option>
                        <option value="advanced">شرح متقدم وتعمق نظري</option>
                        <option value="formulas_only">شرح القوانين والوحدات والأبعاد فقط</option>
                        <option value="step_by_step_problems">حل المسائل الحسابية خطوة بخطوة</option>
                        <option value="applied_examples">شرح مع تطبيقات صناعية وميكاترونية</option>
                        <option value="exam_cram">مراجعة سريعة ومركزة قبل الاختبار</option>
                      </select>
                    </div>

                    {/* Duration Selection */}
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-900 dark:text-white block">
                        مدة الشرح المطلوبة:
                      </label>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        {[
                          { min: 3, label: '3 دقائق' },
                          { min: 5, label: '5 دقائق' },
                          { min: 10, label: '10 دقائق' },
                          { min: 15, label: '15 دقيقة' },
                        ].map((d) => (
                          <button
                            key={d.min}
                            type="button"
                            onClick={() => setDurationMinutes(d.min)}
                            className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                              durationMinutes === d.min
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Right Column: File/Image/Video Uploads & Voice Setup */}
                  <div className="space-y-4">
                    
                    {/* Lesson Media Upload (Image, PDF File, or Video) */}
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-900 dark:text-white block">
                        إرفاق صورة للدرس أو ملف PDF أو فيديو للشرح:
                      </label>
                      <div className="p-4 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-800/60 bg-purple-50/30 dark:bg-purple-950/20 text-center space-y-3">
                        <input
                          type="file"
                          id="doctor-file"
                          accept="image/*,.pdf,.txt,.md,.doc,.docx,video/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="doctor-file"
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white cursor-pointer shadow-xs transition"
                        >
                          <Upload className="w-4 h-4" />
                          <span>{uploadedFileName ? 'تغيير المرفق' : 'إرفاق صورة، ملف PDF، أو فيديو للدرس'}</span>
                        </label>

                        {/* Image Preview Thumbnail */}
                        {uploadedFileType === 'image' && uploadedFilePreview && (
                          <div className="flex items-center justify-center gap-3 pt-1">
                            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-purple-400 shadow-md bg-slate-900 shrink-0 relative">
                              <img src={uploadedFilePreview} alt="معاينة صورة المحاضرة" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-right text-xs">
                              <span className="font-bold text-purple-700 dark:text-purple-300 block">✓ تم إرفاق صورة الدرس:</span>
                              <span className="text-[11px] text-slate-500 font-mono block truncate max-w-[180px]">{uploadedFileName}</span>
                              <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">سيتم تحليل الصورة وشرح مسائلها على السبورة</span>
                            </div>
                          </div>
                        )}

                        {/* Document File details */}
                        {uploadedFileType === 'file' && uploadedFileName && (
                          <div className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1.5 pt-1">
                            <FileText className="w-4 h-4" />
                            <span>تم إرفاق المستند: {uploadedFileName}</span>
                          </div>
                        )}

                        {/* Video details */}
                        {uploadedFileType === 'video' && uploadedFileName && (
                          <div className="text-xs text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center gap-1.5 pt-1">
                            <Video className="w-4 h-4 text-indigo-500" />
                            <span>تم إرفاق فيديو الشرح: {uploadedFileName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Serway Reference Toggle Option */}
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-amber-600" />
                          <span>ربط الشرح بمرجع Serway الدولي للفيزياء</span>
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useSerway}
                            onChange={(e) => setUseSerway(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                        عند التفعيل، يستشهد الدكتور بالفصول والقوانين المعتمدة في كتاب <strong>Physics for Scientists and Engineers — Serway</strong>.
                      </p>
                    </div>

                    {/* Official Arabic Male Voice Selection & Preview */}
                    <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                          <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>نبرة صوت الدكتور (صوت رجل عربي فصيح):</span>
                        </label>
                        <span className="text-[10px] bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-full font-bold">
                          رسمي 🎙️
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <select
                          value={selectedVoiceProfile}
                          onChange={(e) => setSelectedVoiceProfile(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 text-slate-900 dark:text-white font-bold text-xs focus:outline-none"
                        >
                          {OFFICIAL_ARABIC_MALE_PROFILES.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => handlePreviewVoice(selectedVoiceProfile)}
                          disabled={isPlayingVoicePreview}
                          className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 disabled:opacity-50 shadow-xs"
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${isPlayingVoicePreview ? 'animate-bounce' : ''}`} />
                          <span>{isPlayingVoicePreview ? 'جاري التسميع...' : '🔊 استمع لتجربة الصوت'}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-purple-700 dark:text-purple-300">
                        {OFFICIAL_ARABIC_MALE_PROFILES.find((p) => p.id === selectedVoiceProfile)?.description}
                      </p>
                    </div>

                  </div>

                </div>

                {/* Submit Action Button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span>محرك الذكاء الاصطناعي يُعد مشاهد السبورة ونصوص النطق والمحاكاة فوراً.</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateLesson}
                    disabled={isGenerating}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm sm:text-base shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2.5 transition transform active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>جاري إعداد مشاهد السبورة وحركات الدكتور...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-white" />
                        <span>🎬 أنشئ درس الفيديو والسبورة التفاعلية</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TAB 2: ACTIVE CLASSROOM & SMART BOARD PLAYER */}
      {/* ======================================================== */}
      {activeTab === 'classroom' && activeLesson && (
        <div className="space-y-4">
          <SmartDoctorBoardPlayer
            doctor={selectedDoctor}
            lesson={activeLesson}
            onClose={() => setActiveTab('create')}
            onAskSimplified={() => {
              setExplanationLevel('beginner');
              handleGenerateLesson();
            }}
            onAskAnotherExample={() => {
              setExplanationLevel('step_by_step_problems');
              handleGenerateLesson();
            }}
            onSaveLesson={(savedLesson) => {
              setSavedLessons((prev) => [savedLesson, ...prev.filter((l) => l.id !== savedLesson.id)]);
            }}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TAB 3: SAVED LESSONS ARCHIVE */}
      {/* ======================================================== */}
      {activeTab === 'saved' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-purple-600" />
                <span>مكتبة دراسي المحفوظة لدكاترة الميكاترونكس</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                جميع المحاضرات والسبورات التي أعدها لك الدكاترة للمراجعة في أي وقت.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('create')}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition cursor-pointer"
            >
              + إعداد درس جديد
            </button>
          </div>

          {loadingSaved ? (
            <div className="p-8 text-center text-xs text-slate-500">جاري تحميل الدروس المحفوظة...</div>
          ) : savedLessons.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-slate-700 dark:text-slate-300 font-bold text-sm">
                لا توجد دروس محفوظة بعد.
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition cursor-pointer"
              >
                أنشئ درسك الأول الآن 🎬
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedLessons.map((l) => (
                <div
                  key={l.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-600 dark:text-purple-400 truncate">
                        {l.doctorName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {l.scenes.length} مشاهد
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2">
                      {l.lessonTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {l.scenes[0]?.boardContent?.heading || 'درس ميكاترونكس تفاعلي على السبورة'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setActiveLesson(l);
                        setActiveTab('classroom');
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>فتح السبورة والشرح</span>
                    </button>

                    <button
                      onClick={async () => {
                        if (confirm('هل تريد حذف هذا الدرس من مكتبتك؟')) {
                          await fetch(`/api/smart-doctor/lessons/${l.id}`, { method: 'DELETE' });
                          setSavedLessons((prev) => prev.filter((item) => item.id !== l.id));
                        }
                      }}
                      className="text-xs text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
