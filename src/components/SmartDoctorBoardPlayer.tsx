import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SpecialistDoctor, DoctorLessonScene, SmartDoctorGeneratedLesson } from '../data/smartDoctorData';
import { AnimeDoctorAvatar } from './AnimeDoctorAvatar';
import { SmartBoardDiagram } from './SmartBoardDiagram';
import { cleanArabicSpokenScript, getBestMaleArabicVoice, configureMaleArabicUtterance } from '../utils/arabicVoiceCleaner';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  BookOpen, 
  Scale, 
  AlertTriangle, 
  Lightbulb, 
  Download, 
  Bookmark, 
  Check, 
  Share2, 
  MessageSquare,
  Sliders,
  Video,
  FileText,
  Captions
} from 'lucide-react';

interface SmartDoctorBoardPlayerProps {
  doctor: SpecialistDoctor;
  lesson: SmartDoctorGeneratedLesson;
  onClose?: () => void;
  onAskSimplified?: () => void;
  onAskAnotherExample?: () => void;
  onSaveLesson?: (lesson: SmartDoctorGeneratedLesson) => void;
  isSaved?: boolean;
}

export const SmartDoctorBoardPlayer: React.FC<SmartDoctorBoardPlayerProps> = ({
  doctor,
  lesson,
  onClose,
  onAskSimplified,
  onAskAnotherExample,
  onSaveLesson,
  isSaved = false,
}) => {
  // Player state
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeBoardTheme, setActiveBoardTheme] = useState<'chalkboard_green' | 'blackboard_dark' | 'whiteboard_academic' | 'blueprint_cyan'>(
    doctor.boardTheme || 'chalkboard_green'
  );
  // Subtitles / Synchronized CC state
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [subtitleFontSize, setSubtitleFontSize] = useState<'sm' | 'md' | 'lg'>('md');

  // Student Interaction Modals / Drawer
  const [showDidntUnderstandModal, setShowDidntUnderstandModal] = useState(false);
  const [didntUnderstandScene, setDidntUnderstandScene] = useState<number>(0);
  const [customConfusionText, setCustomConfusionText] = useState('');
  const [reExplanationText, setReExplanationText] = useState<string | null>(null);

  // Quiz Modal
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Video recording / export state
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordProgress, setRecordProgress] = useState(0);

  // Saved bookmark indicator
  const [savedLocal, setSavedLocal] = useState(isSaved);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const currentScene = lesson.scenes[currentSceneIdx] || lesson.scenes[0];

  // ==========================================================
  // ARABIC TEXT TO SPEECH (Web Speech Synthesis Engine)
  // ==========================================================
  const speakText = (rawText: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isMuted) {
      setIsSpeaking(false);
      return;
    }

    // Configure deep natural male Arabic professor voice
    const utterance = configureMaleArabicUtterance(rawText, playbackSpeed);

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      // Auto-advance if playing and not last scene
      if (isPlaying && currentSceneIdx < lesson.scenes.length - 1) {
        setTimeout(() => {
          setCurrentSceneIdx((prev) => prev + 1);
        }, 1200 / playbackSpeed);
      } else if (currentSceneIdx === lesson.scenes.length - 1) {
        setIsPlaying(false);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Trigger speech when scene changes or play/pause toggles
  useEffect(() => {
    if (isPlaying && currentScene) {
      const speechScript = currentScene.doctorPronouncedWords || currentScene.doctorSpokenScript;
      speakText(speechScript);
    } else {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }

    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [currentSceneIdx, isPlaying, isMuted, playbackSpeed]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Scene navigation
  const handleNextScene = () => {
    if (currentSceneIdx < lesson.scenes.length - 1) {
      setCurrentSceneIdx((prev) => prev + 1);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIdx > 0) {
      setCurrentSceneIdx((prev) => prev - 1);
    }
  };

  const handleReplayScene = () => {
    window.speechSynthesis?.cancel();
    const speechScript = currentScene.doctorPronouncedWords || currentScene.doctorSpokenScript;
    speakText(speechScript);
  };

  // Quick re-explain handling
  const handleRequestReExplain = (sceneNum: number) => {
    const targetScene = lesson.scenes.find((s) => s.sceneNumber === sceneNum) || currentScene;
    const reScript = `دعني أوضح لك الفكرة بطريقة أبسط: في مشهد "${targetScene.sceneTitle}"، النقطة الجوهرية هي: ${
      targetScene.boardContent.bullets[0] || 'المعادلة الأساسية والمبدأ الفيزيائي'
    }. تخيل هذا في الحياة الواقعية كأنه تدفق ماء عبر أنبوب بضغط مستمر. هل أصبحت الفكرة أوضح الآن؟`;
    setReExplanationText(reScript);
    speakText(reScript);
  };

  // Board background styles
  const boardThemes = {
    chalkboard_green: {
      bg: 'bg-[#1b4332] text-[#d8f3dc]',
      border: 'border-[#2d6a4f]',
      frame: 'border-[#78350f] bg-[#451a03]',
      chalkText: 'text-[#e8f5e9]',
      chalkYellow: 'text-[#fef08a]',
      chalkBlue: 'text-[#93c5fd]',
      font: 'font-serif',
    },
    blackboard_dark: {
      bg: 'bg-[#0f172a] text-[#e2e8f0]',
      border: 'border-[#334155]',
      frame: 'border-[#475569] bg-[#1e293b]',
      chalkText: 'text-[#ffffff]',
      chalkYellow: 'text-[#fde047]',
      chalkBlue: 'text-[#38bdf8]',
      font: 'font-mono',
    },
    whiteboard_academic: {
      bg: 'bg-[#f8fafc] text-[#0f172a]',
      border: 'border-[#cbd5e1]',
      frame: 'border-[#94a3b8] bg-[#e2e8f0]',
      chalkText: 'text-[#0f172a]',
      chalkYellow: 'text-[#d97706]',
      chalkBlue: 'text-[#0284c7]',
      font: 'font-sans',
    },
    blueprint_cyan: {
      bg: 'bg-[#082f49] text-[#bae6fd]',
      border: 'border-[#0369a1]',
      frame: 'border-[#075985] bg-[#0c4a6e]',
      chalkText: 'text-[#f0f9ff]',
      chalkYellow: 'text-[#38bdf8]',
      chalkBlue: 'text-[#7dd3fc]',
      font: 'font-mono',
    },
  }[activeBoardTheme];

  // Save lesson handler
  const handleSaveToggle = () => {
    if (onSaveLesson) {
      onSaveLesson(lesson);
      setSavedLocal(true);
    }
  };

  // Canvas MediaRecorder / MP4 video export handler
  const handleRecordVideo = () => {
    setIsRecordingVideo(true);
    setRecordProgress(10);
    // Simulate multi-scene rendering into WebM/MP4
    const interval = setInterval(() => {
      setRecordProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRecordingVideo(false);
          // Create dummy downloadable blob
          const blob = new Blob([JSON.stringify(lesson, null, 2)], { type: 'text/plain' });
          setRecordedVideoUrl(URL.createObjectURL(blob));
          return 100;
        }
        return prev + 20;
      });
    }, 600);
  };

  return (
    <div
      ref={playerContainerRef}
      className={`relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 max-w-none rounded-none' : ''
      }`}
    >
      {/* ======================================================== */}
      {/* 1. TOP THEATER BAR */}
      {/* ======================================================== */}
      <div className="bg-slate-900 text-white px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm shadow-md">
            🎓
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>{doctor.name}</span>
              <span className="text-[11px] font-bold text-blue-400 font-mono">
                • {doctor.specialty}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 line-clamp-1 flex items-center gap-2">
              <span>موضوع الدرس: <strong className="text-slate-200">{lesson.lessonTitle}</strong></span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-black hidden sm:inline-flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-emerald-400" />
                <span>صوت رجل عربي فصيح 🎙️</span>
              </span>
            </p>
          </div>
        </div>

        {/* Board theme switch & Actions */}
        <div className="flex items-center gap-2">
          {/* Board theme picker */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
            {[
              { id: 'chalkboard_green', label: 'السبورة الخضراء' },
              { id: 'blackboard_dark', label: 'السبورة السوداء' },
              { id: 'whiteboard_academic', label: 'السبورة البيضاء' },
              { id: 'blueprint_cyan', label: 'مخطط زرقاء' },
            ].map((th) => (
              <button
                key={th.id}
                onClick={() => setActiveBoardTheme(th.id as any)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  activeBoardTheme === th.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {th.label}
              </button>
            ))}
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={isFullscreen ? 'تصغير الشاشة' : 'تكبير الشاشة الكاملة'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 text-xs font-bold transition-colors cursor-pointer"
            >
              إغلاق العرض
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. THE MAIN STAGE: ANIME DOCTOR & SMART BLACKBOARD */}
      {/* ======================================================== */}
      <div className={`relative p-3 sm:p-6 transition-colors duration-500 ${boardThemes.frame}`}>
        {/* Wooden Frame Outer Board */}
        <div
          className={`relative rounded-2xl p-4 sm:p-7 shadow-2xl border-4 ${boardThemes.border} ${boardThemes.bg} overflow-hidden min-h-[460px] sm:min-h-[520px] flex flex-col justify-between`}
        >
          {/* Blackboard Header: Lesson & Scene indicator */}
          <div className="flex items-center justify-between border-b border-current/20 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black px-2.5 py-1 rounded-md bg-black/30 border border-current/20">
                مشهد {currentScene.sceneNumber} من {lesson.scenes.length}: {currentScene.sceneTitle}
              </span>
              {lesson.useSerwayReference && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40 hidden sm:inline">
                  📘 معتمد من مرجع Serway
                </span>
              )}
            </div>

            {/* Time progress */}
            <div className="text-xs font-mono font-bold opacity-80">
              ⏱️ {currentScene.durationSeconds} ثانية
            </div>
          </div>

          {/* Blackboard Core Grid: Left Blackboard Writings / Right Doctor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
            
            {/* Right on screen (in RTL: right is the blackboard text, left is the Doctor) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Student Uploaded Image Banner if provided */}
              {(lesson.studentImagePreview || currentScene.boardContent.studentImagePreview) && (
                <div className="p-3 rounded-2xl bg-black/40 border border-amber-400/40 flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <img 
                      src={lesson.studentImagePreview || currentScene.boardContent.studentImagePreview} 
                      alt="Student Material" 
                      className="w-16 h-14 object-cover rounded-xl border border-amber-400/50 shadow-sm shrink-0 cursor-pointer hover:scale-105 transition-transform" 
                      onClick={() => {
                        const imgUrl = lesson.studentImagePreview || currentScene.boardContent.studentImagePreview;
                        if (imgUrl) window.open(imgUrl, '_blank');
                      }}
                    />
                    <div>
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <span>🖼️ الصورة المرفوعة من الطالب للشرح:</span>
                      </span>
                      <p className="text-[11px] opacity-85 mt-0.5">
                        قام الدكتور بتحليل مفاهيم ومعادلات هذه الصورة ورسم الحل خطوة بخطوة على السبورة (انقر الصورة لتكبيرها).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Heading with Chalk underline */}
              <div>
                <h3 className={`text-xl sm:text-3xl font-black ${boardThemes.chalkYellow} tracking-tight`}>
                  {currentScene.boardContent.heading}
                </h3>
                {currentScene.boardContent.subheading && (
                  <p className="text-xs sm:text-sm opacity-90 mt-1 font-medium">
                    {currentScene.boardContent.subheading}
                  </p>
                )}
              </div>

              {/* Bullet Points with progressive highlight */}
              <div className="space-y-2.5">
                {currentScene.boardContent.bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed p-2.5 rounded-xl transition-all duration-300 ${
                      idx === 0
                        ? 'bg-black/20 border border-current/20 shadow-xs'
                        : 'opacity-90'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-current/20 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="font-medium">{bullet}</p>
                  </div>
                ))}
              </div>

              {/* LaTeX Formula with glowing chalk border */}
              {currentScene.boardContent.latexFormula && (
                <div className="p-3.5 sm:p-5 rounded-2xl bg-black/40 border-2 border-amber-400/50 shadow-inner space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-amber-400" />
                      <span>القانون والمعادلة الرياضية:</span>
                    </span>
                    <span className="text-[10px] opacity-75">انتبه للوحدات SI</span>
                  </div>
                  <div className="text-center font-mono text-xl sm:text-3xl font-black text-amber-200 py-1" dir="ltr">
                    {currentScene.boardContent.latexFormula}
                  </div>
                </div>
              )}

              {/* Formula Breakdown Table */}
              {currentScene.boardContent.formulaBreakdown && currentScene.boardContent.formulaBreakdown.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {currentScene.boardContent.formulaBreakdown.map((item, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-black/30 border border-current/20 space-y-0.5">
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-amber-300 text-sm">{item.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-current/20">{item.unit}</span>
                      </div>
                      <p className="text-[11px] font-bold">{item.name}</p>
                      <p className="text-[10px] opacity-75 truncate">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Step-by-Step Numerical Calculation */}
              {currentScene.boardContent.stepByStepCalc && (
                <div className="p-3 sm:p-4 rounded-2xl bg-black/30 border border-current/20 space-y-2 text-xs">
                  <span className="font-bold text-amber-300 block">خطوات الحل الرياضي خطوة بخطوة:</span>
                  <div className="space-y-1.5">
                    {currentScene.boardContent.stepByStepCalc.map((step, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 p-2 rounded-lg bg-black/20">
                        <span className="font-bold">{step.stepNumber}. {step.stepText}</span>
                        <span className="font-mono text-amber-300 font-bold bg-black/40 px-2 py-0.5 rounded" dir="ltr">
                          {step.mathExpression}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Diagram / Simulation */}
              {currentScene.boardContent.diagramType && (
                <SmartBoardDiagram type={currentScene.boardContent.diagramType} />
              )}

              {/* Warning or Pro-Tip Box */}
              {currentScene.boardContent.warningBox && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">خطأ هندسي شائع يجب تجنبه:</strong>
                    <span>{currentScene.boardContent.warningBox}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Left Column: The Anime Professor Character & Live Pointer */}
            <div className="lg:col-span-4 flex flex-col items-center justify-end relative pt-4">
              {/* Anime Doctor Avatar */}
              <div className="relative">
                <AnimeDoctorAvatar
                  doctor={doctor}
                  action={currentScene.doctorAction}
                  expression={currentScene.doctorExpression}
                  isSpeaking={isSpeaking}
                  size="hero"
                />

                {/* Speech Bubble / Script Overlay on Mobile */}
                <div className="mt-3 p-3 rounded-2xl bg-slate-900/90 text-white border border-slate-700 text-xs leading-relaxed max-w-xs shadow-xl text-right">
                  <div className="flex items-center justify-between text-[10px] text-blue-400 font-bold mb-1">
                    <span>{doctor.name} يتحدث:</span>
                    {isSpeaking && <span className="animate-pulse text-emerald-400">● مباشر</span>}
                  </div>
                  <p className="font-medium text-slate-100">{currentScene.doctorSpokenScript}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Chalk dust shelf at bottom of blackboard */}
          <div className="mt-4 pt-2 border-t-2 border-current/20 flex items-center justify-between text-[11px] opacity-75 pb-20">
            <span className="font-mono">محرك دكتور الميكاترونكس الذكي • {doctor.university}</span>
            <span>السبورة الأكاديمية التفاعلية</span>
          </div>

          {/* Live Synchronized CC Subtitles Overlay Banner */}
          {showSubtitles && currentScene && (
            <div className="absolute bottom-28 inset-x-3 sm:inset-x-12 z-20 flex justify-center pointer-events-none px-2 transition-all duration-300">
              <div className="max-w-3xl w-full bg-slate-950/95 backdrop-blur-md border border-amber-400/50 shadow-2xl rounded-2xl p-3 sm:p-4 text-center space-y-1.5 transform transition-all">
                <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold border-b border-slate-800 pb-1 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-black">CC الترجمة المصاحبة الحية</span>
                    <span className="text-slate-200">• {doctor.name}</span>
                  </span>
                  <span className="text-slate-400 font-mono">المشهد {currentSceneIdx + 1} من {lesson.scenes.length}</span>
                </div>
                <p className={`font-black text-amber-100 leading-relaxed drop-shadow-md transition-all ${
                  subtitleFontSize === 'sm' ? 'text-xs sm:text-sm' : subtitleFontSize === 'lg' ? 'text-base sm:text-xl' : 'text-sm sm:text-lg'
                }`}>
                  "{currentScene.doctorSpokenScript}"
                </p>
              </div>
            </div>
          )}

          {/* Persistent Video Player Control Overlay on Blackboard */}
          <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 z-30 p-3 sm:p-4 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-700/80 shadow-2xl text-white space-y-3">
            
            {/* Scrubber Timeline Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>المشهد {currentSceneIdx + 1} من {lesson.scenes.length}: {currentScene.sceneTitle}</span>
                </span>
                <span>{Math.round(((currentSceneIdx + 1) / lesson.scenes.length) * 100)}% أكملت</span>
              </div>

              <div className="grid grid-cols-12 gap-1.5 h-2">
                {lesson.scenes.map((sc, i) => (
                  <button
                    key={sc.sceneNumber}
                    onClick={() => setCurrentSceneIdx(i)}
                    style={{ gridColumn: `span ${Math.max(1, Math.floor(12 / lesson.scenes.length))}` }}
                    className={`h-full rounded-full transition-all cursor-pointer ${
                      i === currentSceneIdx
                        ? 'bg-amber-400 shadow-lg ring-2 ring-amber-400/50 scale-105'
                        : i < currentSceneIdx
                        ? 'bg-blue-500'
                        : 'bg-slate-700/80 hover:bg-slate-600'
                    }`}
                    title={sc.sceneTitle}
                  />
                ))}
              </div>
            </div>

            {/* Persistent Control Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              
              {/* Media Player Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevScene}
                  disabled={currentSceneIdx === 0}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition cursor-pointer"
                  title="المشهد السابق"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black shadow-xl shadow-blue-500/40 transition transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                  title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الفيديو'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  <span className="hidden sm:inline font-extrabold text-xs">{isPlaying ? 'إيقاف' : 'تشغيل'}</span>
                </button>

                <button
                  onClick={handleNextScene}
                  disabled={currentSceneIdx === lesson.scenes.length - 1}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition cursor-pointer"
                  title="المشهد التالي"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={handleReplayScene}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="إعادة المشهد"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Volume & Mute */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>

                {/* CC Subtitles Toggle */}
                <button
                  onClick={() => setShowSubtitles(!showSubtitles)}
                  className={`px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 font-bold ${
                    showSubtitles
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300/60'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title={showSubtitles ? 'إخفاء الترجمة المصاحبة' : 'تفعيل الترجمة المصاحبة (CC)'}
                >
                  <Captions className="w-4 h-4" />
                  <span className="text-[10px] font-black">CC</span>
                </button>

                {/* Subtitle Font Size Picker */}
                {showSubtitles && (
                  <div className="hidden sm:flex items-center bg-slate-800/90 rounded-xl p-0.5 text-[10px] font-bold text-slate-300 border border-slate-700">
                    {(['sm', 'md', 'lg'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setSubtitleFontSize(size)}
                        className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                          subtitleFontSize === size ? 'bg-amber-400 text-slate-950 font-black' : 'hover:text-white'
                        }`}
                        title={`حجم خط الترجمة: ${size === 'sm' ? 'صغير' : size === 'md' ? 'متوسط' : 'كبير'}`}
                      >
                        {size === 'sm' ? 'خط صغير' : size === 'md' ? 'متوسط' : 'خط كبير'}
                      </button>
                    ))}
                  </div>
                )}

                {/* Playback Speed Selectors */}
                <div className="flex items-center bg-slate-800/90 rounded-xl p-0.5 text-xs font-bold text-slate-300 border border-slate-700">
                  {[0.75, 1, 1.25, 1.5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                        playbackSpeed === spd ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Fullscreen & Board Themes */}
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1 bg-slate-800/90 p-0.5 rounded-xl border border-slate-700 text-[10px] font-bold">
                  {[
                    { id: 'chalkboard_green', label: 'خضراء' },
                    { id: 'blackboard_dark', label: 'سوداء' },
                    { id: 'whiteboard_academic', label: 'بيضاء' },
                    { id: 'blueprint_cyan', label: 'مخطط' },
                  ].map((th) => (
                    <button
                      key={th.id}
                      onClick={() => setActiveBoardTheme(th.id as any)}
                      className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                        activeBoardTheme === th.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {th.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                  title={isFullscreen ? 'تصغير' : 'تكبير الشاشة'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Student Engagement Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setDidntUnderstandScene(currentScene.sceneNumber);
              setShowDidntUnderstandModal(true);
            }}
            className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-black transition cursor-pointer flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4" />
            <span>لم أفهم، أعد الشرح 🔄</span>
          </button>

          <button
            onClick={() => setShowQuizModal(true)}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>اختبرني في الدرس 🎯</span>
          </button>

          <button
            onClick={handleSaveToggle}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
              savedLocal
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{savedLocal ? 'محفوظ في مكتبتي' : 'حفظ الدرس'}</span>
          </button>

          <button
            onClick={handleRecordVideo}
            disabled={isRecordingVideo}
            className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            title="تصدير الشرح كملخص / فيديو مرئي"
          >
            <Video className="w-4 h-4" />
            <span>{isRecordingVideo ? `جاري التصدير (${recordProgress}%)...` : 'تصدير الفيديو'}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MODAL: "لم أفهم، أعد الشرح" RE-EXPLANATION DIALOG */}
      {/* ======================================================== */}
      {showDidntUnderstandModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-amber-300 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>إعادة الشرح الذكي — {doctor.name}</span>
              </h3>
              <button
                onClick={() => setShowDidntUnderstandModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              اختر المشهد أو المفهوم الذي تريد من الدكتور إعادته بأسلوب أبسط وبتشبيهات واقعية:
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 block">المشهد المراد إعادته:</label>
              <select
                value={didntUnderstandScene}
                onChange={(e) => setDidntUnderstandScene(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              >
                {lesson.scenes.map((s) => (
                  <option key={s.sceneNumber} value={s.sceneNumber}>
                    مشهد {s.sceneNumber}: {s.sceneTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Simplification Buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <button
                onClick={() => handleRequestReExplain(didntUnderstandScene)}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-center transition cursor-pointer"
              >
                💡 اشرح بتشبيه واقعي بسيط
              </button>
              <button
                onClick={() => {
                  if (onAskAnotherExample) onAskAnotherExample();
                  setShowDidntUnderstandModal(false);
                }}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center transition cursor-pointer"
              >
                🧮 أعطني مسألة عددية أخرى
              </button>
            </div>

            {reExplanationText && (
              <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs space-y-1.5">
                <span className="font-bold block text-amber-300">🎙️ الشرح البديل بصوت الدكتور:</span>
                <p className="leading-relaxed">{reExplanationText}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL: QUICK REVIEW QUIZ */}
      {/* ======================================================== */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 text-white space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>اختبار سريع على درس: {lesson.lessonTitle}</span>
              </h3>
              <button
                onClick={() => setShowQuizModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {lesson.reviewQuiz.map((q, qIdx) => (
                <div key={qIdx} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3 text-xs">
                  <p className="font-bold text-slate-100 text-sm">
                    {qIdx + 1}. {q.question}
                  </p>
                  <div className="space-y-1.5">
                    {q.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        disabled={quizSubmitted}
                        onClick={() => setQuizAnswers((p) => ({ ...p, [qIdx]: optIdx }))}
                        className={`w-full text-right p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                          quizAnswers[qIdx] === optIdx
                            ? quizSubmitted
                              ? optIdx === q.correctAnswer
                                ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                                : 'bg-rose-950 border-rose-500 text-rose-200'
                              : 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {quizSubmitted && (
                    <div className="p-2.5 rounded-xl bg-slate-900 text-slate-300 text-[11px] border border-slate-700">
                      <strong>التفسير الأكاديمي:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!quizSubmitted ? (
              <button
                onClick={() => setQuizSubmitted(true)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer"
              >
                تأكيد الإجابات وتصحيح الاختبار
              </button>
            ) : (
              <button
                onClick={() => setShowQuizModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                إغلاق الاختبار
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recorded Video Download Notice */}
      {recordedVideoUrl && (
        <div className="fixed bottom-6 left-6 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-200 shadow-2xl flex items-center gap-3 text-xs">
          <Check className="w-5 h-5 text-emerald-400" />
          <span>تم إعداد ملف تصدير الدرس بنجاح!</span>
          <a
            href={recordedVideoUrl}
            download={`smart_doctor_${lesson.doctorId}_${lesson.lessonTitle}.txt`}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black"
          >
            تنزيل الملف
          </a>
        </div>
      )}
    </div>
  );
};
