import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import {
  Trophy,
  Flame,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Zap,
  BookOpen,
  ArrowLeft,
  Users,
  Target,
  Lightbulb,
  Check,
  RefreshCw,
  ShieldCheck,
  Compass
} from 'lucide-react';

interface DailyChallengeViewProps {
  student: StudentProfile | null;
  onBackToDashboard?: () => void;
}

export interface ChallengeData {
  id: string;
  date: string;
  title: string;
  category: string;
  categoryLabel: string;
  difficulty: 'سهل' | 'متوسط' | 'متقدم';
  xpReward: number;
  problemText: string;
  givenData: string[];
  latexFormula?: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  stepByStepSolution: string[];
  hint: string;
  realWorldApplication: string;
}

export interface LeaderboardUser {
  rank: number;
  studentId: string;
  studentName: string;
  university: string;
  major: string;
  totalXp: number;
  currentStreak: number;
  totalSolved: number;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  student,
  onBackToDashboard
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'leaderboard' | 'archive'>('today');

  // Today's Challenge State
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [scoreEarned, setScoreEarned] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Student stats
  const [studentXp, setStudentXp] = useState<number>(0);
  const [studentStreak, setStudentStreak] = useState<number>(0);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(86400);

  // Leaderboard & Archive State
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [archive, setArchive] = useState<ChallengeData[]>([]);

