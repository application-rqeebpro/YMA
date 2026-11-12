import React, { useState, useEffect } from 'react';
import { StudentProfile, Subject, Lesson, ExplainLessonResult } from './types';
import { INITIAL_SUBJECTS, INITIAL_LESSONS } from './data/initialData';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { WelcomeView } from './components/WelcomeView';
import { RegistrationView } from './components/RegistrationView';
import { SubscriptionView } from './components/SubscriptionView';
import { PaymentInstructionsView } from './components/PaymentInstructionsView';
import { ActivationCodeView } from './components/ActivationCodeView';
import { SubjectsView } from './components/SubjectsView';
import { LessonDetailView } from './components/LessonDetailView';
import { ExplainLessonView } from './components/ExplainLessonView';
import { FormulaAnalyzerView } from './components/FormulaAnalyzerView';
import { UnitConverterView } from './components/UnitConverterView';
import { CircuitsHelperView } from './components/CircuitsHelperView';
import { MathHelperView } from './components/MathHelperView';
import { AssignmentGeneratorView } from './components/AssignmentGeneratorView';
import { ArduinoSimulatorView } from './components/ArduinoSimulatorView';
import { ProjectLabView } from './components/ProjectLabView';
import { InteractivePhysicsLabView } from './components/InteractivePhysicsLabView';
import { ScientificCalculatorView } from './components/ScientificCalculatorView';
import { AiAssistantModal } from './components/AiAssistantModal';
import { AdminPanelView } from './components/AdminPanelView';
import { LoginModal } from './components/LoginModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { ExamModal } from './components/ExamModal';
import { PersonalizedLearningPathView } from './components/PersonalizedLearningPathView';
import { ReferencesLibraryView } from './components/ReferencesLibraryView';
import { ExplanationVideosView } from './components/ExplanationVideosView';
import { EducationalVideoLibraryView } from './components/EducationalVideoLibraryView';
import { SmartDoctorView } from './components/SmartDoctorView';
import { SmartDoctorProView } from './components/SmartDoctorProView';
import { DailyChallengeView } from './components/DailyChallengeView';
import { PlatformGuideModal } from './components/PlatformGuideModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('mct_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  // Student State - Verified by backend, never blindly trusted from local storage
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isVerifyingSession, setIsVerifyingSession] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('mct_auth_token'));
  });

  // Onboarding / Active flow step: 'welcome' | 'registration' | 'plans' | 'payment' | 'code' | 'dashboard'
  const [onboardingStep, setOnboardingStep] = useState<string>('welcome');

  // Platform User Guide Modal State
  const [isPlatformGuideOpen, setIsPlatformGuideOpen] = useState(false);

  // Temporary staging data for registration
  const [regData, setRegData] = useState<{
    name: string;
    phone: string;
    university: string;
    studyLevel: any;
    major: string;
    email?: string;
  }>({
    name: '',
    phone: '',
    university: 'الجامعة الإماراتية الدولية – صنعاء',
    studyLevel: 'السنة الأولى',
    major: 'هندسة الميكاترونكس',
  });

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  // Navigation tab for logged-in student
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Curriculum content state
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedExplainedLesson, setSelectedExplainedLesson] = useState<ExplainLessonResult | null>(null);
  const [smartDoctorMode, setSmartDoctorMode] = useState<'explain' | 'solve-exam' | 'test-me'>('explain');

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInitialTopic, setAiInitialTopic] = useState('');
  const [examModalConfig, setExamModalConfig] = useState<{
    isOpen: boolean;
    subject: Subject;
    lesson?: Lesson | null;
    customLessonTitle?: string;
    customLessonContent?: any;
  } | null>(null);

  const handleOpenExamModal = (
    subject?: Subject,
    lesson?: Lesson | null,
    customLessonTitle?: string,
    customLessonContent?: any
  ) => {
    const targetSubject = subject || (lesson ? subjects.find((s) => s.id === lesson.subjectId) : null) || subjects[0];
    setExamModalConfig({
      isOpen: true,
      subject: targetSubject,
      lesson: lesson || null,
      customLessonTitle,
      customLessonContent,
    });
  };

  // Settings
  const [whatsappNumber, setWhatsappNumber] = useState('785500075');
  const [monthlyPriceUSD, setMonthlyPriceUSD] = useState(20);
  const [yearlyPriceUSD, setYearlyPriceUSD] = useState(200);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('mct_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Persist student profile changes
  useEffect(() => {
    if (student) {
      localStorage.setItem('mct_student', JSON.stringify(student));
    } else {
      localStorage.removeItem('mct_student');
    }
  }, [student]);

  // Check URL hash for admin entry point (#admin or /admin)
  useEffect(() => {
    const checkAdminHash = () => {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
        setIsAdminOpen(true);
      }
    };
    checkAdminHash();
    window.addEventListener('hashchange', checkAdminHash);
    return () => window.removeEventListener('hashchange', checkAdminHash);
  }, []);

  // Validate authenticated session on mount (Backend is the authoritative source of truth)
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('mct_auth_token');
      if (!token) {
        setIsVerifyingSession(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.student) {
            setStudent(data.student);
            setOnboardingStep('dashboard');
          } else {
            setStudent(null);
            setOnboardingStep('welcome');
          }
        } else {
          // Token expired, invalid, or unauthorized
          localStorage.removeItem('mct_auth_token');
          localStorage.removeItem('mct_student');
          setStudent(null);
          setOnboardingStep('welcome');
        }
      } catch (e) {
        console.warn('Auth check skipped (offline or network error)', e);
      } finally {
        setIsVerifyingSession(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch settings & subjects from backend
  const fetchSettingsAndSubjects = async () => {
    try {
      const sRes = await fetch('/api/settings');
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.whatsappNumber) setWhatsappNumber(sData.whatsappNumber);
        if (sData.monthlyPriceUSD) setMonthlyPriceUSD(sData.monthlyPriceUSD);
        if (sData.yearlyPriceUSD) setYearlyPriceUSD(sData.yearlyPriceUSD);
      }

      const subjRes = await fetch('/api/subjects');
      if (subjRes.ok) {
        const subjData = await subjRes.json();
        if (subjData.subjects && subjData.subjects.length > 0) {
          setSubjects(subjData.subjects);
        }
      }
    } catch (e) {
      console.warn('Backend server offline, using local data', e);
    }
  };

  useEffect(() => {
    fetchSettingsAndSubjects();
  }, []);

  // Handlers
  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleStartRegistration = () => {
    setOnboardingStep('registration');
  };

  const handleOpenLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (loggedInStudent: StudentProfile, token: string) => {
    setStudent(loggedInStudent);
    localStorage.setItem('mct_auth_token', token);
    localStorage.setItem('mct_student', JSON.stringify(loggedInStudent));
    setIsLoginModalOpen(false);
    setOnboardingStep('dashboard');
    setActiveTab('dashboard');
  };

  const handleRegistrationProceed = (data: {
    name: string;
    phone: string;
    university: string;
    studyLevel: any;
    major: string;
    email?: string;
  }) => {
    setRegData(data);
    setOnboardingStep('plans');
  };

  const handleSelectPlan = (plan: 'monthly' | 'yearly') => {
    setSelectedPlan(plan);
    setOnboardingStep('payment');
  };

  const handleActivationSuccess = (activatedStudent: StudentProfile) => {
    setStudent(activatedStudent);
    localStorage.setItem('mct_student', JSON.stringify(activatedStudent));
    setOnboardingStep('dashboard');
    setActiveTab('dashboard');
  };

  const handleExploreAsGuest = () => {
    const guestProfile: StudentProfile = {
      id: 'guest-' + Date.now(),
      name: 'طالب زائر (تجربة مجانية)',
      phone: '770000000',
      university: 'الجامعة الإماراتية الدولية – صنعاء',
      studyLevel: 'السنة الأولى',
      major: 'هندسة الميكاترونكس',
      role: 'student',
      isActivated: true,
      isExpired: false,
      remainingDays: 7,
      completedLessons: [],
      quizScores: {},
    };
    setStudent(guestProfile);
    setOnboardingStep('dashboard');
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    if (confirm('هل تريد بالتأكيد تسجيل الخروج من حسابك؟')) {
      setStudent(null);
      localStorage.removeItem('mct_auth_token');
      localStorage.removeItem('mct_student');
      setOnboardingStep('welcome');
      setSelectedSubjectId(null);
      setSelectedLessonId(null);
      setSelectedExplainedLesson(null);
    }
  };

  const handleOpenAiWithTopic = (topic: string) => {
    if (!student || !student.isActivated) {
      alert('ميزة المساعد الذكي متاحة للمشتركين بعد تفعيل الحساب.');
      return;
    }
    setAiInitialTopic(topic);
    setIsAiModalOpen(true);
  };

  const handleMarkLessonComplete = async (lessonId: string, quizScore?: number) => {
    if (!student) return;

    const updatedCompleted = student.completedLessons?.includes(lessonId)
      ? student.completedLessons
      : [...(student.completedLessons || []), lessonId];

    const updatedQuizScores = { ...student.quizScores };
    if (quizScore !== undefined) {
      updatedQuizScores[lessonId] = quizScore;
    }

    const updatedStudent: StudentProfile = {
      ...student,
      completedLessons: updatedCompleted,
      quizScores: updatedQuizScores,
    };

    setStudent(updatedStudent);

    // Sync with backend API
    try {
      const token = localStorage.getItem('mct_auth_token');
      await fetch('/api/student/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          studentId: student.id,
          completedLessonId: lessonId,
          quizScore: quizScore !== undefined ? { lessonId, percentage: quizScore } : undefined,
        }),
      });
    } catch (e) {
      console.warn('Sync failed', e);
    }
  };

  // Find currently active lesson object
  const activeLesson = lessons.find((l) => l.id === selectedLessonId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-blue-600 selection:text-white">
      
      {/* Top Header */}
      <Header
        student={student}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAiModal={() => {
          if (!student || !student.isActivated) {
            alert('يرجى تفعيل اشتراكك لاستخدام مساعد الذكاء الاصطناعي.');
            return;
          }
          setAiInitialTopic('');
          setIsAiModalOpen(true);
        }}
        onOpenExplainLesson={() => {
          if (!student || !student.isActivated) {
            alert('يرجى تفعيل اشتراكك للوصول إلى ميزة اشرح لي درس اليوم.');
            return;
          }
          setActiveTab('explain');
          setSelectedLessonId(null);
          setSelectedExplainedLesson(null);
        }}
        onOpenAssignments={() => {
          setActiveTab('assignments');
          setSelectedLessonId(null);
          setSelectedExplainedLesson(null);
        }}
        onOpenArduino={() => {
          setActiveTab('arduino');
          setSelectedLessonId(null);
          setSelectedExplainedLesson(null);
        }}
        onOpenLab={() => {
          setActiveTab('lab');
          setSelectedLessonId(null);
          setSelectedExplainedLesson(null);
        }}
        onOpenCalculator={() => {
          setActiveTab('calculator');
          setSelectedLessonId(null);
          setSelectedExplainedLesson(null);
        }}
        onOpenLearningPath={() => {
          setActiveTab('learning-path');
          setSelectedLessonId(null);
          setSelectedExplainedLesson(null);
        }}
        onOpenReferences={() => {
          setActiveTab('references');
          setSelectedLessonId(null);
          setSelectedExplainedLesson(null);
        }}
        onOpenVideos={() => {
          if (student) {
            setActiveTab('videos');
            setSelectedLessonId(null);
            setSelectedExplainedLesson(null);
          } else {
            setOnboardingStep('videos');
          }
        }}
        onOpenSmartDoctor={() => {
          if (student) {
            setActiveTab('smart-doctor');
            setSelectedLessonId(null);
            setSelectedExplainedLesson(null);
          } else {
            setOnboardingStep('smart-doctor');
          }
        }}
        onOpenDailyChallenge={() => {
          if (student) {
            setActiveTab('daily-challenge');
            setSelectedLessonId(null);
            setSelectedExplainedLesson(null);
          } else {
            setOnboardingStep('daily-challenge');
          }
        }}
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleStartRegistration}
        onOpenActivation={() => setOnboardingStep('code')}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenGuide={() => setIsPlatformGuideOpen(true)}
        onLogout={handleLogout}
        onNavigateHome={() => {
          if (student) {
            setOnboardingStep('dashboard');
            setActiveTab('dashboard');
            setSelectedSubjectId(null);
            setSelectedLessonId(null);
            setSelectedExplainedLesson(null);
          } else {
            setOnboardingStep('welcome');
          }
        }}
      />

      {/* Main Container Area */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 ${student ? 'pb-24 md:pb-8' : 'pb-8'}`}>
        
        {/* Session Verification Loader */}
        {isVerifyingSession ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
              جاري التحقق من الحساب والاشتراك من الخادم...
            </p>
          </div>
        ) : !student ? (
          <div>
            {onboardingStep === 'welcome' && (
              <WelcomeView
                onRegister={handleStartRegistration}
                onLogin={handleOpenLogin}
                onOpenActivation={() => setOnboardingStep('code')}
                onOpenAdmin={() => setIsAdminOpen(true)}
                onOpenVideos={() => setOnboardingStep('videos')}
                onOpenSmartDoctor={() => setOnboardingStep('smart-doctor')}
                onExploreAsGuest={handleExploreAsGuest}
                onOpenGuide={() => setIsPlatformGuideOpen(true)}
                onOpenExplainLesson={() => {
                  setSmartDoctorMode('explain');
                  setOnboardingStep('smart-doctor');
                }}
                onOpenCalculator={() => {
                  handleExploreAsGuest();
                  setTimeout(() => setActiveTab('calculator'), 100);
                }}
                onOpenArduino={() => {
                  handleExploreAsGuest();
                  setTimeout(() => setActiveTab('arduino'), 100);
                }}
                onOpenLab={() => setOnboardingStep('physics-lab')}
                onOpenPhysicsLab={() => setOnboardingStep('physics-lab')}
                onOpenReferences={() => {
                  handleExploreAsGuest();
                  setTimeout(() => setActiveTab('references'), 100);
                }}
                onOpenSubjects={() => {
                  handleExploreAsGuest();
                  setTimeout(() => setActiveTab('dashboard'), 100);
                }}
                onOpenDailyChallenge={() => {
                  setSmartDoctorMode('solve-exam');
                  setOnboardingStep('smart-doctor');
                }}
                onOpenProgress={() => {
                  handleExploreAsGuest();
                  setTimeout(() => setActiveTab('learning-path'), 100);
                }}
                subjects={subjects}
                monthlyPriceUSD={monthlyPriceUSD}
                yearlyPriceUSD={yearlyPriceUSD}
              />
            )}
            {onboardingStep === 'videos' && (
              <ExplanationVideosView
                onBack={() => setOnboardingStep('welcome')}
                onOpenAiWithTopic={(topic) => handleOpenAiWithTopic(topic)}
                onOpenSerwayReference={() => {
                  handleExploreAsGuest();
                  setTimeout(() => setActiveTab('references'), 100);
                }}
              />
            )}
            {onboardingStep === 'smart-doctor' && (
              <SmartDoctorProView
                student={null}
                initialMode={smartDoctorMode}
                onBackToDashboard={() => setOnboardingStep('welcome')}
              />
            )}

            {onboardingStep === 'physics-lab' && (
              <InteractivePhysicsLabView
                student={null}
                onBackToDashboard={() => setOnboardingStep('welcome')}
                onAskDoctorAboutTopic={() => {
                  setSmartDoctorMode('explain');
                  setOnboardingStep('smart-doctor');
                }}
              />
            )}

            {onboardingStep === 'daily-challenge' && (
              <DailyChallengeView
                student={null}
                onBackToDashboard={() => setOnboardingStep('welcome')}
              />
            )}

            {onboardingStep === 'registration' && (
              <RegistrationView
                onProceedToPlans={handleRegistrationProceed}
                onBack={() => setOnboardingStep('welcome')}
                onOpenLogin={handleOpenLogin}
                onOpenGuide={() => setIsPlatformGuideOpen(true)}
                onRegistrationSuccess={handleActivationSuccess}
              />
            )}

            {onboardingStep === 'plans' && (
              <SubscriptionView
                monthlyPriceUSD={monthlyPriceUSD}
                yearlyPriceUSD={yearlyPriceUSD}
                onSelectPlan={handleSelectPlan}
                onBack={() => setOnboardingStep('registration')}
              />
            )}

            {onboardingStep === 'payment' && (
              <PaymentInstructionsView
                studentData={regData}
                selectedPlan={selectedPlan}
                whatsappNumber={whatsappNumber}
                onProceedToCodeEntry={() => setOnboardingStep('code')}
                onBack={() => setOnboardingStep('plans')}
              />
            )}

            {onboardingStep === 'code' && (
              <ActivationCodeView
                onActivationSuccess={handleActivationSuccess}
                onBack={() => setOnboardingStep('welcome')}
                onOpenRegister={handleStartRegistration}
                whatsappNumber={whatsappNumber}
              />
            )}
          </div>
        ) : student ? (
          <div>
            {/* Direct Activation Code Entry Screen (if requested by student) */}
            {onboardingStep === 'code' ? (
              <ActivationCodeView
                onActivationSuccess={handleActivationSuccess}
                onBack={() => setOnboardingStep('dashboard')}
                whatsappNumber={whatsappNumber}
              />
            ) : selectedLessonId && activeLesson ? (
              /* If a lesson is specifically opened, show LessonDetailView */
              <LessonDetailView
                lesson={activeLesson}
                onBack={() => setSelectedLessonId(null)}
                onOpenAiForLesson={(lessonTitle) => handleOpenAiWithTopic(`اشرح لي درس "${lessonTitle}" والمسائل المتعلقة به`)}
                onMarkComplete={handleMarkLessonComplete}
                isCompleted={student.completedLessons?.includes(activeLesson.id) || false}
                savedQuizScore={student.quizScores?.[activeLesson.id]}
                onOpenExam={(lesson) => handleOpenExamModal(undefined, lesson)}
              />
            ) : selectedLessonId && !activeLesson ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center space-y-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-slate-700 dark:text-slate-300 font-bold">الدرس المطلوب غير متوفر حاليًا أو قيد التحديث.</p>
                <button
                  onClick={() => setSelectedLessonId(null)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm cursor-pointer transition-all"
                >
                  العودة للدروس
                </button>
              </div>
            ) : (
              /* Main Student Navigation Tabs */
              <div>
                
                {/* 1. Dashboard Tab - Exactly matching the screenshot design */}
                {activeTab === 'dashboard' && (
                  <WelcomeView
                    student={student}
                    onRegister={handleStartRegistration}
                    onLogin={handleOpenLogin}
                    onLogout={handleLogout}
                    onOpenProfile={() => setIsProfileModalOpen(true)}
                    onOpenActivation={() => setOnboardingStep('code')}
                    onOpenAdmin={() => setIsAdminOpen(true)}
                    onOpenVideos={() => {
                      setActiveTab('videos');
                      setSelectedLessonId(null);
                      setSelectedExplainedLesson(null);
                    }}
                    onOpenSmartDoctor={() => {
                      setSmartDoctorMode('explain');
                      setActiveTab('smart-doctor');
                      setSelectedLessonId(null);
                      setSelectedExplainedLesson(null);
                    }}
                    onExploreAsGuest={handleExploreAsGuest}
                    onOpenGuide={() => setIsPlatformGuideOpen(true)}
                    onOpenExplainLesson={() => {
                      setSmartDoctorMode('explain');
                      setActiveTab('smart-doctor');
                      setSelectedLessonId(null);
                      setSelectedExplainedLesson(null);
                    }}
                    onOpenCalculator={() => {
                      setActiveTab('calculator');
                      setSelectedLessonId(null);
                      setSelectedExplainedLesson(null);
                    }}
                    onOpenArduino={() => {
                      setActiveTab('arduino');
                      setSelectedLessonId(null);
                      setSelectedExplainedLesson(null);
                    }}
                    onOpenLab={() => {
                      setActiveTab('physics-lab');
                      setSelectedLessonId(null);
                      setSelectedExplainedLesson(null);
                    }}
                    onOpenPhysicsLab={() => {
                      setActiveTab('physics-lab');
                      setSelectedLessonId(null);
                      setSelectedExplainedLesson(null);
                    }}
                    onOpenReferences={() => {
                      setActiveTab('references');
                      setSelectedLessonId(null);
                      setSelectedExplainedLesson(null);
                    }}
                    onOpenSubjects={(track) => {
                      setActiveTab('subjects');
                      setSelectedLessonId(null);
                      setSelectedExplainedLesson(null);
                    }}
                    onOpenDailyChallenge={() => {
                      setActiveTab('daily-challenge');
                      setSelectedLessonId(null);
                      setSelectedExplainedLesson(null);
                    }}
                    onOpenProgress={() => {
                      setActiveTab('learning-path');
                      setSelectedLessonId(null);
                      setSelectedExplainedLesson(null);
                    }}
                    onOpenAiModal={() => handleOpenAiWithTopic('')}
                    subjects={subjects}
                    monthlyPriceUSD={monthlyPriceUSD}
                    yearlyPriceUSD={yearlyPriceUSD}
                  />
                )}

                {/* Sub-view Universal Return Bar (Guarantees Student Never Gets Lost) */}
                {activeTab !== 'dashboard' && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 mb-6 shadow-xs flex items-center justify-between gap-3 animate-fade-in" dir="rtl">
                    <button
                      onClick={() => {
                        setActiveTab('dashboard');
                        setSelectedSubjectId(null);
                        setSelectedLessonId(null);
                        setSelectedExplainedLesson(null);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm cursor-pointer transition-all shadow-xs active:scale-95"
                    >
                      <span>←</span>
                      <span>العودة للرئيسية (خدمات الأكاديمية)</span>
                    </button>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100 text-xs sm:text-sm truncate">
                      {activeTab === 'physics-lab' && '🔬 المختبر الفيزيائي التفاعلي (ميكانيكا وحركة 3D)'}
                      {activeTab === 'explain' && '💡 اشرح لي درس اليوم (نص، صورة أو فيديو)'}
                      {activeTab === 'smart-doctor' && '🏛️ القاعة الدراسية — الدكتور والسبورة الذكية'}
                      {activeTab === 'subjects' && '📚 المقررات الهندسية'}
                      {activeTab === 'calculator' && '📐 الحاسبة الهندسية المتطورة'}
                      {activeTab === 'arduino' && '🕹️ المحاكاة الهندسية (Arduino والدوائر)'}
                      {activeTab === 'lab' && '🔬 مختبر المشاريع الهندسية الافتراضي'}
                      {activeTab === 'references' && '📖 المكتبة الرقمية ومرجع Serway'}
                      {activeTab === 'daily-challenge' && '📝 بنك الأسئلة وتحدي اليوم الهندسي'}
                      {activeTab === 'learning-path' && '📊 تقدمك الدراسي ومسار التعلم'}
                      {activeTab === 'videos' && '🎬 مكتبة فيديوهات الشرح'}
                      {activeTab === 'assignments' && '🎓 منشئ التكليفات الهندسية'}
                    </span>
                  </div>
                )}

                {/* 1.4 Educational Video Library Tab */}
                {activeTab === 'videos' && (
                  <EducationalVideoLibraryView
                    student={student}
                    onNavigateToTab={(tab) => {
                      if (['lab', 'circuits', 'arduino', 'dashboard', 'subjects'].includes(tab)) {
                        setActiveTab(tab as any);
                      }
                    }}
                  />
                )}

                {/* 1.45 Smart Doctor Pro Tab */}
                {activeTab === 'smart-doctor' && (
                  <SmartDoctorProView
                    student={student}
                    initialMode={smartDoctorMode}
                    onBackToDashboard={() => setActiveTab('dashboard')}
                  />
                )}

                {/* 1.48 Daily Mechatronics Challenge Tab */}
                {activeTab === 'daily-challenge' && (
                  <DailyChallengeView
                    student={student}
                    onBackToDashboard={() => setActiveTab('dashboard')}
                  />
                )}

                {/* 1.5 Personalized Learning Path Tab */}
                {activeTab === 'learning-path' && (
                  <PersonalizedLearningPathView
                    student={student}
                    subjects={subjects}
                    lessons={lessons}
                    onSelectLesson={(lessonId) => {
                      setSelectedLessonId(lessonId);
                    }}
                    onSelectSubject={(subjectId) => {
                      setSelectedSubjectId(subjectId);
                      setActiveTab('subjects');
                    }}
                    onNavigateToTool={(toolId) => {
                      if (['circuits', 'formulas', 'units', 'math', 'assignments', 'arduino', 'lab', 'calculator'].includes(toolId)) {
                        setActiveTab(toolId as any);
                      } else {
                        setActiveTab('formulas');
                      }
                    }}
                    onBackToDashboard={() => setActiveTab('dashboard')}
                  />
                )}

                {/* 2. Explain Lesson Tab ("اشرح لي درس اليوم") */}
                {activeTab === 'explain' && (
                  <SmartDoctorProView
                    student={student}
                    initialMode="explain"
                    onBackToDashboard={() => setActiveTab('dashboard')}
                  />
                )}

                {/* 2.5 Engineering Assignment Generator Tab ("منشئ التكليفات الهندسية") */}
                {activeTab === 'assignments' && (
                  <AssignmentGeneratorView
                    student={student}
                    onNavigateToTab={(tab) => {
                      setActiveTab(tab as any);
                      setSelectedLessonId(null);
                    }}
                  />
                )}

                {/* 2.6 Arduino & Electronic Circuit Simulator Tab ("محاكي Arduino والدوائر الإلكترونية") */}
                {activeTab === 'arduino' && (
                  <ArduinoSimulatorView />
                )}

                {/* 2.7 Smart Engineering Lab Tab ("مختبر المشاريع الهندسية الذكي") */}
                {activeTab === 'lab' && (
                  <ProjectLabView
                    student={student}
                    onNavigateHome={() => {
                      setActiveTab('dashboard');
                      setSelectedLessonId(null);
                      setSelectedExplainedLesson(null);
                    }}
                    onNavigateToTab={(tab) => {
                      setActiveTab(tab as any);
                      setSelectedLessonId(null);
                      if (tab !== 'explain') {
                        setSelectedExplainedLesson(null);
                      }
                    }}
                  />
                )}

                {/* 2.75 Interactive 3D Physics Lab Tab ("المختبر الفيزيائي التفاعلي") */}
                {activeTab === 'physics-lab' && (
                  <InteractivePhysicsLabView
                    student={student}
                    onBackToDashboard={() => {
                      setActiveTab('dashboard');
                      setSelectedLessonId(null);
                      setSelectedExplainedLesson(null);
                    }}
                    onAskDoctorAboutTopic={(topic) => {
                      setSmartDoctorMode('explain');
                      setActiveTab('smart-doctor');
                      setSelectedLessonId(null);
                      setSelectedExplainedLesson(null);
                    }}
                  />
                )}

                {/* 2.8 Scientific Calculator Tab ("الحاسبة العلمية") */}
                {activeTab === 'calculator' && (
                  <ScientificCalculatorView
                    onBackToDashboard={() => {
                      setActiveTab('dashboard');
                      setSelectedLessonId(null);
                    }}
                    onAskAiWithTopic={(topic) => handleOpenAiWithTopic(topic)}
                  />
                )}

                {/* 3. Subjects Tab */}
                {activeTab === 'subjects' && (
                  <SubjectsView
                    subjects={subjects}
                    lessons={lessons}
                    selectedSubjectId={selectedSubjectId}
                    onSelectSubject={(subjId) => setSelectedSubjectId(subjId)}
                    onSelectLesson={(lessonId) => {
                      setSelectedLessonId(lessonId);
                    }}
                    completedLessons={student.completedLessons || []}
                    onOpenExam={(subject, lesson) => handleOpenExamModal(subject, lesson)}
                  />
                )}

                {/* 4. Formula Analyzer Tab */}
                {activeTab === 'formulas' && (
                  <FormulaAnalyzerView
                    onAskAi={(formulaName) => handleOpenAiWithTopic(formulaName)}
                  />
                )}

                {/* 5. Unit Converter Tab */}
                {activeTab === 'units' && <UnitConverterView />}

                {/* 6. Circuits Lab Tab */}
                {activeTab === 'circuits' && <CircuitsHelperView />}

                {/* 7. Math Helper Tab */}
                {activeTab === 'math' && <MathHelperView />}

                {/* 8. References Library Tab ("مكتبة الكتب والمراجع — Serway") */}
                {activeTab === 'references' && (
                  <ReferencesLibraryView
                    student={student}
                    onExplainTopic={(topic) => {
                      setSelectedExplainedLesson(null);
                      setSelectedLessonId(null);
                      setActiveTab('explain');
                      window.dispatchEvent(new CustomEvent('mct_explain_topic', { detail: { topic } }));
                    }}
                    onOpenTool={(toolId) => {
                      if (['videos', 'circuits', 'formulas', 'units', 'math', 'assignments', 'arduino', 'lab', 'calculator'].includes(toolId)) {
                        setActiveTab(toolId as any);
                      } else {
                        setActiveTab('formulas');
                      }
                    }}
                    onBackToDashboard={() => setActiveTab('dashboard')}
                  />
                )}

              </div>
            )}

          </div>
        ) : null}

      </main>

      {/* Mobile Bottom Navigation Bar (Visible only inside sub-tools for quick access) */}
      {student && activeTab !== 'dashboard' && (
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'ai') {
              handleOpenAiWithTopic('');
            } else {
              setActiveTab(tab);
              setSelectedLessonId(null);
              if (tab !== 'explain') {
                setSelectedExplainedLesson(null);
              }
            }
          }}
        />
      )}

      {/* Student Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onOpenRegister={() => {
          setIsLoginModalOpen(false);
          setOnboardingStep('registration');
        }}
        onOpenActivation={() => {
          setIsLoginModalOpen(false);
          setOnboardingStep('code');
        }}
        whatsappNumber={whatsappNumber}
      />

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialTopic={aiInitialTopic}
        currentLessonTitle={activeLesson?.title}
        currentSubjectName={subjects.find((s) => s.id === activeLesson?.subjectId)?.name}
      />

      {/* Student Profile & Settings Modal */}
      {student && (
        <StudentProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          student={student}
          onUpdateStudent={(updated) => {
            setStudent(updated);
            localStorage.setItem('mct_student', JSON.stringify(updated));
          }}
          onOpenActivation={() => {
            setIsProfileModalOpen(false);
            setOnboardingStep('code');
          }}
          onLogout={handleLogout}
        />
      )}

      {/* Admin Panel Modal */}
      <AdminPanelView
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onSubjectsUpdated={() => fetchSettingsAndSubjects()}
      />

      {/* Expected Exam Paper Modal (PDF & Image Export) */}
      {examModalConfig?.isOpen && (
        <ExamModal
          isOpen={examModalConfig.isOpen}
          onClose={() => setExamModalConfig(null)}
          subject={examModalConfig.subject}
          lesson={examModalConfig.lesson}
          customLessonTitle={examModalConfig.customLessonTitle}
          customLessonContent={examModalConfig.customLessonContent}
          student={student || undefined}
        />
      )}

      {/* Platform Detailed Usage Guide Modal */}
      <PlatformGuideModal
        isOpen={isPlatformGuideOpen}
        onClose={() => setIsPlatformGuideOpen(false)}
        onOpenRegister={handleStartRegistration}
      />

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-700 dark:text-slate-300">
            أكاديمية الميكاترونكس اليمنية © {new Date().getFullYear()} – "افهم الميكاترونكس بطريقة سهلة"
          </p>
          <p>
            مخصصة لطلاب الميكاترونكس في الجامعات اليمنيه للتفعيل والتواصل عبر واتساب 785500075
          </p>
          <div className="pt-1 flex items-center justify-center gap-4 text-[11px]">
            <button
              onClick={handleOpenLogin}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:underline cursor-pointer"
            >
              دخول الطلاب
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
