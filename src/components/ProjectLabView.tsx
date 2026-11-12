import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench,
  Sparkles,
  Cpu,
  Bot,
  Plane,
  Navigation,
  Home,
  Thermometer,
  Zap,
  Cog,
  TrafficCone,
  Car,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Download,
  Info,
  Maximize2,
  Printer,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Layers,
  Sliders,
  Eye,
  FileCode2,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  EngineeringProjectData,
  ProjectComponentItem,
  ProjectGalleryImage,
  StudentProfile,
} from '../types';
import { Mechatronics3DLabCanvas } from './Mechatronics3DLabCanvas';
import { Mechatronics3DToolsBench } from './Mechatronics3DToolsBench';

interface ProjectLabViewProps {
  student: StudentProfile | null;
  onNavigateHome?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

interface PresetItem {
  id: string;
  templateKey: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  promptExample: string;
}

const DEFAULT_PRESET_ITEMS: PresetItem[] = [
  {
    id: 'preset-car',
    templateKey: 'arduino-obstacle-avoiding-car',
    title: '🚗 سيارة Arduino',
    category: 'arduino',
    icon: 'Car',
    description: 'سيارة روبوتية تتجنب العوائق بحساس Ultrasonic ودرايفر L298N وسيرفو',
    promptExample: 'أريد صناعة سيارة روبوت باستخدام Arduino تتجنب العوائق وتفحص المسار يميناً ويساراً',
  },
  {
    id: 'preset-arm',
    templateKey: 'robotic-arm-4dof',
    title: '🤖 ذراع روبوت',
    category: 'robotics',
    icon: 'Bot',
    description: 'ذراع آلية 4 محاور تحكم بمحركات سيرفو وعصا تحكم ثنائية Joystick',
    promptExample: 'أريد صناعة ذراع روبوت 4 محاور بالتحكم اليدوي عبر جويستيك وتغذية منفصلة',
  },
  {
    id: 'preset-drone',
    templateKey: 'educational-quadcopter-drone',
    title: '🚁 مشروع Drone تعليمي',
    category: 'drone',
    icon: 'Plane',
    description: 'طائرة درون كوادكوبتر تعليمية مع محركات BLDC ومتحكمات ESC وخوارزمية PID',
    promptExample: 'أريد مشروع طائرة درون تعليمية مع شرح اتزان الطيران ومتحكم PID والحساسات',
  },
  {
    id: 'preset-line',
    templateKey: 'line-follower-robot',
    title: '🛞 روبوت متتبع الخط',
    category: 'robotics',
    icon: 'Navigation',
    description: 'روبوت تتبع مسار عالي الدقة بمصفوفة حساسات IR وخوارزمية تحكم تفاضلية',
    promptExample: 'أريد تصميم روبوت يتتبع الخط الأسود باستخدام مصفوفة حساسات الأشعة تحت الحمراء',
  },
  {
    id: 'preset-home',
    templateKey: 'smart-home-automation',
    title: '🏠 منزل ذكي',
    category: 'iot',
    icon: 'Home',
    description: 'نظام أتمتة منزلية مع إنذار تسريب الغاز، وحساس حركة، وتحكم بالمرحلات',
    promptExample: 'أريد مشروع نظام منزل ذكي متكامل للكشف عن الغاز والحريق والتحكم بالإضاءة آلياً',
  },
  {
    id: 'preset-traffic',
    templateKey: 'smart-traffic-light',
    title: '🚦 إشارة مرور ذكية',
    category: 'automation',
    icon: 'TrafficCone',
    description: 'إشارات مرور متكيفة مع كثافة السير وأولوية لمركبات الإسعاف والطوارئ',
    promptExample: 'أريد مشروع إشارة مرور ذكية تغير زمن الإشارات بناءً على كثافة السيارات وحساسات المسافة',
  },
  {
    id: 'preset-temp',
    templateKey: 'temperature-cooling-system',
    title: '🌡️ نظام قياس الحرارة',
    category: 'control',
    icon: 'Thermometer',
    description: 'نظام تكييف وتبريد تلقائي مع حساس DHT22 وشاشة LCD وتشغيل مروحة DC',
    promptExample: 'أريد نظام تحكم بدرجة الحرارة والرطوبة مع شاشة عرض وتشغيل مروحة تبريد تلقائياً',
  },
  {
    id: 'preset-motor',
    templateKey: 'motor-speed-direction-control',
    title: '⚙️ نظام تحكم بمحرك',
    category: 'mechatronics',
    icon: 'Cog',
    description: 'تحكم متقدم بسرعة وعزم دوران محركات التيار المستمر عبر PWM ومحددات سرعة',
    promptExample: 'أريد مشروع للتحكم بسرعة واتجاه دوران محرك DC باستخدام PWM ومقاومة متغيرة ودرايفر',
  },
  {
    id: 'preset-circuit',
    templateKey: 'electronic-circuits-project',
    title: '🔌 مشروع دوائر إلكترونية',
    category: 'circuits',
    icon: 'Zap',
    description: 'دائرة مذبذب نبضي متعدد الاستقرار بالمؤقت 555 ومولد ترددات وفلترة إشارات',
    promptExample: 'أريد تصميم دائرة إلكترونية تعليمية متكاملة باستخدام المؤقت 555 ومكثفات الشحن والتفريغ',
  },
  {
    id: 'preset-custom',
    templateKey: 'custom',
    title: '➕ مشروع مخصص',
    category: 'custom',
    icon: 'Wrench',
    description: 'صمم أي مشروع هندسي حسب فكرتك الخاصة (Sensors, PLC, Automation, ESP32, Hydraulics)',
    promptExample: 'أريد تصميم نظام ري ذكي باستخدام ESP32 وحساس رطوبة التربة ومضخة مياه ومفتاح مرحل Relay',
  },
];

export const ProjectLabView: React.FC<ProjectLabViewProps> = ({
  student,
  onNavigateHome,
  onNavigateToTab,
}) => {
  // Preset buttons
  const [presets, setPresets] = useState<PresetItem[]>(DEFAULT_PRESET_ITEMS);
  const [promptText, setPromptText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('arduino');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('جاري معالجة المتطلبات الهندسية...');
  
  // Toast notification system
  const [toastNotification, setToastNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastNotification({ message, type });
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };
  
  // Current active engineering project
  const [currentProject, setCurrentProject] = useState<EngineeringProjectData | null>(null);
  const [selectedPhase2ImageIdx, setSelectedPhase2ImageIdx] = useState<number>(0);

  // Active phase (1 to 13)
  const [activePhase, setActivePhase] = useState<number>(1);

  // Interactive step-by-step index (Phase 6 & 7)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Component details modal
  const [inspectingComponent, setInspectingComponent] = useState<ProjectComponentItem | null>(null);

  // 8 Educational drawings gallery modal
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  // Copy code feedback
  const [isCodeCopied, setIsCodeCopied] = useState(false);

  // Modification prompt
  const [modificationInput, setModificationInput] = useState('');
  const [isModifying, setIsModifying] = useState(false);

  // Compatibility report
  const [compatibilityStatus, setCompatibilityStatus] = useState<{
    isHarmonized: boolean;
    checkedPinsCount: number;
    warnings: string[];
  } | null>(null);

  // Simulation State
  const [simRunning, setSimRunning] = useState(true);
  // Car Sim
  const [obstacleDistance, setObstacleDistance] = useState<number>(45);
  const [servoAngle, setServoAngle] = useState<number>(0); // -60 left, 0 center, +60 right
  // Arm Sim
  const [armBase, setArmBase] = useState<number>(90);
  const [armShoulder, setArmShoulder] = useState<number>(90);
  const [armElbow, setArmElbow] = useState<number>(90);
  const [armGrip, setArmGrip] = useState<number>(40);
  // Drone Sim
  const [droneThrottle, setDroneThrottle] = useState<number>(50);
  const [dronePitch, setDronePitch] = useState<number>(0);
  const [droneRoll, setDroneRoll] = useState<number>(0);
  const [droneYaw, setDroneYaw] = useState<number>(0);
  // Temperature Sim
  const [simTemp, setSimTemp] = useState<number>(29.5);
  // Traffic Sim
  const [trafficAIntensity, setTrafficAIntensity] = useState<number>(3);
  const [trafficBIntensity, setTrafficBIntensity] = useState<number>(1);
  const [isAmbulanceActive, setIsAmbulanceActive] = useState<boolean>(false);
  // Line Follower Sim
  const [lineLeftDetect, setLineLeftDetect] = useState<boolean>(true);
  const [lineRightDetect, setLineRightDetect] = useState<boolean>(true);

  // Simulation Environment Mode Switcher (Hardware vs Digital vs Analog Signals vs 3D Tools Bench)
  const [simEnvironmentMode, setSimEnvironmentMode] = useState<'hardware' | 'digital' | 'analog' | 'tools'>('hardware');
  const [signalFreq, setSignalFreq] = useState<number>(50); // 50 Hz
  const [pwmDutyCycle, setPwmDutyCycle] = useState<number>(65); // 65% PWM
  const [analogNoiseLevel, setAnalogNoiseLevel] = useState<number>(5); // 5% noise
  const [selectedBaudRate, setSelectedBaudRate] = useState<number>(9600);
  const [serialPackets, setSerialPackets] = useState<Array<{ time: string; text: string; type: 'tx' | 'rx' }>>([
    { time: '00:01.02', text: '[SYSTEM_INIT] ATmega328P Core Boot @ 16MHz', type: 'rx' },
    { time: '00:01.45', text: '[PIN_INIT] D9 PWM Duty=65% | D10 Servo 50Hz | D12 Trig Pulse', type: 'rx' },
    { time: '00:02.10', text: '[ADC_SENSE] A0 = 612 (3.0V) | A1 = 205 (1.0V) | VCC = 4.98V', type: 'rx' },
    { time: '00:02.85', text: '[TELEMETRY] Sensor HC-SR04 Echo = 265µs -> Dist = 45cm', type: 'rx' },
  ]);
  const [customSerialTx, setCustomSerialTx] = useState<string>('');

  const handleSendSerialCommand = () => {
    if (!customSerialTx.trim()) return;
    const now = new Date().toLocaleTimeString('ar-SA');
    const cmd = customSerialTx.trim();
    setSerialPackets((prev) => [
      ...prev,
      { time: now, text: `> ${cmd}`, type: 'tx' },
      { time: now, text: `[ACK] Executed command: "${cmd}" -> Status 200 OK`, type: 'rx' },
    ]);
    setCustomSerialTx('');
  };

  // Fetch presets and load default car project on initial mount
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const res = await fetch('/api/lab/presets');
        if (res.ok) {
          const data = await res.json();
          if (data.presets && data.presets.length > 0) {
            setPresets(data.presets);
          }
        }
      } catch (err) {
        console.warn('Failed to load presets, using defaults:', err);
      }
    };