  // Fetch today's challenge data
  useEffect(() => {
    const fetchChallenge = async () => {
      setIsLoading(true);
      try {
        const studentId = student?.id || '';
        const token = localStorage.getItem('token') || localStorage.getItem('mct_token');

        const res = await fetch(`/api/daily-challenge?studentId=${encodeURIComponent(studentId)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          if (data.challenge) {
            setChallenge(data.challenge);
          }
          if (data.studentStats) {
            setStudentXp(data.studentStats.totalXp || 0);
            setStudentStreak(data.studentStats.currentStreak || 0);
          }
          if (data.userProgress) {
            setIsSubmitted(data.userProgress.solved);
            setIsCorrect(data.userProgress.solved);
            setScoreEarned(data.userProgress.scoreEarned || 0);
            if (data.userProgress.selectedOption !== undefined) {
              setSelectedOption(data.userProgress.selectedOption);
            }
          }
          if (data.nextChallengeCountdownSeconds) {
            setCountdownSeconds(data.nextChallengeCountdownSeconds);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch daily challenge:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/daily-challenge/leaderboard');
        if (res.ok) {
          const data = await res.json();
          if (data.leaderboard) {
            setLeaderboard(data.leaderboard);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch leaderboard:', err);
      }
    };

    const fetchArchive = async () => {
      try {
        const res = await fetch('/api/daily-challenge/archive');
        if (res.ok) {
          const data = await res.json();
          if (data.archive) {
            setArchive(data.archive);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch challenge archive:', err);
      }
    };

    fetchChallenge();
    fetchLeaderboard();
    fetchArchive();
  }, [student]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 86400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format timer
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Submit Answer Handler
  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !challenge) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('mct_token');

      const res = await fetch('/api/daily-challenge/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          studentId: student?.id || 'guest-' + Date.now(),
          studentName: student?.name || 'طالب ميكاترونكس',
          university: student?.university || 'الجامعة اليمنية',
          major: student?.major || 'هندسة الميكاترونكس',
          challengeId: challenge.id,
          selectedOption,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsSubmitted(true);
        setIsCorrect(data.isCorrect);
        if (data.isCorrect) {
          setScoreEarned(data.scoreEarned);
          setStudentXp(data.newTotalXp);
          setStudentStreak(data.newStreak);
        }
      }
    } catch (err) {
      console.warn('Error submitting challenge answer:', err);
      // Client-side fallback check
      const correct = selectedOption === challenge.correctOptionIndex;
      setIsSubmitted(true);
      setIsCorrect(correct);
      if (correct) {
        const reward = challenge.xpReward || 50;
        setScoreEarned(reward);
        setStudentXp((prev) => prev + reward);
        setStudentStreak((prev) => prev + 1);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Student Rank Label helper
  const getRankBadgeLabel = (xp: number) => {
    if (xp >= 1000) return { title: 'الخبير الأول في الميكاترونكس 👑', color: 'from-amber-500 to-yellow-600' };
    if (xp >= 500) return { title: 'مهندس تحكم وروبوتات محترف 🤖', color: 'from-indigo-600 to-purple-600' };
    if (xp >= 200) return { title: 'مهندس ميكاترونكس متقدم ⚡', color: 'from-blue-600 to-cyan-600' };
    return { title: 'مهندس ميكاترونكس مبتدئ 🎓', color: 'from-emerald-600 to-teal-600' };
  };

  const rankBadge = getRankBadgeLabel(studentXp);

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      
      {/* ======================================================== */}
      {/* 1. HERO & STATS HEADER BANNER */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-900/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>تحدي اليوم التقني — منافسة طلاب الميكاترونكس</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              🏆 تحدي الميكاترونكس اليومي
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              مسألة تقنية واحدة يومياً تختبر استيعابك لقوانين الدوائر، التحكم، الميكانيكا، والروبوتات. اجب صح من المحاولة الأولى واكسب نقاط XP وارتقِ في ترتيب جامعتك!
            </p>
          </div>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>العودة للرئيسية</span>
            </button>
          )}
        </div>

        {/* Live Student Gamification Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-900/60">
          {/* Streak */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold shrink-0">
              <Flame className="w-5 h-5 fill-orange-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">السلسلة اليومية</span>
              <span className="text-base sm:text-lg font-black text-white">{studentStreak} أيام متتالية</span>
            </div>
          </div>

          {/* Total XP */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">مجموع نقاط XP</span>
              <span className="text-base sm:text-lg font-black text-amber-300">{studentXp} XP</span>
            </div>
          </div>

          {/* Current Rank Badge */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block font-bold">اللقب الأكاديمي</span>
              <span className="text-xs font-black text-indigo-200 truncate block">{rankBadge.title}</span>
            </div>
          </div>

          {/* Countdown to Next Challenge */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">التحدي القادم خلال</span>
              <span className="text-base sm:text-lg font-mono font-black text-cyan-300">{formatTime(countdownSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-6 border-t border-indigo-900/60 mt-6 overflow-x-auto pb-1 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 rounded-xl font-black flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'today'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>🎯 تحدي اليوم</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl font-black flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>🏆 جدول المتصدرين ({leaderboard.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`px-4 py-2 rounded-xl font-black flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'archive'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📚 أرشيف التحديات المكتملة</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TAB 1: TODAY'S DAILY CHALLENGE CARD */}
      {/* ======================================================== */}
      {activeTab === 'today' && (
        <div>
          {isLoading ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              <p className="text-slate-600 dark:text-slate-300 text-sm font-bold">جاري تحميل تحدي اليوم...</p>
            </div>
          ) : challenge ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs">
                    {challenge.categoryLabel}
                  </span>
                  <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                    challenge.difficulty === 'سهل'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : challenge.difficulty === 'متوسط'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  }`}>
                    مستوى {challenge.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3.5 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>الجائزة عند الحل الصحيح: +{challenge.xpReward} XP</span>
                </div>
              </div>

              {/* Challenge Title & Problem Statement */}
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  {challenge.title}
                </h2>
                
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  <p>{challenge.problemText}</p>

                  {/* Given Data Bullet Points */}
                  {challenge.givenData && challenge.givenData.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 space-y-1 text-xs">
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400 block">📥 المعطيات وشروط التشغيل:</span>
                      <ul className="list-disc list-inside space-y-1 font-mono text-slate-700 dark:text-slate-300">
                        {challenge.givenData.map((g, i) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Formula LaTeX if available */}
                  {challenge.latexFormula && (
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center font-mono font-bold text-indigo-900 dark:text-indigo-200 text-sm dir-ltr">
                      {challenge.latexFormula}
                    </div>
                  )}
                </div>
              </div>

              {/* Question & Options List */}
              <div className="space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>{challenge.question}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {challenge.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isAnswerCorrect = isSubmitted && idx === challenge.correctOptionIndex;
                    const isAnswerWrong = isSubmitted && isSelected && idx !== challenge.correctOptionIndex;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (!isSubmitted) setSelectedOption(idx);
                        }}
                        disabled={isSubmitted}
                        className={`p-4 rounded-2xl border-2 text-right transition cursor-pointer flex items-center justify-between gap-3 text-xs sm:text-sm font-bold ${
                          isAnswerCorrect
                            ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-100 shadow-md'
                            : isAnswerWrong
                            ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-100 shadow-md'
                            : isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-100 shadow-md ring-2 ring-amber-500/30'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isAnswerCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                        {isAnswerWrong && <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons: Hint & Submit */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>{showHint ? 'إخفاء التلميح الأكاديمي' : '💡 هل تحتاج تلميحاً؟ (اضغط هنا)'}</span>
                </button>

                {!isSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null || isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري تحقق الإجابة...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>تأكيد الخيار وإرسال التحدي</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم إكمال تحدي اليوم بنجاح! عد غداً للمزيد.</span>
                  </div>
                )}
              </div>

              {/* Hint Card */}
              {showHint && challenge.hint && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <span className="font-extrabold flex items-center gap-1">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>التلميح الأكاديمي:</span>
                  </span>
                  <p className="leading-relaxed">{challenge.hint}</p>
                </div>
              )}

              {/* Submission Result Feedback & Engineering Solution Breakdown */}
              {isSubmitted && (
                <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  
                  {/* Status Banner */}
                  <div className={`p-5 rounded-2xl border flex items-center gap-4 ${
                    isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                      : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                  }`}>
                    {isCorrect ? (
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                        <XCircle className="w-6 h-6" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <h4 className="text-base font-black">
                        {isCorrect ? `إجابة صحيحة مذهلة! كسبت +${scoreEarned} XP 🎉` : 'إجابة غير دقيقة، راجع خطوات الحل وتدرب مجدداً!'}
                      </h4>
                      <p className="text-xs leading-relaxed opacity-90">
                        {challenge.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Step-by-Step Solution Breakdown */}
                  {challenge.stepByStepSolution && challenge.stepByStepSolution.length > 0 && (
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>خطوات الحل التفصيلية للمسألة:</span>
                      </h4>
                      <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                        {challenge.stepByStepSolution.map((step, i) => (
                          <li key={i} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 font-medium">
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Real-world Application */}
                  {challenge.realWorldApplication && (
                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                      <span className="font-extrabold flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-indigo-600" />
                        <span>التطبيق العملي في أنظمة الميكاترونكس والآلات:</span>
                      </span>
                      <p className="leading-relaxed">{challenge.realWorldApplication}</p>
                    </div>
                  )}

                </div>
              )}

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center text-xs text-slate-500">
              لا توجد بيانات تحدي حالياً.
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TAB 2: LEADERBOARD BOARD (جدول المتصدرين) */}
      {/* ======================================================== */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                <span>جدول المتصدرين في الجامعات اليمنية</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                ترتيب الطلاب المنافسين في حل التحديات اليومية ومجموع نقاط XP المكتسبة.
              </p>
            </div>
            <span className="px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-bold text-xs border border-amber-300 dark:border-amber-800">
              محدث مباشرة ⚡
            </span>
          </div>

          <div className="space-y-3">
            {leaderboard.map((user) => {
              const isCurrentStudent = student?.id && user.studentId === student.id;

              return (
                <div
                  key={user.studentId}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition ${
                    isCurrentStudent
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                      : user.rank === 1
                      ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-300 dark:border-amber-800'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Rank Badge */}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                      user.rank === 1
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : user.rank === 2
                        ? 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white'
                        : user.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {user.studentName}
                        </h4>
                        {isCurrentStudent && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black">أنت</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user.university} • {user.major}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0">
                    {/* Streak */}
                    <div className="hidden sm:flex items-center gap-1 font-bold text-orange-600 dark:text-orange-400">
                      <Flame className="w-4 h-4 fill-orange-400" />
                      <span>{user.currentStreak}d</span>
                    </div>

                    {/* Total XP */}
                    <div className="flex items-center gap-1 font-black text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{user.totalXp} XP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TAB 3: CHALLENGE ARCHIVE (أرشيف التحديات) */}
      {/* ======================================================== */}
      {activeTab === 'archive' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                <span>أرشيف المسائل والتحديات التدريبية</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                تدرب على التحديات السابقة واكتسب المهارات العملية في كافة مواد التخصص.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {archive.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {item.categoryLabel}
                    </span>
                    <span className="text-slate-400 font-bold text-[10px]">
                      +{item.xpReward} XP
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.problemText}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">مستوى {item.difficulty}</span>
                  <button
                    onClick={() => {
                      setChallenge(item);
                      setSelectedOption(null);
                      setIsSubmitted(false);
                      setActiveTab('today');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>فتح هذا التحدي</span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
