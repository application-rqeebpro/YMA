import React, { useState, useEffect } from 'react';
import {
  Search,
  Video,
  Play,
  Star,
  Share2,
  Bookmark,
  ExternalLink,
  PlusCircle,
  Filter,
  CheckCircle2,
  Sparkles,
  Layers,
  GraduationCap,
  Building2,
  Wrench,
  AlertTriangle,
  X,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { EducationalVideo, StudyLevel, StudentProfile, VideoExplanationRequest } from '../types';

interface EducationalVideoLibraryViewProps {
  student: StudentProfile | null;
  onNavigateToTab?: (tab: string) => void;
}

export const EducationalVideoLibraryView: React.FC<EducationalVideoLibraryViewProps> = ({
  student,
  onNavigateToTab,
}) => {
  const [videos, setVideos] = useState<EducationalVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Filters State
  const [selectedSubject, setSelectedSubject] = useState<string>('جميع المواد');
  const [selectedLevel, setSelectedLevel] = useState<string>('جميع المستويات');
  const [selectedUniversity, setSelectedUniversity] = useState<string>('جميع الجامعات');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('جميع المنصات');
  const [showYemeniOnly, setShowYemeniOnly] = useState<boolean>(false);
  const [showBestOnly, setShowBestOnly] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'yemen' | 'best' | 'levels' | 'universities' | 'favorites' | 'request'>('all');

  // Active Video Modal
  const [activeVideo, setActiveVideo] = useState<EducationalVideo | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<EducationalVideo[]>([]);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Favorites & Study List State (Stored in localStorage)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mct_video_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Request Explanation Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [requestSubject, setRequestSubject] = useState<string>('');
  const [requestTopic, setRequestTopic] = useState<string>('');
  const [requestLevel, setRequestLevel] = useState<StudyLevel>('السنة الأولى');
  const [requestDescription, setRequestDescription] = useState<string>('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState<boolean>(false);

  // Quick Search Suggestions Tags
  const QUICK_TAGS = [
    'فيزياء',
    'دوائر كهربائية',
    'برمجة',
    'Arduino',
    'PLC',
    'Control',
    'MATLAB',
    'CAD',
    'CNC',
    'Pneumatics',
    'Robotics',
    'Sensors',
    'Electronics',
  ];

  // Fetch Videos from Backend API
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedSubject !== 'جميع المواد') params.append('subject', selectedSubject);
      if (selectedLevel !== 'جميع المستويات') params.append('level', selectedLevel);
      if (selectedUniversity !== 'جميع الجامعات') params.append('university', selectedUniversity);
      if (selectedPlatform !== 'جميع المنصات') params.append('platform', selectedPlatform);
      if (showYemeniOnly || activeTab === 'yemen') params.append('isYemeniOnly', 'true');
      if (showBestOnly || activeTab === 'best') params.append('isBestOnly', 'true');

      const res = await fetch(`/api/videos?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      }
    } catch (err) {
      console.warn('Failed to fetch videos from server:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [searchQuery, selectedSubject, selectedLevel, selectedUniversity, selectedPlatform, showYemeniOnly, showBestOnly, activeTab]);

  // Toggle Favorite
  const toggleFavorite = (id: string, evt?: React.MouseEvent) => {
    if (evt) evt.stopPropagation();
    let updated: string[];
    if (favoriteIds.includes(id)) {
      updated = favoriteIds.filter((favId) => favId !== id);
      showToast('تمت إزالة الفيديو من قائمتك المفضلة');
    } else {
      updated = [...favoriteIds, id];
      showToast('⭐ تم حفظ الفيديو في قائمة مفضلاتك الهندسية');
    }
    setFavoriteIds(updated);
    try {
      localStorage.setItem('mct_video_favorites', JSON.stringify(updated));
    } catch {
      // ignore localstorage error
    }
  };

  // Share Video Link
  const handleShareVideo = (video: EducationalVideo, evt?: React.MouseEvent) => {
    if (evt) evt.stopPropagation();
    const shareUrl = `${window.location.origin}/#video-${video.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLinkId(video.id);
      showToast('📋 تم نسخ رابط الفيديو بنجاح لمشاركته مع زملائك');
      setTimeout(() => setCopiedLinkId(null), 2500);
    }
  };

  // Open Video Modal & Increment View
  const handleOpenVideoModal = async (video: EducationalVideo) => {
    setActiveVideo(video);
    try {
      const res = await fetch(`/api/videos/${video.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.video) setActiveVideo(data.video);
        if (data.related) setRelatedVideos(data.related);
      }
    } catch {
      // ignore error
    }
  };

  // Handle Submit Lecture Request
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestSubject.trim() || !requestTopic.trim()) {
      showToast('يرجى ملء المادة والموضوع المطلوب.');
      return;
    }

    setIsSubmittingRequest(true);
    try {
      const res = await fetch('/api/videos/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student?.name || 'طالب ميكاترونكس',
          studentId: student?.id || 'anon',
          subject: requestSubject,
          topic: requestTopic,
          level: requestLevel,
          description: requestDescription,
        }),
      });

      if (res.ok) {
        showToast('🚀 تم إرسال طلب الشرح بنجاح! سيقوم مالك الأكاديمية بالبحث عن أفضل مقطع وإضافته للمكتبة.');
        setIsRequestModalOpen(false);
        setRequestSubject('');
        setRequestTopic('');
        setRequestDescription('');
      }
    } catch {
      showToast('تعذر إرسال الطلب، يرجى المحاولة لاحقاً.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Filtered list for Favorites Tab
  const displayedVideos = activeTab === 'favorites'
    ? videos.filter((v) => favoriteIds.includes(v.id))
    : videos;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-cyan-300 border border-cyan-500/40 px-5 py-2.5 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-inner">
            <Video className="w-4 h-4 text-cyan-400" />
            <span>نقطة وصول واحدة لشروحات الميكاترونكس</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            🎥 مكتبة الفيديوهات التعليمية
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            كل شروحات الميكاترونكس التي يحتاجها الطالب في مكان واحد — بدون تشتت بين YouTube و Facebook و Instagram و TikTok.
          </p>
        </div>

        {/* Large Search Bar */}
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 ابحث عن مادة، محاضرة، أو موضوع (مثل: فيزياء، دوائر، PLC، قانون أوم...)"
              className="w-full py-4 pr-12 pl-4 rounded-2xl bg-slate-900/90 border-2 border-slate-700 text-white placeholder-slate-400 font-medium text-xs sm:text-sm focus:outline-none focus:border-cyan-400 shadow-xl transition"
            />
            <Search className="w-5 h-5 text-cyan-400 absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none" />
          </div>

          {/* Quick Search Tags */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-bold shrink-0">أشهر مواضيع البحث:</span>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                  searchQuery === tag
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Tabbed Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'all' ? 'bg-cyan-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>جميع الفيديوهات</span>
          </button>

          <button
            onClick={() => setActiveTab('yemen')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'yemen' ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🇾🇪 الميكاترونكس في اليمن</span>
          </button>

          <button
            onClick={() => setActiveTab('best')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'best' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>🏆 أفضل شرح</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'favorites' ? 'bg-purple-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>مفضلاتي ({favoriteIds.length})</span>
          </button>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>➕ اطلب شرحاً</span>
        </button>
      </div>

      {/* Secondary Filter Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
        {/* Filter Level */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold block flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
            <span>المستوى الدراسي:</span>
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2 font-medium focus:outline-none focus:border-cyan-400"
          >
            <option value="جميع المستويات">جميع المستويات</option>
            <option value="السنة الأولى">السنة الأولى</option>
            <option value="السنة الثانية">السنة الثانية</option>
            <option value="السنة الثالثة">السنة الثالثة</option>
            <option value="السنة الرابعة">السنة الرابعة</option>
          </select>
        </div>

        {/* Filter University */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold block flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>الجامعة:</span>
          </label>
          <select
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2 font-medium focus:outline-none focus:border-cyan-400"
          >
            <option value="جميع الجامعات">جميع الجامعات</option>
            <option value="جامعة صنعاء">جامعة صنعاء</option>
            <option value="جامعة ذمار">جامعة ذمار</option>
            <option value="الجامعة التخصصية الحديثة">الجامعة التخصصية الحديثة</option>
            <option value="الجامعة الإماراتية الدولية – صنعاء">الجامعة الإماراتية الدولية</option>
            <option value="جامعة العلوم والتكنولوجيا">جامعة العلوم والتكنولوجيا</option>
          </select>
        </div>

        {/* Filter Subject */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold block flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>المادة الهندسية:</span>
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2 font-medium focus:outline-none focus:border-cyan-400"
          >
            <option value="جميع المواد">جميع المواد</option>
            <option value="الدوائر الكهربائية">الدوائر الكهربائية</option>
            <option value="الفيزياء">الفيزياء</option>
            <option value="Arduino">Arduino</option>
            <option value="PLC">PLC</option>
            <option value="Control">التحكم الآلي (Control)</option>
            <option value="Robotics">الروبوتات (Robotics)</option>
            <option value="Actuators">المحركات (Actuators)</option>
            <option value="Pneumatics">النيوماتيك والهيدروليك</option>
            <option value="CNC">CNC و G-Code</option>
          </select>
        </div>

        {/* Filter Platform */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold block flex items-center gap-1">
            <Video className="w-3.5 h-3.5 text-purple-400" />
            <span>المنصة الأصلية:</span>
          </label>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2 font-medium focus:outline-none focus:border-cyan-400"
          >
            <option value="جميع المنصات">جميع المنصات</option>
            <option value="YouTube">▶️ YouTube</option>
            <option value="Facebook">📘 Facebook</option>
            <option value="Instagram">📸 Instagram</option>
            <option value="TikTok">🎵 TikTok</option>
          </select>
        </div>
      </div>

      {/* Featured Yemeni Content Section Header if active */}
      {activeTab === 'yemen' && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3">
          <span className="text-xl">🇾🇪</span>
          <div>
            <h4 className="font-bold text-sm text-emerald-300">شروحات ومحتوى الميكاترونكس في اليمن</h4>
            <p className="text-slate-300">شروحات ومشاريع تخرج ومحاضرات الدكاترة من الجامعات اليمنية (صنعاء، ذمار، التخصصية...).</p>
          </div>
        </div>
      )}

      {/* Video Grid Cards */}
      {loading ? (
        <div className="text-center py-20 space-y-3">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-bold">جاري تحميل الفيديوهات التعليمية الموثوقة...</p>
        </div>
      ) : displayedVideos.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4">
          <Video className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">لم يتم العثور على فيديوهات مطابقة للبحث</h3>
            <p className="text-xs text-slate-400">يمكنك طلب إضافة هذا الشرح وسيقوم مالك الأكاديمية بالبحث عنه وتوفيره مباشرة.</p>
          </div>
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
          >
            ➕ اطلب شرح هذا الموضوع الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedVideos.map((video) => {
            const isFav = favoriteIds.includes(video.id);
            return (
              <div
                key={video.id}
                onClick={() => handleOpenVideoModal(video)}
                className="group relative bg-slate-900 rounded-3xl border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                {/* Thumbnail Preview */}
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  {/* Play Overlay Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-wrap items-center gap-1.5">
                    {video.isYemeniContent && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow">
                        🇾🇪 محتوى يمني
                      </span>
                    )}
                    {video.isBestExplanation && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>أفضل شرح</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-300 border border-slate-800">
                    {video.platform === 'YouTube' && '▶️ YouTube'}
                    {video.platform === 'Facebook' && '📘 Facebook'}
                    {video.platform === 'Instagram' && '📸 Instagram'}
                    {video.platform === 'TikTok' && '🎵 TikTok'}
                  </div>

                  {video.duration && (
                    <span className="absolute bottom-3 left-3 bg-black/80 font-mono text-[10px] text-white px-2 py-0.5 rounded">
                      {video.duration}
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-cyan-400">{video.subject}</span>
                      <span>{video.level}</span>
                    </div>

                    <h3 className="font-black text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                      {video.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-medium">👨‍🏫 {video.channelName}</span>
                      {video.university && (
                        <span className="text-emerald-400 font-bold">🏫 {video.university}</span>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenVideoModal(video);
                        }}
                        className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>مشاهدة الدرس</span>
                      </button>

                      <button
                        onClick={(e) => toggleFavorite(video.id, e)}
                        className={`p-2 rounded-xl border transition cursor-pointer ${
                          isFav
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                        }`}
                        title="حفظ للمفضلة"
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => handleShareVideo(video, e)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 cursor-pointer"
                        title="مشاركة الرابط"
                      >
                        {copiedLinkId === video.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ACTIVE VIDEO PLAYBACK & DETAILS MODAL */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl relative animate-fade-in my-8">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Video Player or Fallback Box */}
            <div className="rounded-2xl overflow-hidden bg-black aspect-video relative border border-slate-800 shadow-2xl">
              {activeVideo.embedUrl && activeVideo.platform === 'YouTube' ? (
                <iframe
                  src={`${activeVideo.embedUrl}?autoplay=1&rel=0`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gradient-to-b from-slate-900 to-black">
                  <Video className="w-16 h-16 text-cyan-400" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-base">{activeVideo.title}</h3>
                    <p className="text-xs text-slate-400">
                      يتوفر هذا المحتوى على منصة {activeVideo.platform} الرسمية.
                    </p>
                  </div>
                  <a
                    href={activeVideo.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg"
                  >
                    <span>مشاهدة الفيديو على المنصة الأصلية</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Title & Metadata */}
            <div className="space-y-3 border-b border-slate-800 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-cyan-400">{activeVideo.subject} • {activeVideo.topic}</span>
                <span className="text-slate-400">{activeVideo.level}</span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                {activeVideo.title}
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                {activeVideo.description}
              </p>
            </div>

            {/* LINK TO REALISTIC VIRTUAL LAB INTEGRATION */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <Wrench className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-black text-emerald-300 text-sm">🔬 التطبيق العملي في المختبر الواقعي 3D</h4>
                  <p className="text-slate-300 text-[11px]">
                    بعد مشاهدة هذا الشرح، يمكنك الانتقال مباشرة للتجربة والمحاكاة التفاعلية لهذا الموضوع في المختبر الهندسي!
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveVideo(null);
                  if (onNavigateToTab) onNavigateToTab('lab');
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shrink-0 cursor-pointer shadow-md"
              >
                انتقل للمختبر الآن 🚀
              </button>
            </div>

            {/* SUGGESTED VIDEOS FOR THIS TOPIC */}
            {relatedVideos.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>فيديوهات مقترحة لهذا الموضوع:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {relatedVideos.map((rVid) => (
                    <div
                      key={rVid.id}
                      onClick={() => handleOpenVideoModal(rVid)}
                      className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 cursor-pointer flex items-center gap-3 transition"
                    >
                      <img src={rVid.thumbnailUrl} alt="" className="w-16 h-12 object-cover rounded-xl shrink-0" />
                      <div className="space-y-1 overflow-hidden">
                        <h5 className="font-bold text-white truncate text-[11px]">{rVid.title}</h5>
                        <span className="text-[10px] text-slate-400 block">{rVid.channelName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REQUEST LECTURE EXPLANATION MODAL */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-cyan-400" />
                <span>طلب إضافة شرح أو فيديو لمادة</span>
              </h3>
              <p className="text-xs text-slate-400">
                إذا لم تجد الفيديو الذي تبحث عنه، اكتب تفاصيل الشرح المطلوبة وسيقوم المالك بتوفيره في المكتبة.
              </p>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">المادة الهندسية:</label>
                <input
                  type="text"
                  required
                  value={requestSubject}
                  onChange={(e) => setRequestSubject(e.target.value)}
                  placeholder="مثال: الدوائر الكهربائية، التحكم الآلي، PLC..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">الموضوع المحدد:</label>
                <input
                  type="text"
                  required
                  value={requestTopic}
                  onChange={(e) => setRequestTopic(e.target.value)}
                  placeholder="مثال: قانون أوم، خوارزمية PID، دايودات الزينر..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">المستوى الدراسي:</label>
                <select
                  value={requestLevel}
                  onChange={(e) => setRequestLevel(e.target.value as StudyLevel)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="السنة الأولى">السنة الأولى</option>
                  <option value="السنة الثانية">السنة الثانية</option>
                  <option value="السنة الثالثة">السنة الثالثة</option>
                  <option value="السنة الرابعة">السنة الرابعة</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">وصف المحتوى المطلوب:</label>
                <textarea
                  rows={3}
                  value={requestDescription}
                  onChange={(e) => setRequestDescription(e.target.value)}
                  placeholder="اذكر تفاصيل إضافية عن نوع الشرح أو الرابط المفضل إن وجد..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRequest}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isSubmittingRequest ? 'جاري الإرسال...' : 'إرسال الطلب 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
