import React, { useState, useMemo } from 'react';
import { EXPLANATION_VIDEOS, ExplanationVideo, VideoTimestamp } from '../data/videoData';
import { 
  Play, 
  BookOpen, 
  Sparkles, 
  Clock, 
  Search, 
  GraduationCap, 
  ExternalLink, 
  CheckCircle2, 
  Layers, 
  Scale, 
  Lightbulb, 
  Bot, 
  ArrowRight,
  Filter,
  Video,
  ListVideo,
  Share2,
  Bookmark,
  Check
} from 'lucide-react';

interface ExplanationVideosViewProps {
  onBack?: () => void;
  onOpenAiWithTopic?: (topic: string) => void;
  onOpenSerwayReference?: () => void;
  initialVideoId?: string;
}

export const ExplanationVideosView: React.FC<ExplanationVideosViewProps> = ({
  onBack,
  onOpenAiWithTopic,
  onOpenSerwayReference,
  initialVideoId,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeVideoId, setActiveVideoId] = useState<string>(() => {
    return initialVideoId || EXPLANATION_VIDEOS[0].id;
  });
  const [activeTab, setActiveTab] = useState<'takeaways' | 'timestamps' | 'formulas' | 'serway' | 'quiz'>('takeaways');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [customVideoId, setCustomVideoId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Active Video
  const activeVideo = useMemo(() => {
    return EXPLANATION_VIDEOS.find((v) => v.id === activeVideoId) || EXPLANATION_VIDEOS[0];
  }, [activeVideoId]);

  // Filtered videos
  const filteredVideos = useMemo(() => {
    return EXPLANATION_VIDEOS.filter((video) => {
      const matchesSubject = selectedSubject === 'all' || video.subjectId === selectedSubject;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q || 
        video.title.toLowerCase().includes(q) ||
        video.englishTitle.toLowerCase().includes(q) ||
        video.instructor.toLowerCase().includes(q) ||
        video.description.toLowerCase().includes(q) ||
        video.tags.some((t) => t.toLowerCase().includes(q));
      return matchesSubject && matchesSearch;
    });
  }, [selectedSubject, searchQuery]);

  // Handle custom URL submission
  const handleLoadCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    // Extract YouTube ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = customUrl.match(regExp);
    if (match && match[2].length === 11) {
      setCustomVideoId(match[2]);
    } else {
      alert('يرجى إدخال رابط يوتيوب صحيح (YouTube Video URL)');
    }
  };

  const handleCopyLink = () => {
    const url = `https://www.youtube.com/watch?v=${customVideoId || activeVideo.youtubeId}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const currentYoutubeId = customVideoId || activeVideo.youtubeId;

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-blue-900/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <Video className="w-4 h-4 text-amber-400" />
              <span>مكتبة المحاضرات المرئية المعتمدة لطلاب الميكاترونكس</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              🎬 فيديوهات الشرح المعتمدة ومرجع Serway
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              شاهد محاضرات مصورة دقيقة، متطابقة مع مفردات جامعات اليمن ومرجع الفيزياء الدولي <strong>Serway</strong>، مع محاور زمنية (Timestamps)، ملخصات مكتوبة، وتحليل القوانين.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenSerwayReference && (
              <button
                onClick={onOpenSerwayReference}
                className="px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>تصفح مرجع Serway 📘</span>
              </button>
            )}

            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة للرئيسية</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN ACTIVE VIDEO THEATER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Cols: The Player & Deep Explanations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            {/* 16:9 Responsive Video Container */}
            <div className="relative w-full aspect-video bg-black">
              <iframe
                key={currentYoutubeId}
                src={`https://www.youtube-nocookie.com/embed/${currentYoutubeId}?rel=0&autoplay=0&modestbranding=1`}
                title={customVideoId ? 'فيديو مخصص' : activeVideo.title}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Video Controls / Info Header */}
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-4 text-right">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-extrabold">
                    {activeVideo.subjectName}
                  </span>
                  {activeVideo.referenceBook && (
                    <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300/60 dark:border-amber-700/60 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{activeVideo.referenceBook}</span>
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{activeVideo.duration}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="نسخ رابط الفيديو"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                    <span>{copiedLink ? 'تم النسخ!' : 'مشاركة'}</span>
                  </button>

                  <a
                    href={`https://www.youtube.com/watch?v=${currentYoutubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="فتح الفيديو في يوتيوب"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>فتح في YouTube</span>
                  </a>
                </div>
              </div>

              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  {customVideoId ? `فيديو مخصص من يوتيوب (ID: ${customVideoId})` : activeVideo.title}
                </h2>
                {!customVideoId && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    {activeVideo.englishTitle} • المُحاضر: {activeVideo.instructor} ({activeVideo.universityOrChannel})
                  </p>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {customVideoId ? 'تم تحميل هذا الفيديو عبر الرابط المخصص لمشاهدته داخل الأكاديمية.' : activeVideo.description}
              </p>

              {/* Action: Ask AI Doctor about this video */}
              {onOpenAiWithTopic && (
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onOpenAiWithTopic(`اشرح لي بالتفصيل موضوع فيديو "${activeVideo.title}" والقوانين والمسائل المتعلقة به وفق مرجع Serway`)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <Bot className="w-4 h-4 text-amber-300" />
                    <span>اسأل الدكتور الذكي عن هذا الفيديو 🎓</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sub-tabs below the video for in-depth educational material */}
            <div className="bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-700 text-xs">
                {[
                  { id: 'takeaways', label: '💡 أهم المفاهيم المستفادة', icon: Lightbulb },
                  { id: 'timestamps', label: '⏱️ محاور الفيديو (Timestamps)', icon: Clock },
                  { id: 'formulas', label: '📐 القوانين والمعادلات', icon: Scale },
                  { id: 'serway', label: '📘 الربط بمرجع Serway', icon: BookOpen },
                  { id: 'quiz', label: '🎯 تدريب واختبار سريع', icon: CheckCircle2 },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                      activeTab === t.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab 1: Key Takeaways */}
              {activeTab === 'takeaways' && (
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>النقاط الجوهرية التي يجب أن تفهمها من هذا الشرح:</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {activeVideo.keyTakeaways.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Timestamps */}
              {activeTab === 'timestamps' && (
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>فهرس موضوعات الفيديو والانتقال المباشر:</span>
                  </h3>
                  <div className="space-y-2">
                    {activeVideo.keyTimestamps.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs shrink-0">
                            ⏱️ {item.time}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.note}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Formulas */}
              {activeTab === 'formulas' && (
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-500" />
                    <span>القوانين والمعادلات الرياضية المشروحة في المقطع:</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {activeVideo.formulasCovered.map((f, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 dark:text-white">{f.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                            قانون معتمد
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-center text-sm font-bold shadow-inner" dir="ltr">
                          {f.formula}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {f.meaning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Serway Reference Link */}
              {activeTab === 'serway' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black">
                    <BookOpen className="w-5 h-5" />
                    <span>مطابقة المحتوى مع كتاب Physics for Scientists and Engineers — Serway</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    هذا الفيديو يغطي مفردات <strong>الفصل {activeVideo.chapterNumber || 1}</strong> من الطبعة الدولية المعتمدة لمرجع Serway في كليات الهندسة باليمن (جامعة صنعاء، الجامعة الإماراتية، وجامعة العلوم والتكنولوجيا).
                  </p>
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 space-y-1">
                    <span className="font-bold block">💡 نصيحة المذاكرة:</span>
                    <p className="text-[11px]">
                      شاهد الشرح المرئي أولاً لفهم المفهوم الهندسي، ثم انتقل إلى قسم المراجع لحل المسائل المختارة (Problems & Conceptual Questions) الموجودة بنهاية الفصل.
                    </p>
                  </div>
                  {onOpenSerwayReference && (
                    <button
                      onClick={onOpenSerwayReference}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-sm"
                    >
                      افتح بطاقة مرجع Serway في المكتبة 📘
                    </button>
                  )}
                </div>
              )}

              {/* Tab 5: Quick Quiz */}
              {activeTab === 'quiz' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>اختبر استيعابك للشرح فورًا:</span>
                    </h3>
                    {quizSubmitted && (
                      <button
                        onClick={() => {
                          setSelectedQuizAnswers({});
                          setQuizSubmitted(false);
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                      >
                        إعادة الاختبار
                      </button>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
                    <p className="font-bold text-slate-900 dark:text-white">
                      سؤال 1: عند تحليل متجه مقداره 100 نيوتن يصنع زاوية 30° مع المحور السيني، ما مقدار المركبة السينية Ax؟
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { val: 'a', label: 'Ax = 100 × cos(30°) ≈ 86.6 N', isCorrect: true },
                        { val: 'b', label: 'Ax = 100 × sin(30°) = 50 N', isCorrect: false },
                        { val: 'c', label: 'Ax = 100 / cos(30°) ≈ 115.4 N', isCorrect: false },
                        { val: 'd', label: 'Ax = 100 N', isCorrect: false },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          disabled={quizSubmitted}
                          onClick={() => setSelectedQuizAnswers((p) => ({ ...p, 1: opt.val }))}
                          className={`p-2.5 rounded-xl border text-right font-medium transition-all cursor-pointer ${
                            selectedQuizAnswers[1] === opt.val
                              ? quizSubmitted
                                ? opt.isCorrect
                                  ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                                  : 'bg-rose-50 dark:bg-rose-950 border-rose-500 text-rose-800 dark:text-rose-200'
                                : 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-800 dark:text-blue-200'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {!quizSubmitted && selectedQuizAnswers[1] && (
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                      >
                        تأكيد الإجابة
                      </button>
                    )}

                    {quizSubmitted && (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
                        <strong>التفسير:</strong> المركبة السينية المجاورة للزاوية تُحسب دائمًا من Ax = A·cos(θ) = 100 × 0.866 = 86.6 نيوتن.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Video Playlist & Search & Custom URL */}
        <div className="space-y-4">
          
          {/* Custom YouTube URL Loader Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white">
              <ExternalLink className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>تشغيل أي فيديو أو محاضرة من YouTube:</span>
            </div>
            <form onSubmit={handleLoadCustomUrl} className="space-y-2">
              <input
                type="text"
                placeholder="الصق رابط يوتيوب هنا (https://youtu.be/...)"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-black text-xs transition-all cursor-pointer shadow-sm"
              >
                تحميل وتشغيل في المشغل
              </button>
            </form>
            {customVideoId && (
              <button
                onClick={() => {
                  setCustomVideoId(null);
                  setCustomUrl('');
                }}
                className="text-[11px] text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer block text-center w-full"
              >
                العودة لقائمة فيديوهات الأكاديمية المعتمدة
              </button>
            )}
          </div>

          {/* Search & Subject Filter Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-slate-900 dark:text-white">
                <span className="flex items-center gap-1.5">
                  <ListVideo className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>فهرس المحاضرات المعتمدة</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                  {filteredVideos.length} فيديو
                </span>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ابحث في الفيديوهات أو القوانين..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-8 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Subject pills */}
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'physics', label: '📘 فيزياء 1 (Serway)' },
                  { id: 'circuits', label: '⚡ دوائر كهربائية' },
                  { id: 'programming', label: '🤖 برمجة C++' },
                  { id: 'mechatronics', label: '🔧 ميكاترونكس' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSubject(s.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedSubject === s.id
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Video List Items */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
              {filteredVideos.map((video) => {
                const isCurrent = video.id === activeVideoId && !customVideoId;
                return (
                  <div
                    key={video.id}
                    onClick={() => {
                      setActiveVideoId(video.id);
                      setCustomVideoId(null);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer text-right flex gap-3 items-start ${
                      isCurrent
                        ? 'bg-blue-50/90 dark:bg-blue-950/60 border-blue-500 dark:border-blue-500 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-300'
                    }`}
                  >
                    {/* Thumbnail preview */}
                    <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 shadow-xs border border-slate-800">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className={`w-4 h-4 ${isCurrent ? 'text-amber-400 fill-amber-400' : 'text-white fill-white'}`} />
                      </div>
                      <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded text-[9px] bg-black/80 text-white font-mono font-bold">
                        {video.duration}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 truncate">
                          {video.subjectName}
                        </span>
                        {video.isFreePreview && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold shrink-0">
                            متاح مجانًا
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-2 leading-tight">
                        {video.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {video.instructor}
                      </p>
                    </div>
                  </div>
                );
              })}

              {filteredVideos.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                  <p>لم يتم العثور على فيديوهات تطابق بحثك.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSubject('all');
                    }}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    عرض كل الفيديوهات
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