    const loadDefaultProject = async () => {
      setIsLoading(true);
      setLoadingStepText('جاري تحميل بيئة مختبر المشاريع الهندسية...');
      try {
        const res = await fetch('/api/lab/project/arduino-obstacle-avoiding-car');
        if (res.ok) {
          const data = await res.json();
          if (data.project) {
            setCurrentProject(data.project);
            verifyPins(data.project);
          }
        }
      } catch (err) {
        console.warn('Failed to load default project:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPresets();
    loadDefaultProject();
  }, []);

  // Verify pin compatibility
  const verifyPins = (project: EngineeringProjectData) => {
    const codeText = project.code?.sourceCode || '';
    const pinDeclarations: Record<string, string> = {};

    const defineRegex = /#define\s+([A-Za-z0-9_]+)\s+([A-Za-z0-9_]+)/g;
    let match;
    while ((match = defineRegex.exec(codeText)) !== null) {
      const name = match[1];
      const val = match[2];
      if (/^[A-D]?[0-9]+$/i.test(val)) {
        pinDeclarations[name] = val.toUpperCase().startsWith('D') ? val.toUpperCase() : `D${val}`;
      }
    }

    const warnings: string[] = [];
    let isHarmonized = true;

    for (const pm of project.pinMapping || []) {
      const codePin = pinDeclarations[pm.codeIdentifier];
      if (codePin && codePin.toUpperCase() !== pm.boardPin.toUpperCase()) {
        isHarmonized = false;
        warnings.push(`تعارض في (${pm.componentName}): الكود يعرّف ${pm.codeIdentifier} بالطرف ${codePin} بينما المخطط يستخدم ${pm.boardPin}`);
      }
    }

    setCompatibilityStatus({
      isHarmonized,
      checkedPinsCount: project.pinMapping?.length || 0,
      warnings,
    });
  };

  // Handle Preset Click
  const handleSelectPreset = async (preset: PresetItem) => {
    if (preset.templateKey === 'custom') {
      setPromptText('');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);
    setLoadingStepText(`جاري تهيئة نموذج مشروع: ${preset.title}...`);
    try {
      const res = await fetch(`/api/lab/project/${preset.templateKey}`);
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          setCurrentProject(data.project);
          verifyPins(data.project);
          setActivePhase(1);
          setCurrentStepIndex(0);
          setPromptText(preset.promptExample);
          setSelectedCategory(preset.category);
        }
      } else {
        // Fallback to generate endpoint
        handleGenerateProject(preset.promptExample, preset.category);
      }
    } catch (err) {
      console.warn('Failed to load preset template:', err);
      handleGenerateProject(preset.promptExample, preset.category);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate with Gemini / Backend
  const handleGenerateProject = async (textToUse?: string, categoryToUse?: string) => {
    const finalPrompt = textToUse || promptText;
    if (!finalPrompt.trim()) {
      showToast('يرجى كتابة فكرة المشروع أو اختياره من القائمة الجاهزة.', 'info');
      return;
    }

    setIsLoading(true);
    setLoadingStepText('1/3 فحص المتطلبات الهندسية وبناء قائمة المكونات...');

    const timer1 = setTimeout(() => {
      setLoadingStepText('2/3 رسم مخطط التوصيلات والتوافق الصارم للأرجل (Pin Alignment)...');
    }, 1800);

    const timer2 = setTimeout(() => {
      setLoadingStepText('3/3 إعداد كود الأردوينو ومحاكاة المشروع ورسم المخططات الهندسية...');
    }, 3800);

    try {
      const res = await fetch('/api/lab/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt.trim(),
          category: categoryToUse || selectedCategory,
          isModification: false,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          setCurrentProject(data.project);
          verifyPins(data.project);
          setActivePhase(1);
          setCurrentStepIndex(0);
          showToast('تم بناء وتوليد المشروع الهندسي المتكامل بنجاح 🚀', 'success');
        }
      } else {
        showToast('تعذر إنشاء المشروع بالذكاء الاصطناعي، يرجى المحاولة مرة أخرى.', 'error');
      }
    } catch (err) {
      console.error('Error generating project:', err);
      showToast('حدث خطأ أثناء الاتصال بالخادم، يرجى إعادة المحاولة.', 'error');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsLoading(false);
    }
  };

  // Modify existing project with AI
  const handleModifyProject = async () => {
    if (!modificationInput.trim() || !currentProject) return;

    setIsModifying(true);
    try {
      const res = await fetch('/api/lab/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: modificationInput.trim(),
          category: currentProject.category,
          isModification: true,
          existingProject: currentProject,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          setCurrentProject(data.project);
          verifyPins(data.project);
          setModificationInput('');
          showToast('تم تحديث وتطوير المشروع وتوافق الأرجل بنجاح بناءً على طلبك! ✨', 'success');
        }
      }
    } catch (err) {
      console.error('Failed to modify project:', err);
      showToast('تعذر تحديث المشروع، يرجى المحاولة مرة أخرى.', 'error');
    } finally {
      setIsModifying(false);
    }
  };

  // Copy Arduino Code
  const handleCopyCode = () => {
    if (!currentProject?.code?.sourceCode) return;
    navigator.clipboard.writeText(currentProject.code.sourceCode);
    setIsCodeCopied(true);
    setTimeout(() => setIsCodeCopied(false), 2000);
  };

  // Download .ino file
  const handleDownloadIno = () => {
    if (!currentProject?.code?.sourceCode) return;
    const blob = new Blob([currentProject.code.sourceCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentProject.code.filename || 'Project.ino';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // The 13 Phases metadata
  const PHASES = [
    { id: 1, title: 'فكرة المشروع', icon: Sparkles, short: 'الفكرة' },
    { id: 2, title: 'صورة المشروع النهائي', icon: Eye, short: 'الشكل العام' },
    { id: 3, title: 'المكونات المطلوبة', icon: Layers, short: 'المكونات' },
    { id: 4, title: 'وظيفة كل مكوّن', icon: Info, short: 'وظائف القطع' },
    { id: 5, title: 'مخطط التوصيل', icon: Zap, short: 'المخطط' },
    { id: 6, title: 'خطوات التركيب', icon: Wrench, short: 'التركيب' },
    { id: 7, title: 'رسومات الخطوات', icon: Maximize2, short: 'رسومات التركيب' },
    { id: 8, title: 'البرمجة والكود', icon: FileCode2, short: 'الكود' },
    { id: 9, title: 'شرح الكود', icon: BookOpen, short: 'شرح الكود' },
    { id: 10, title: 'الاختبار والمعايرة', icon: CheckCircle2, short: 'الاختبار' },
    { id: 11, title: 'الأخطاء المحتملة', icon: AlertTriangle, short: 'الأخطاء والحلول' },
    { id: 12, title: 'تحسين وتطوير', icon: RefreshCw, short: 'التطوير' },
    { id: 13, title: 'النتيجة والمراجع', icon: ShieldCheck, short: 'النتيجة والمراجع' },
  ];

  return (
    <div className="space-y-6 pb-20 animate-fade-in" dir="rtl">
      
      {/* 1. Header & Title Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 border-2 border-blue-500/40 p-6 sm:p-8 text-white shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-bold text-cyan-300">
              <Wrench className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
              <span>مختبر المشاريع الهندسية التفاعلي الذكي - أكاديمية الميكاترونكس اليمنية</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>🔧 مختبر المشاريع الهندسية الذكي</span>
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              صمم، ركّب، وبرمج أي مشروع ميكاترونكس وهندسة تطبيقية بالذكاء الاصطناعي مع <strong>مخططات توصيل معتمدة، كود Arduino متناغم 100% بدون أي تعارض في الأرجل، خطوات تركيب تفاعلية، محاكاة برمجية، ورسومات تعليمية هندسية واضحة!</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {currentProject?.galleryImages && (
              <button
                onClick={() => {
                  setActiveGalleryIndex(0);
                  setIsGalleryOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
              >
                <Eye className="w-4 h-4 text-cyan-200" />
                <span>معرض الرسومات الهندسية (8 صور)</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              title="طباعة تقرير المشروع"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">طباعة / PDF</span>
            </button>
          </div>
        </div>

        {/* Compatibility Assurance Banner */}
        {compatibilityStatus && (
          <div className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">
              فحص التوافق الهندسي: تم مطابقة {compatibilityStatus.checkedPinsCount} طرفاً بنجاح، والكود البرمجي ومخطط الأسلاك متطابقان بنسبة 100% دون أي تعارض.
            </span>
          </div>
        )}
      </div>

      {/* 2. "ماذا تريد أن تصنع؟" - Input & Ready-Made Project Buttons */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>ماذا تريد أن تصنع؟</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
              مولد المشاريع بالذكاء الاصطناعي
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            اكتب فكرة مشروعك بحرية أو اختر من المشاريع الجاهزة والموثقة أدناه للبدء فوراً:
          </p>
        </div>

        {/* Input Box & Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateProject()}
              placeholder="مثال: أريد صناعة سيارة روبوت باستخدام Arduino تتجنب العوائق"
              className="w-full h-13 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:outline-hidden text-sm font-medium text-slate-900 dark:text-slate-100 transition-colors shadow-inner"
            />
          </div>

          <button
            onClick={() => handleGenerateProject()}
            disabled={isLoading}
            className="px-6 py-3 h-13 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105 shrink-0"
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-300" />
            )}
            <span>{isLoading ? 'جاري البناء الهندسي...' : 'ابدأ بناء المشروع 🚀'}</span>
          </button>
        </div>

        {/* Ready-Made Project Buttons (As requested by user) */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
            المشاريع الجاهزة والمعتمدة:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {presets.map((pr) => {
              const isCurrent = currentProject && currentProject.title.toLowerCase().includes(pr.title.slice(2).trim().toLowerCase());
              return (
                <button
                  key={pr.id}
                  onClick={() => handleSelectPreset(pr)}
                  className={`p-3 rounded-2xl text-right border transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-xs group hover:scale-[1.02] ${
                    isCurrent
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="font-extrabold text-xs sm:text-sm flex items-center justify-between">
                    <span>{pr.title}</span>
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {pr.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading Progress State */}
        {isLoading && (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center space-y-2 animate-pulse">
            <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin mx-auto" />
            <p className="text-xs sm:text-sm font-bold text-blue-800 dark:text-blue-300">
              {loadingStepText}
            </p>
          </div>
        )}
      </div>

      {/* 3. The 13 Interactive Phases Navigation Bar */}
      {currentProject && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                مراحل المشروع التفاعلية (13 مرحلة متكاملة):
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">
              المرحلة {activePhase} من 13
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {PHASES.map((ph) => {
              const Icon = ph.icon;
              const isActive = activePhase === ph.id;
              return (
                <button
                  key={ph.id}
                  onClick={() => setActivePhase(ph.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                    {ph.id}
                  </span>
                  <span>{ph.short}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Active Phase Content Views */}
      {currentProject && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          
          {/* Phase 1: فكرة المشروع */}
          {activePhase === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    المرحلة 1: فكرة المشروع والأهداف الهندسية
                  </h3>
                  <span className="text-xs text-slate-500">مواصفات النظام والغرض التعليمي والتطبيقي</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-3">
                <h4 className="font-extrabold text-base text-blue-950 dark:text-blue-200">
                  {currentProject.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {currentProject.idea}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
                    🎯 الفئة المستهدفة: {currentProject.targetAudience}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-800">
                    ⚙️ المجال: {currentProject.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">تابع المراحل بالتسلسل الهندسي</span>
                <button
                  onClick={() => setActivePhase(2)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                >
                  <span>المرحلة التالية: صورة المشروع النهائي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Phase 2: صورة المشروع النهائي */}
          {activePhase === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      المرحلة 2: صورة وتصميم المشروع النهائي
                    </h3>
                    <span className="text-xs text-slate-500">رسم توضيحي تفصيلي للمجسم والنموذج المكتمل</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveGalleryIndex(selectedPhase2ImageIdx);
                    setIsGalleryOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>تكبير الرسمة الحالية</span>
                </button>
              </div>

              {/* 8 Specialized Educational Drawings Selector Bar */}
              {currentProject.galleryImages && currentProject.galleryImages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-500" />
                      <span>رسومات المشروع الهندسية الثمانية (اختر الرسمة للعرض):</span>
                    </span>
                    <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold">
                      رسمة {selectedPhase2ImageIdx + 1} من {currentProject.galleryImages.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {currentProject.galleryImages.map((img, gIdx) => (
                      <button
                        key={img.id || gIdx}
                        onClick={() => setSelectedPhase2ImageIdx(gIdx)}
                        className={`p-2.5 rounded-xl text-right border text-xs transition-all cursor-pointer ${
                          selectedPhase2ImageIdx === gIdx
                            ? 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-500 text-cyan-950 dark:text-cyan-100 font-black shadow-xs ring-1 ring-cyan-500'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="font-bold truncate text-[11px] sm:text-xs">
                          صورة {img.imageNumber}: {img.title.replace(/^الصورة\s*\d+:\s*/, '')}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {img.subtitle}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Render Active Project SVG / Image */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-950 p-2 space-y-2">
                {currentProject.galleryImages && currentProject.galleryImages[selectedPhase2ImageIdx]?.svgContent ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: currentProject.galleryImages[selectedPhase2ImageIdx].svgContent }}
                    className="w-full h-auto"
                  />
                ) : currentProject.galleryImages && currentProject.galleryImages[0]?.svgContent ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: currentProject.galleryImages[0].svgContent }}
                    className="w-full h-auto"
                  />
                ) : currentProject.finalProjectImage ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: currentProject.finalProjectImage }}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    رسم توضيحي للنموذج النهائي
                  </div>
                )}
              </div>

              {/* Drawing Title & Engineering Annotation */}
              {currentProject.galleryImages && currentProject.galleryImages[selectedPhase2ImageIdx] && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-1">
                  <div className="font-black text-xs sm:text-sm text-cyan-900 dark:text-cyan-200 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{currentProject.galleryImages[selectedPhase2ImageIdx].title} — {currentProject.galleryImages[selectedPhase2ImageIdx].subtitle}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentProject.galleryImages[selectedPhase2ImageIdx].description}
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 leading-relaxed">
                💡 <strong>الملاحظة الهندسية:</strong> يُظهر هذا المخطط وضعية تثبيت الأجزاء وتوازن مركز الثقل وتوزيع الشاسيه والمشغلات والحساسات لضمان التشغيل المستقر.
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActivePhase(1)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>
                <button
                  onClick={() => setActivePhase(3)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>المرحلة التالية: المكونات المطلوبة</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Phase 3 & 4: المكونات المطلوبة ووظيفة كل مكون */}
          {(activePhase === 3 || activePhase === 4) && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    {activePhase}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {activePhase === 3 ? 'المرحلة 3: جدول المكونات المطلوبة (Bill of Materials)' : 'المرحلة 4: وظيفة كل مكوّن ومبدأ عمله'}
                    </h3>
                    <span className="text-xs text-slate-500">اضغط على أي مكون لعرض بطاقة تفاصيله الهندسية الكاملة</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveGalleryIndex(1);
                    setIsGalleryOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>رسم المكونات منفصلة (BOM)</span>
                </button>
              </div>

              {/* Components Table (As requested: المكون | العدد | الاستخدام | التفاصيل) */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-right border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3.5">#</th>
                      <th className="p-3.5">المكوّن</th>
                      <th className="p-3.5 text-center">العدد</th>
                      <th className="p-3.5">الاستخدام في المشروع</th>
                      <th className="p-3.5 text-center">التفاصيل الهندسية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {currentProject.components.map((comp, idx) => (
                      <tr
                        key={comp.id || idx}
                        onClick={() => setInspectingComponent(comp)}
                        className="hover:bg-blue-50/70 dark:hover:bg-blue-950/40 cursor-pointer transition-colors"
                      >
                        <td className="p-3.5 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>{comp.name}</span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-slate-800 dark:text-slate-200">
                            {comp.count}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          {comp.usage}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingComponent(comp);
                            }}
                            className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 hover:bg-blue-200 text-blue-700 dark:text-blue-300 font-bold text-xs transition-colors cursor-pointer"
                          >
                            عرض التفاصيل 🔍
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActivePhase(activePhase - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>
                <button
                  onClick={() => setActivePhase(5)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>المرحلة التالية: مخطط التوصيل</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Phase 5: مخطط التوصيل */}
          {activePhase === 5 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      المرحلة 5: مخطط التوصيل والأسلاك (Wiring Diagram)
                    </h3>
                    <span className="text-xs text-slate-500">مبني بدقة على أطراف 5V و GND و Digital و Analog و PWM و VIN</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveGalleryIndex(6);
                    setIsGalleryOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>تكبير المخطط</span>
                </button>
              </div>

              {/* Render Circuit Wiring Diagram SVG */}
              {currentProject.wiringDiagramSvg && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-950 p-2">
                  <div
                    dangerouslySetInnerHTML={{ __html: currentProject.wiringDiagramSvg }}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Connections List Breakdown */}
              <div className="space-y-3 pt-2">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>جدول تفصيل الأسلاك والألوان:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {currentProject.connections.map((conn, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              conn.wireColor === 'red' ? '#ef4444' :
                              conn.wireColor === 'black' ? '#0f172a' :
                              conn.wireColor === 'blue' ? '#3b82f6' :
                              conn.wireColor === 'yellow' ? '#eab308' :
                              conn.wireColor === 'green' ? '#10b981' :
                              conn.wireColor === 'orange' ? '#f97316' : '#a855f7',
                          }}
                        />
                        <span>{conn.fromComponent} ({conn.fromPin})</span>
                        <span className="text-slate-400">←</span>
                        <span>{conn.toComponent} ({conn.toPin})</span>
                      </div>

                      <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-[10px]">
                        {conn.signalType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActivePhase(4)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>
                <button
                  onClick={() => setActivePhase(6)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>المرحلة التالية: خطوات التركيب التفاعلية</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Phase 6 & 7: خطوات التركيب التفاعلية ورسومات كل خطوة */}
          {(activePhase === 6 || activePhase === 7) && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    6
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      المرحلة 6 و 7: خطوات التركيب التفاعلية خطوة بخطوة
                    </h3>
                    <span className="text-xs text-slate-500">
                      الانتقال التفاعلي خطوة بخطوة مع الصورة التوضيحية والتوصيلات وملاحظات الأمان
                    </span>
                  </div>
                </div>

                <div className="text-xs font-black px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  الخطوة {currentStepIndex + 1} من {currentProject.steps.length}
                </div>
              </div>

              {/* Step Carousel Viewer */}
              {currentProject.steps[currentStepIndex] && (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-purple-500/40 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                      {currentProject.steps[currentStepIndex].stepNumber}
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {currentProject.steps[currentStepIndex].title}
                    </h4>
                  </div>

                  {/* Step Illustration SVG */}
                  {currentProject.steps[currentStepIndex].illustrationSvg && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 p-2 shadow-inner">
                      <div
                        dangerouslySetInnerHTML={{ __html: currentProject.steps[currentStepIndex].illustrationSvg! }}
                        className="w-full h-auto"
                      />
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    {currentProject.steps[currentStepIndex].description}
                  </p>

                  {/* Components used in this step */}
                  {currentProject.steps[currentStepIndex].usedComponents && currentProject.steps[currentStepIndex].usedComponents.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-slate-500 dark:text-slate-400">المكونات في هذه الخطوة:</span>
                      {currentProject.steps[currentStepIndex].usedComponents.map((compName, cIdx) => (
                        <span key={cIdx} className="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                          {compName}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Connections summary */}
                  {currentProject.steps[currentStepIndex].connectionsSummary && (
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 font-medium">
                      🔌 <strong>التوصيلات المطلوبة:</strong> {currentProject.steps[currentStepIndex].connectionsSummary}
                    </div>
                  )}

                  {/* Caution / Important Notes */}
                  {currentProject.steps[currentStepIndex].cautionNotice && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{currentProject.steps[currentStepIndex].cautionNotice}</span>
                    </div>
                  )}

                  {/* Step Next / Prev Navigation */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                      disabled={currentStepIndex === 0}
                      className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span>السابق</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {currentProject.steps.map((_, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => setCurrentStepIndex(sIdx)}
                          className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                            currentStepIndex === sIdx ? 'bg-purple-600 w-6' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentStepIndex(Math.min(currentProject.steps.length - 1, currentStepIndex + 1))}
                      disabled={currentStepIndex === currentProject.steps.length - 1}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>التالي</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActivePhase(5)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>
                <button
                  onClick={() => setActivePhase(8)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>المرحلة التالية: البرمجة وكود Arduino</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Phase 8 & 9: البرمجة وكود Arduino وشرح الكود */}
          {(activePhase === 8 || activePhase === 9) && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    8
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      المرحلة 8 و 9: كود Arduino الكامل وشرحه الهندسي
                    </h3>
                    <span className="text-xs text-slate-500">متوافق 100% مع الأرجل والمخطط - جاهز للرفع المباشر</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    {isCodeCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{isCodeCopied ? 'تم النسخ!' : 'نسخ الكود'}</span>
                  </button>

                  <button
                    onClick={handleDownloadIno}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل .ino</span>
                  </button>
                </div>
              </div>

              {/* Pin Mapping Summary Table */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>جدول تعيين الأرجل في الكود والمخطط (Pin Mapping):</span>
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {currentProject.pinMapping.map((pm, pIdx) => (
                    <div key={pIdx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block line-clamp-1">{pm.componentName}</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-black text-blue-600 dark:text-blue-400">{pm.boardPin}</span>
                        <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-600 dark:text-slate-300">
                          {pm.codeIdentifier}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Box with Syntax Styling */}
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#0d1117] text-slate-100 shadow-xl" dir="ltr">
                <div className="px-4 py-2.5 bg-[#161b22] border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>{currentProject.code.filename || 'Project.ino'}</span>
                  <span>Arduino C/C++</span>
                </div>
                <pre className="p-5 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed select-all text-emerald-400">
                  <code>{currentProject.code.sourceCode}</code>
                </pre>
              </div>

              {/* Line by line explanation */}
              <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-3">
                <h4 className="font-extrabold text-sm text-blue-900 dark:text-blue-200 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>الشرح البرمجي والمنطقي:</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {currentProject.code.explanation}
                </p>

                {currentProject.code.lineByLineNotes && currentProject.code.lineByLineNotes.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-blue-200/60 dark:border-blue-800/60">
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-300 block">تفصيل الأسطر المهمة:</span>
                    {currentProject.code.lineByLineNotes.map((note, nIdx) => (
                      <div key={nIdx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 shrink-0">{note.lineRange}:</span>
                        <span>{note.explanation}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload steps */}
                {currentProject.code.uploadSteps && currentProject.code.uploadSteps.length > 0 && (
                  <div className="pt-2 border-t border-blue-200/60 dark:border-blue-800/60 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-blue-800 dark:text-blue-300 block mb-1">خطوات رفع الكود في Arduino IDE:</span>
                    <ol className="list-decimal list-inside space-y-1">
                      {currentProject.code.uploadSteps.map((st, sIdx) => (
                        <li key={sIdx}>{st}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActivePhase(6)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>
                <button
                  onClick={() => setActivePhase(10)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>المرحلة التالية: الاختبار والمعايرة والمحاكاة</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Phase 10: الاختبار والمعايرة والمحاكاة التفاعلية (Simulation Mode) */}
          {activePhase === 10 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    10
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      المرحلة 10: الاختبار الميداني ومحاكاة المشروع التفاعلية
                    </h3>
                    <span className="text-xs text-slate-500">جرب تشغيل الحساسات والمحركات ورؤية رد الفعل البرمجي مباشرة</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSimRunning(!simRunning)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      simRunning
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {simRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{simRunning ? 'إيقاف المحاكاة مؤقتاً' : 'تشغيل المحاكاة'}</span>
                  </button>
                </div>
              </div>

              {/* DYNAMIC INTERACTIVE SIMULATOR (Section 9 & 11) */}
              <div className="p-6 rounded-3xl bg-slate-950 text-white border-2 border-emerald-500/40 space-y-6 shadow-2xl">
                {/* Header & Simulation Environment Mode Switcher */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-black text-lg text-emerald-300">
                        محاكي المشروع والتجارب العملية (Practical Engineering Simulation Sandbox)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      اختر بيئة اختبار الإشارات والأجهزة لمعاينة السلوك البرمجي والكهربائي في الوقت الفعلي
                    </p>
                  </div>

                  {/* ENVIRONMENT MODE SWITCHER TABS */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shrink-0">
                    <button
                      onClick={() => setSimEnvironmentMode('hardware')}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        simEnvironmentMode === 'hardware'
                          ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-400/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Bot className="w-4 h-4" />
                      <span>🚦 العتاد والنظام الميداني</span>
                    </button>

                    <button
                      onClick={() => setSimEnvironmentMode('digital')}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        simEnvironmentMode === 'digital'
                          ? 'bg-cyan-500 text-slate-950 shadow-md ring-2 ring-cyan-400/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileCode2 className="w-4 h-4" />
                      <span>💻 الإشارات الرقمية و Serial</span>
                    </button>

                    <button
                      onClick={() => setSimEnvironmentMode('analog')}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        simEnvironmentMode === 'analog'
                          ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>📉 الإشارات التماثلية والمخطط</span>
                    </button>

                    <button
                      onClick={() => setSimEnvironmentMode('tools')}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        simEnvironmentMode === 'tools'
                          ? 'bg-purple-500 text-slate-950 shadow-md ring-2 ring-purple-400/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Wrench className="w-4 h-4" />
                      <span>🔬 طاولة الأجهزة والقياس 3D</span>
                    </button>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* MODE 1: PHYSICAL HARDWARE & FIELD SYSTEM ENVIRONMENT */}
                {/* ======================================================== */}
                {simEnvironmentMode === 'hardware' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* INTERACTIVE 3D THREE.JS LAB CANVAS */}
                    <Mechatronics3DLabCanvas
                      project={currentProject}
                      simRunning={simRunning}
                      onToggleSim={() => setSimRunning(!simRunning)}
                      trafficAIntensity={trafficAIntensity}
                      trafficBIntensity={trafficBIntensity}
                      isAmbulanceActive={isAmbulanceActive}
                      droneThrottle={droneThrottle}
                      dronePitch={dronePitch}
                      droneRoll={droneRoll}
                      droneYaw={droneYaw}
                      armBase={armBase}
                      armShoulder={armShoulder}
                      armElbow={armElbow}
                      armGrip={armGrip}
                      simTemp={simTemp}
                      obstacleDistance={obstacleDistance}
                      servoAngle={servoAngle}
                    />

                    {/* 1. OBSTACLE CAR SIMULATOR */}
                    {currentProject.category === 'arduino' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Interactive Controls */}
                          <div className="space-y-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                              <span>مسافة العائق أمام الروبوت (HC-SR04):</span>
                              <span className={`font-mono font-black text-sm ${obstacleDistance < 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {obstacleDistance} سم
                              </span>
                            </label>
                            <input
                              type="range"
                              min="5"
                              max="150"
                              value={obstacleDistance}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setObstacleDistance(val);
                                if (val <= 25) {
                                  setServoAngle(45);
                                } else {
                                  setServoAngle(0);
                                }
                              }}
                              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />

                            <div className="flex items-center gap-2 pt-2 text-xs">
                              <button
                                onClick={() => {
                                  setObstacleDistance(15);
                                  setServoAngle(45);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 font-bold border border-rose-500/30 cursor-pointer"
                              >
                                ⚠️ محاكاة عائق مفاجئ (15 سم)
                              </button>
                              <button
                                onClick={() => {
                                  setObstacleDistance(80);
                                  setServoAngle(0);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-bold border border-emerald-500/30 cursor-pointer"
                              >
                                🛣️ طريق مفتوح (80 سم)
                              </button>
                            </div>
                          </div>

                          {/* Motor & Decision Telemetry */}
                          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                            <span className="font-bold text-slate-400 block">بيانات استجابة المتحكم ودرايفر المحركات L298N:</span>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80">
                              <span>حالة الروبوت:</span>
                              <span className={`font-black ${obstacleDistance <= 25 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {obstacleDistance <= 25 ? 'عائق مرصود! توقف وتفحص المسار والانعطاف' : 'تقدم للأمام (FORWARD)'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80">
                              <span>زاوية محرك السيرفو SG90:</span>
                              <span className="font-mono font-bold text-cyan-400">{servoAngle === 0 ? '0° (للأمام)' : `${servoAngle}° (يمين)`}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80">
                              <span>سرعة المحركين (PWM):</span>
                              <span className="font-mono font-bold text-indigo-300">
                                {obstacleDistance <= 25 ? 'L: 0 RPM | R: 180 RPM (دوران)' : 'L: 180 RPM | R: 180 RPM'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SMART TRAFFIC LIGHT SYSTEM WITH REAL HARDWARE VIDEO EMBED */}
                    {(currentProject.category === 'automation' || currentProject.title.includes('إشارة') || currentProject.title.includes('مرور')) && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                            <span className="font-bold text-xs text-amber-300 flex items-center gap-2">
                              <TrafficCone className="w-4 h-4 text-amber-400" />
                              <span>الموديل الميداني التفاعلي لإشارات المرور والمدينة الذكية (Smart Traffic Sandbox)</span>
                            </span>
                            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                              OLED Status: SMART CITY TRAFFIC - ACTIVE
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Real Hardware Video Embed */}
                            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-video relative shadow-lg">
                              <video
                                src="/public/assets/aistudio/_____________________________________________eocontrol_____________________________________244c080c.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-emerald-300 font-mono text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                <span>بث حقيقي للمدينة الذكية</span>
                              </div>
                            </div>

                            {/* Live Controls */}
                            <div className="space-y-3 text-xs">
                              <div className="p-3 rounded-xl bg-slate-800 space-y-1">
                                <label className="font-bold text-slate-300 block">كثافة سير المسار A:</label>
                                <input
                                  type="range"
                                  min="1"
                                  max="5"
                                  value={trafficAIntensity}
                                  onChange={(e) => setTrafficAIntensity(Number(e.target.value))}
                                  className="w-full h-1.5 bg-slate-700 rounded cursor-pointer accent-amber-500"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400">
                                  <span>منخفضة</span>
                                  <span className="font-mono text-amber-300 font-bold">{trafficAIntensity} سيارات/دقيقة</span>
                                  <span>مكتظة</span>
                                </div>
                              </div>

                              <button
                                onClick={() => setIsAmbulanceActive(!isAmbulanceActive)}
                                className={`w-full py-2.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                                  isAmbulanceActive
                                    ? 'bg-rose-600 text-white animate-pulse shadow-lg'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                }`}
                              >
                                🚑 <span>{isAmbulanceActive ? 'أولوية الإسعاف مفعلة (فتح المسار آلياً)' : 'محاكاة مرور سيارة إسعاف (Emergency Override)'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. DRONE SIMULATOR */}
                    {(currentProject.category === 'drone' || currentProject.title.includes('درون') || currentProject.title.includes('Drone')) && (
                      <div className="space-y-4">
                        <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800 text-xs text-blue-200">
                          🚁 <strong>محاكاة اتزان الطيران (PID Flight Stabilization):</strong> تحكم بمعدل الخنق Throttle وزوايا الميل Roll و Pitch لرؤية استجابة المحركات الأربعة عديمة المسفرات وحلقة الـ PID.
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                            <label className="text-[11px] font-bold text-slate-300 block">الرفع (Throttle): {droneThrottle}%</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={droneThrottle}
                              onChange={(e) => setDroneThrottle(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-700 rounded accent-blue-500 cursor-pointer"
                            />
                          </div>

                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                            <label className="text-[11px] font-bold text-slate-300 block">الميل الجانبي (Roll): {droneRoll}°</label>
                            <input
                              type="range"
                              min="-30"
                              max="30"
                              value={droneRoll}
                              onChange={(e) => setDroneRoll(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-700 rounded accent-cyan-500 cursor-pointer"
                            />
                          </div>

                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                            <label className="text-[11px] font-bold text-slate-300 block">الميل الطولي (Pitch): {dronePitch}°</label>
                            <input
                              type="range"
                              min="-30"
                              max="30"
                              value={dronePitch}
                              onChange={(e) => setDronePitch(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-700 rounded accent-indigo-500 cursor-pointer"
                            />
                          </div>

                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                            <label className="text-[11px] font-bold text-slate-300 block">الدوران (Yaw): {droneYaw}°</label>
                            <input
                              type="range"
                              min="-45"
                              max="45"
                              value={droneYaw}
                              onChange={(e) => setDroneYaw(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-700 rounded accent-purple-500 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* 4 BLDC Motors RPM Graphic */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                            <span className="text-slate-400 block text-[10px]">محرك 1 (أمامي أيسر CCW)</span>
                            <span className="font-mono font-black text-emerald-400 text-sm">
                              {Math.round(droneThrottle * 70 + dronePitch * 5 - droneRoll * 5)} RPM
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                            <span className="text-slate-400 block text-[10px]">محرك 2 (أمامي أيمن CW)</span>
                            <span className="font-mono font-black text-emerald-400 text-sm">
                              {Math.round(droneThrottle * 70 + dronePitch * 5 + droneRoll * 5)} RPM
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                            <span className="text-slate-400 block text-[10px]">محرك 3 (خلفي أيمن CCW)</span>
                            <span className="font-mono font-black text-emerald-400 text-sm">
                              {Math.round(droneThrottle * 70 - dronePitch * 5 + droneRoll * 5)} RPM
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                            <span className="text-slate-400 block text-[10px]">محرك 4 (خلفي أيسر CW)</span>
                            <span className="font-mono font-black text-emerald-400 text-sm">
                              {Math.round(droneThrottle * 70 - dronePitch * 5 - droneRoll * 5)} RPM
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. ROBOTIC ARM SIMULATOR */}
                    {(currentProject.category === 'robotics' && currentProject.title.includes('ذراع')) && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                            <label className="text-[11px] font-bold text-slate-300 block">القاعدة (Base): {armBase}°</label>
                            <input
                              type="range"
                              min="0"
                              max="180"
                              value={armBase}
                              onChange={(e) => setArmBase(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-700 rounded accent-blue-500 cursor-pointer"
                            />
                          </div>

                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                            <label className="text-[11px] font-bold text-slate-300 block">الكتف (Shoulder): {armShoulder}°</label>
                            <input
                              type="range"
                              min="30"
                              max="150"
                              value={armShoulder}
                              onChange={(e) => setArmShoulder(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-700 rounded accent-indigo-500 cursor-pointer"
                            />
                          </div>

                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                            <label className="text-[11px] font-bold text-slate-300 block">المرفق (Elbow): {armElbow}°</label>
                            <input
                              type="range"
                              min="20"
                              max="160"
                              value={armElbow}
                              onChange={(e) => setArmElbow(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-700 rounded accent-purple-500 cursor-pointer"
                            />
                          </div>

                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                            <label className="text-[11px] font-bold text-slate-300 block">المخلب (Gripper): {armGrip}°</label>
                            <input
                              type="range"
                              min="10"
                              max="85"
                              value={armGrip}
                              onChange={(e) => setArmGrip(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-700 rounded accent-amber-500 cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 text-xs">
                          <button
                            onClick={() => {
                              setArmBase(90);
                              setArmShoulder(90);
                              setArmElbow(90);
                              setArmGrip(40);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
                          >
                            وضع الاستعداد (Standby)
                          </button>
                          <button
                            onClick={() => {
                              setArmBase(45);
                              setArmShoulder(120);
                              setArmElbow(140);
                              setArmGrip(80);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 font-bold border border-blue-500/30 cursor-pointer"
                          >
                            التقاط جسم (Pick Object)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 4. TEMPERATURE SYSTEM SIMULATOR */}
                    {currentProject.category === 'control' && (
                      <div className="space-y-4">
                        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                            <span>محاكاة تغير درجة الحرارة (DHT22):</span>
                            <span className={`font-mono font-black text-sm ${simTemp >= 38 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {simTemp}°C
                            </span>
                          </label>
                          <input
                            type="range"
                            min="15"
                            max="55"
                            step="0.5"
                            value={simTemp}
                            onChange={(e) => setSimTemp(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded cursor-pointer accent-emerald-500"
                          />

                          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 text-xs">
                            <span>سرعة مروحة التبريد DC Fan:</span>
                            <span className="font-mono font-black text-cyan-400">
                              {simTemp < 26 ? '0% (متوقفة)' : `${Math.min(100, Math.round((simTemp - 26) * 7.5))}%`}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ======================================================== */}
                {/* MODE 2: DIGITAL SIGNALS & SERIAL TERMINAL ENVIRONMENT */}
                {/* ======================================================== */}
                {simEnvironmentMode === 'digital' && (
                  <div className="space-y-5 animate-fade-in">
                    {/* DIGITAL LOGIC OSCILLOSCOPE WAVEFORMS */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-xs text-cyan-300 flex items-center gap-2">
                          <FileCode2 className="w-4 h-4 text-cyan-400" />
                          <span>راسم الإشارات الرقمية (Digital Logic Analyzer & PWM Oscilloscope)</span>
                        </span>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                          <span>تردد الساعة: 16MHz</span>
                          <span className="text-cyan-400 font-bold">PWM Duty: {pwmDutyCycle}%</span>
                        </div>
                      </div>

                      {/* PWM Duty Cycle Interactive Control */}
                      <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                        <span className="font-bold text-slate-300 shrink-0">تحكم بعرض النبضة PWM (Pin D9):</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={pwmDutyCycle}
                          onChange={(e) => setPwmDutyCycle(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded cursor-pointer accent-cyan-400"
                        />
                        <span className="font-mono font-bold text-cyan-300 w-12 text-left">{pwmDutyCycle}%</span>
                      </div>

                      {/* SVG Digital Waveform Plotter */}
                      <div className="bg-black p-3 rounded-xl border border-slate-800 space-y-2 font-mono text-[10px]">
                        {/* Channel 1: PWM Motor Control */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-cyan-400">
                            <span>CH1 (Pin D9 - PWM Motor Speed)</span>
                            <span>{Math.round((pwmDutyCycle / 100) * 255)} / 255 (AnalogWrite)</span>
                          </div>
                          <svg className="w-full h-10 bg-slate-950 rounded border border-slate-900" viewBox="0 0 400 40">
                            <path
                              d={`M 0 32 L ${400 * (1 - pwmDutyCycle / 100) * 0.15} 32 L ${400 * (1 - pwmDutyCycle / 100) * 0.15} 8 L 60 8 L 60 32 L ${60 + 400 * (1 - pwmDutyCycle / 100) * 0.15} 32 L ${60 + 400 * (1 - pwmDutyCycle / 100) * 0.15} 8 L 120 8 L 120 32 L 180 32 L 180 8 L 240 8 L 240 32 L 300 32 L 300 8 L 360 8 L 360 32 L 400 32`}
                              fill="none"
                              stroke="#22d3ee"
                              strokeWidth="2"
                            />
                          </svg>
                        </div>

                        {/* Channel 2: Ultrasonic Trig Pulse */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-emerald-400">
                            <span>CH2 (Pin D12 - Ultrasonic Trig Pulse)</span>
                            <span>10µs High Burst @ 50Hz</span>
                          </div>
                          <svg className="w-full h-8 bg-slate-950 rounded border border-slate-900" viewBox="0 0 400 30">
                            <path
                              d="M 0 24 L 40 24 L 40 6 L 45 6 L 45 24 L 140 24 L 140 6 L 145 6 L 145 24 L 240 24 L 240 6 L 245 6 L 245 24 L 340 24 L 340 6 L 345 6 L 345 24 L 400 24"
                              fill="none"
                              stroke="#34d399"
                              strokeWidth="2"
                            />
                          </svg>
                        </div>

                        {/* Channel 3: Servo Motor Pulse */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-amber-400">
                            <span>CH3 (Pin D10 - Servo Control SG90)</span>
                            <span>{1.5 + (servoAngle / 90) * 0.5}ms High Pulse Width</span>
                          </div>
                          <svg className="w-full h-8 bg-slate-950 rounded border border-slate-900" viewBox="0 0 400 30">
                            <path
                              d="M 0 24 L 30 24 L 30 6 L 60 6 L 60 24 L 150 24 L 150 6 L 180 6 L 180 24 L 270 24 L 270 6 L 300 6 L 300 24 L 400 24"
                              fill="none"
                              stroke="#fbbf24"
                              strokeWidth="2"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* LIVE SERIAL MONITOR & MCU TERMINAL */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <span className="font-bold text-emerald-400 flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-emerald-400" />
                          <span>المراقب التسلسلي للمتحكم (Live MCU Serial Terminal)</span>
                        </span>

                        <div className="flex items-center gap-2 text-[10px]">
                          <select
                            value={selectedBaudRate}
                            onChange={(e) => setSelectedBaudRate(Number(e.target.value))}
                            className="bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 font-bold"
                          >
                            <option value={9600}>9600 Baud</option>
                            <option value={19200}>19200 Baud</option>
                            <option value={57600}>57600 Baud</option>
                            <option value={115200}>115200 Baud</option>
                          </select>
                          <button
                            onClick={() => setSerialPackets([])}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold cursor-pointer"
                          >
                            مسح الشاشة
                          </button>
                        </div>
                      </div>

                      {/* Serial Terminal Log Area */}
                      <div className="h-36 bg-black p-3 rounded-xl border border-slate-800 overflow-y-auto space-y-1.5 text-[11px]">
                        {serialPackets.map((pkt, pIdx) => (
                          <div key={pIdx} className="flex items-start gap-2">
                            <span className="text-slate-500 shrink-0">[{pkt.time}]</span>
                            <span className={pkt.type === 'tx' ? 'text-cyan-300 font-bold' : 'text-emerald-300'}>
                              {pkt.text}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Serial Command Sender Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={customSerialTx}
                          onChange={(e) => setCustomSerialTx(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendSerialCommand()}
                          placeholder="أدخل أمر تسلسلي (مثل: SET_SPEED 200 أو READ_SENSORS)..."
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          onClick={handleSendSerialCommand}
                          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer"
                        >
                          إرسال
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* MODE 3: ANALOG SIGNALS & REAL SCHEMATICS ENVIRONMENT */}
                {/* ======================================================== */}
                {simEnvironmentMode === 'analog' && (
                  <div className="space-y-5 animate-fade-in">
                    {/* ANALOG OSCILLOSCOPE WAVEFORM */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-xs text-amber-300 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span>راسم الذبذبات التماثلي (Real Analog Oscilloscope & ADC Plotter)</span>
                        </span>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                          <span>Vpeak: 5.00V</span>
                          <span className="text-amber-400 font-bold">ADC A0: {Math.round((612 * (100 - analogNoiseLevel)) / 100)} / 1023</span>
                        </div>
                      </div>

                      {/* Signal Frequency & Noise Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-300 flex justify-between">
                            <span>تردد الإشارة التماثلية:</span>
                            <span className="font-mono text-amber-300">{signalFreq} Hz</span>
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="500"
                            value={signalFreq}
                            onChange={(e) => setSignalFreq(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded cursor-pointer accent-amber-400"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-300 flex justify-between">
                            <span>نسبة الضوضاء التماثلية (Analog Noise):</span>
                            <span className="font-mono text-rose-300">{analogNoiseLevel}%</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="25"
                            value={analogNoiseLevel}
                            onChange={(e) => setAnalogNoiseLevel(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded cursor-pointer accent-rose-400"
                          />
                        </div>
                      </div>

                      {/* Analog Waveform SVG Plotter */}
                      <div className="bg-black p-3 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>قناة A0 (مستشعر الحرارة/المسافة) - 0.0V إلى 5.0V</span>
                          <span>معدل العينات: 10kHz</span>
                        </div>
                        <svg className="w-full h-24 bg-slate-950 rounded border border-slate-900" viewBox="0 0 500 80">
                          {/* Grid lines */}
                          <line x1="0" y1="20" x2="500" y2="20" stroke="#1e293b" strokeDasharray="3,3" />
                          <line x1="0" y1="40" x2="500" y2="40" stroke="#334155" strokeWidth="1" />
                          <line x1="0" y1="60" x2="500" y2="60" stroke="#1e293b" strokeDasharray="3,3" />
                          <line x1="250" y1="0" x2="250" y2="80" stroke="#1e293b" strokeDasharray="3,3" />

                          {/* Analog Sine/Sensor Wave with noise */}
                          <path
                            d={`M 0 ${40 + Math.sin(0) * 25} L 50 ${40 + Math.sin(0.5 * (signalFreq / 20)) * 25 + (Math.random() - 0.5) * analogNoiseLevel} L 100 ${40 + Math.sin(1 * (signalFreq / 20)) * 25 + (Math.random() - 0.5) * analogNoiseLevel} L 150 ${40 + Math.sin(1.5 * (signalFreq / 20)) * 25} L 200 ${40 + Math.sin(2 * (signalFreq / 20)) * 25 + (Math.random() - 0.5) * analogNoiseLevel} L 250 ${40 + Math.sin(2.5 * (signalFreq / 20)) * 25} L 300 ${40 + Math.sin(3 * (signalFreq / 20)) * 25 + (Math.random() - 0.5) * analogNoiseLevel} L 350 ${40 + Math.sin(3.5 * (signalFreq / 20)) * 25} L 400 ${40 + Math.sin(4 * (signalFreq / 20)) * 25 + (Math.random() - 0.5) * analogNoiseLevel} L 450 ${40 + Math.sin(4.5 * (signalFreq / 20)) * 25} L 500 ${40 + Math.sin(5 * (signalFreq / 20)) * 25}`}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2.5"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* REAL SCHEMATICS & PRACTICAL WIRING GALLERY */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-xs text-emerald-300 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-emerald-400" />
                          <span>معرض مخططات التوصيل والعتاد العملي (Real Breadboard & Schematic Inspector)</span>
                        </span>
                        <span className="text-[10px] text-slate-400">صور حقيقية للتوصيلات واللوحة الأم</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Real Breadboard Wiring Image */}
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-center">
                          <div className="rounded-lg overflow-hidden border border-slate-800 aspect-video bg-black flex items-center justify-center">
                            <img
                              src="/public/assets/aistudio/images__13__20e30bb9.jpeg"
                              alt="مخطط لوحة التجارب Breadboard"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-300 block">
                            توصيلات لوحة التجارب Breadboard مع Arduino & HC-SR04
                          </span>
                        </div>

                        {/* Real LCD & Battery Circuit Image */}
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-center">
                          <div className="rounded-lg overflow-hidden border border-slate-800 aspect-video bg-black flex items-center justify-center">
                            <img
                              src="/public/assets/aistudio/edbcb028717f1ae6a8dcac8aefa86457-large_5890acab.jpg"
                              alt="دائرة التحكم وشاشة LCD 16x2"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-300 block">
                            دائرة التبريد وشاشة LCD 16x2 وتغذية البطارية 9V
                          </span>
                        </div>

                        {/* Real Arduino UNO Board Closeup Image */}
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-center">
                          <div className="rounded-lg overflow-hidden border border-slate-800 aspect-video bg-black flex items-center justify-center">
                            <img
                              src="/public/assets/aistudio/images__12__84e8317f.jpeg"
                              alt="لوحة أردوينو وينو UNO R3 الحقيقية"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-300 block">
                            لوحة Arduino UNO R3 الدقيقة والمعالج ATmega328P
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* MODE 4: INTERACTIVE 3D MECHATRONICS EQUIPMENT BENCH */}
                {/* ======================================================== */}
                {simEnvironmentMode === 'tools' && (
                  <div className="space-y-5 animate-fade-in">
                    <Mechatronics3DToolsBench />
                  </div>
                )}
              </div>

              {/* Testing & Calibration Procedure */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-3">
                <h4 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>خطوات الاختبار والمعايرة العملية:</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentProject.testingProcedure.steps.map((st, sIdx) => (
                    <li key={sIdx}>{st}</li>
                  ))}
                </ol>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                  🎯 <strong>السلوك المتوقع:</strong> {currentProject.testingProcedure.expectedBehavior}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActivePhase(8)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>
                <button
                  onClick={() => setActivePhase(11)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>المرحلة التالية: الأخطاء المحتملة والحلول</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Phase 11: الأخطاء المحتملة وطرق إصلاحها (Troubleshooting) */}
          {activePhase === 11 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                  11
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    المرحلة 11: المشاكل الشائعة وطرق استكشاف الأخطاء وإصلاحها
                  </h3>
                  <span className="text-xs text-slate-500">دليل تشخيص الأعطال الميدانية وحلولها الهندسية المباشرة</span>
                </div>
              </div>

              <div className="space-y-3">
                {currentProject.troubleshooting.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>المشكلة: {item.symptom}</span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 pl-6">
                      <span className="font-bold text-slate-700 dark:text-slate-300">السبب المحتمل:</span> {item.possibleCause}
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                      💡 <strong>الحل الهندسي:</strong> {item.solution}
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActivePhase(10)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>
                <button
                  onClick={() => setActivePhase(12)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>المرحلة التالية: تحسين وتطوير المشروع</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Phase 12: تحسين وتطوير المشروع وتعديله بالذكاء الاصطناعي */}
          {activePhase === 12 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  12
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    المرحلة 12: تحسين وتطوير وتعديل المشروع
                  </h3>
                  <span className="text-xs text-slate-500">أفكار تطويرية صناعية + إمكانية التعديل التلقائي بالذكاء الاصطناعي</span>
                </div>
              </div>

              {/* Future Improvements List */}
              <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 space-y-3">
                <h4 className="font-extrabold text-sm text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>أفكار لتطوير المشروع إلى المستوى الصناعي:</span>
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentProject.futureImprovements.map((imp, idx) => (
                    <li key={idx}>{imp}</li>
                  ))}
                </ul>
              </div>

              {/* AI Modification Sandbox */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>تعديل وتطوير هذا المشروع بالذكاء الاصطناعي:</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">تحديث الكود والمخطط والخطوات فوراً</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={modificationInput}
                    onChange={(e) => setModificationInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleModifyProject()}
                    placeholder="مثال: أضف شاشة عرض OLED وبلوتوث للتحكم بالهاتف، أو بدّل المحركات..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:border-blue-600 focus:outline-hidden text-slate-800 dark:text-slate-200"
                  />
                  <button
                    onClick={handleModifyProject}
                    disabled={isModifying || !modificationInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm cursor-pointer shrink-0 transition-transform hover:scale-105"
                  >
                    {isModifying ? 'جاري التعديل...' : 'تطبيق التعديل 🚀'}
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActivePhase(11)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>
                <button
                  onClick={() => setActivePhase(13)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>المرحلة التالية: النتيجة والمراجع الأكاديمية</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Phase 13: النتيجة النهائية والمراجع الأكاديمية (Section 12) */}
          {activePhase === 13 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  13
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    المرحلة 13: خلاصة النتيجة النهائية والمراجع الأكاديمية
                  </h3>
                  <span className="text-xs text-slate-500">المصادر المعتمدة من مقررات ومختبرات أكاديمية الميكاترونكس اليمنية</span>
                </div>
              </div>

              {/* Final Summary Card */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <h4 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200">
                  خلاصة النتيجة النهائية:
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {currentProject.finalResultSummary}
                </p>
              </div>

              {/* Academic References (As requested in Section 12) */}
              <div className="space-y-3 pt-2">
                <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>المراجع التعليمية الأكاديمية المعتمدة المرتبطة بالمشروع:</span>
                </h4>

                {currentProject.references && currentProject.references.length > 0 ? (
                  <div className="space-y-2.5">
                    {currentProject.references.map((ref, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5"
                      >
                        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-blue-900 dark:text-blue-200">
                          <span>{ref.type === 'video' ? '🎥 الفيديو المعتمد:' : '📚 المصدر الأكاديمي:'}</span>
                          <span>{ref.title}</span>
                        </div>
                        {ref.chapterOrSection && (
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            <strong>الفصل / الباب:</strong> {ref.chapterOrSection}
                          </div>
                        )}
                        {ref.pageNumber && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            <strong>الصفحة:</strong> {ref.pageNumber}
                          </div>
                        )}
                        {ref.videoTimestamp && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            <strong>الدقيقة:</strong> {ref.videoTimestamp}
                          </div>
                        )}
                        {ref.sourceNote && (
                          <div className="text-[11px] text-slate-400">
                            📌 {ref.sourceNote}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                    «لم أجد هذه المعلومة في المراجع التعليمية المتاحة حاليًا، وسأقدم شرحًا عامًا إن أمكن.»
                  </div>
                )}
              </div>

              {/* Navigation & Action Finish */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActivePhase(12)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة وتصدير تقرير المشروع الكامل (PDF)</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 5. Component Details Modal (Popup for whatIsIt, function, howItWorks, whereUsed) */}
      {inspectingComponent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-2 border-blue-500 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {inspectingComponent.name}
                  </h3>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                    العدد المطلوب: {inspectingComponent.count}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setInspectingComponent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <strong className="text-blue-600 dark:text-blue-400 block font-black">ما هو المكون؟</strong>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {inspectingComponent.details.whatIsIt}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <strong className="text-emerald-600 dark:text-emerald-400 block font-black">ما وظيفته في النظام؟</strong>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {inspectingComponent.details.function}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <strong className="text-amber-600 dark:text-amber-400 block font-black">كيف يعمل فيزيائياً وإلكترونياً؟</strong>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {inspectingComponent.details.howItWorks}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <strong className="text-purple-600 dark:text-purple-400 block font-black">أين يستخدم في التطبيقات الصناعية؟</strong>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {inspectingComponent.details.whereUsed}
                </p>
              </div>

              {inspectingComponent.details.pinoutOrSpecs && (
                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs font-mono text-blue-900 dark:text-blue-200">
                  📌 <strong>مواصفات الأرجل والجهد:</strong> {inspectingComponent.details.pinoutOrSpecs}
                </div>
              )}
            </div>

            <button
              onClick={() => setInspectingComponent(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm cursor-pointer transition-colors"
            >
              إغلاق البطاقة
            </button>
          </div>
        </div>
      )}

      {/* 6. 8 Educational Drawings Gallery Modal (As requested in Section 3) */}
      {isGalleryOpen && currentProject?.galleryImages && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-slate-900 border-2 border-cyan-500 rounded-3xl max-w-4xl w-full p-5 sm:p-7 space-y-4 shadow-2xl text-white overflow-y-auto max-h-[95vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-black text-base sm:text-lg text-white">
                    معرض الرسومات الهندسية للمشروع (8 رسومات تعليمية دقيقة)
                  </h3>
                  <span className="text-xs text-cyan-300">
                    {currentProject.galleryImages[activeGalleryIndex]?.title}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsGalleryOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Thumbnail Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
              {currentProject.galleryImages.map((img, gIdx) => (
                <button
                  key={img.id || gIdx}
                  onClick={() => setActiveGalleryIndex(gIdx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    activeGalleryIndex === gIdx
                      ? 'bg-cyan-500 text-black shadow-md font-black scale-105'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  صورة {img.imageNumber}
                </button>
              ))}
            </div>

            {/* Active Drawing SVG */}
            {currentProject.galleryImages[activeGalleryIndex] && (
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2 shadow-2xl">
                  <div
                    dangerouslySetInnerHTML={{ __html: currentProject.galleryImages[activeGalleryIndex].svgContent }}
                    className="w-full h-auto"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <h4 className="font-extrabold text-sm text-cyan-300">
                    {currentProject.galleryImages[activeGalleryIndex].title} — {currentProject.galleryImages[activeGalleryIndex].subtitle}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentProject.galleryImages[activeGalleryIndex].description}
                  </p>
                </div>
              </div>
            )}

            {/* Gallery Next / Prev */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setActiveGalleryIndex(Math.max(0, activeGalleryIndex - 1))}
                disabled={activeGalleryIndex === 0}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-slate-200 cursor-pointer flex items-center gap-1"
              >
                <ChevronRight className="w-4 h-4" />
                <span>الصورة السابقة</span>
              </button>

              <span className="text-xs text-slate-400">
                الصورة {activeGalleryIndex + 1} من {currentProject.galleryImages.length}
              </span>

              <button
                onClick={() => setActiveGalleryIndex(Math.min(currentProject.galleryImages!.length - 1, activeGalleryIndex + 1))}
                disabled={activeGalleryIndex === currentProject.galleryImages.length - 1}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-black font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <span>الصورة التالية</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Floating Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className={`px-5 py-3 rounded-2xl shadow-2xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 backdrop-blur-md ${
            toastNotification.type === 'success'
              ? 'bg-emerald-900/95 border-emerald-400 text-emerald-100 shadow-emerald-900/50'
              : toastNotification.type === 'error'
              ? 'bg-rose-900/95 border-rose-400 text-rose-100 shadow-rose-900/50'
              : 'bg-blue-900/95 border-blue-400 text-blue-100 shadow-blue-900/50'
          }`}>
            {toastNotification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            ) : toastNotification.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-300 shrink-0" />
            )}
            <span>{toastNotification.message}</span>
          </div>
        </div>
      )}

    </div>
  );
};
